using Core.DTOs;
using Core.DTOs.Document;
using Core.DTOs.Identity;
using MongoDB.Bson;
using MongoDB.Driver.GridFS;
using Service.Helpers;
using static Core.Constants.ConstAppConfiguration;
using Core.Constants;
using Microsoft.AspNetCore.Http; 
using Core.Interfaces.Service;

namespace Service;
public class DocumentService : IDocumentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGridFSBucket _gridFS;
    private readonly IWorkflowService _workflowService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IWorkflowAssignmentService _workflowAssignmentService;
    private readonly IWorkflowInstanceService _workflowInstanceService;
    private readonly IJsonLocalizationService _localizationService;
    private readonly IAuditLogService _auditLogService;

    public DocumentService(IUnitOfWork unitOfWork, IWorkflowService workflowService, IHttpContextAccessor httpContextAccessor, IWorkflowAssignmentService workflowAssignmentService, IWorkflowInstanceService workflowInstanceService, IJsonLocalizationService localizationService, IAuditLogService auditLogService)
    {
        _unitOfWork = unitOfWork;
        _workflowService = workflowService;
        _gridFS = new GridFSBucket(_unitOfWork.Database);
        _httpContextAccessor = httpContextAccessor;
        _workflowAssignmentService = workflowAssignmentService;
        _workflowInstanceService = workflowInstanceService;
        _localizationService = localizationService;
        _auditLogService = auditLogService;
    }

    public async Task<ResponseResult<IEnumerable<DocumentDetailsDto>>> GetAllAsync(CurrentUser currentUser)
    {
        var docs = await _unitOfWork.Documents.FindAsync(d => d.TenantId == currentUser.TenantId && !d.IsDeleted);
        var isVaultAdmin = await IsVaultAdminAsync(currentUser);
        docs = docs.Where(d => d.Status != "Pending" || isVaultAdmin || d.OwnerUserId == currentUser.UserId).ToList();
        var dtos = await EnrichWithUserNames(docs);
        return new ResponseResult<IEnumerable<DocumentDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<DocumentDetailsDto>> GetByIdAsync(string id, CurrentUser currentUser)
    {
        var doc = (await _unitOfWork.Documents.FindAsync(d => d.Id == id && d.TenantId == currentUser.TenantId && !d.IsDeleted)).FirstOrDefault();
        if (doc == null) return new ResponseResult<DocumentDetailsDto>(_localizationService.Get("Msg_DocumentNotFound"), ApiStatusCode.NotFound);
        
        // Security check for 'Pending' docs
        if (doc.Status == "Pending")
        {
            var isVaultAdmin = await IsVaultAdminAsync(currentUser);
            if (!isVaultAdmin && doc.OwnerUserId != currentUser.UserId)
            {
                return new ResponseResult<DocumentDetailsDto>(_localizationService.Get("Msg_DocumentNotFound"), ApiStatusCode.NotFound);
            }
        }

        var dtos = await EnrichWithUserNames(new[] { doc });
        return new ResponseResult<DocumentDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<DocumentDetailsDto>>> GetByWorkspaceIdAsync(string workspaceId, CurrentUser currentUser)
    {
        var docs = await _unitOfWork.Documents.FindAsync(d => d.WorkspaceId == workspaceId && d.TenantId == currentUser.TenantId && !d.IsDeleted);
        
        // Filter out 'Pending' docs for non-admins and non-owners
        var isVaultAdmin = await IsVaultAdminAsync(currentUser);
        docs = docs.Where(d => d.Status != "Pending" || isVaultAdmin || d.OwnerUserId == currentUser.UserId).ToList();

        var dtos = await EnrichWithUserNames(docs);
        return new ResponseResult<IEnumerable<DocumentDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    // Allowed document file extensions for upload validation (MUS-732)
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
        ".odt", ".ods", ".odp", ".rtf", ".txt", ".csv",
        ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".tif", ".webp", ".svg",
        ".json", ".xml", ".zip", ".rar", ".7z"
    };

    public async Task<ResponseResult<Document>> UploadDocumentAsync(CreateDocumentDto dto, Stream fileStream, string fileName, CurrentUser currentUser)
    {
        // MUS-732: Validate file extension before processing
        var fileExtension = Path.GetExtension(fileName);
        if (string.IsNullOrEmpty(fileExtension) || !AllowedExtensions.Contains(fileExtension))
        {
            return new ResponseResult<Document>(
                _localizationService.Get("Msg_FileTypeNotAllowed") ?? $"File type '{fileExtension}' is not allowed. Permitted types: PDF, Word, Excel, PowerPoint, images, and archives.",
                ApiStatusCode.BadRequest);
        }

        // Check workspace for legal hold
        bool legalHold = false;
        if (!string.IsNullOrEmpty(dto.WorkspaceId))
        {
            var workspace = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == dto.WorkspaceId && w.TenantId == currentUser.TenantId)).FirstOrDefault();
            if (workspace != null)
            {
                legalHold = workspace.LegalHold;

                // MUS-730: Enforce storage limit per workspace
                if (workspace.Settings?.StorageLimitMb > 0)
                {
                    var existingDocs = await _unitOfWork.DocumentVersions.FindAsync(v =>
                        v.TenantId == currentUser.TenantId);
                    var workspaceDocs = await _unitOfWork.Documents.FindAsync(d =>
                        d.WorkspaceId == dto.WorkspaceId && d.TenantId == currentUser.TenantId && !d.IsDeleted);
                    var workspaceDocIds = workspaceDocs.Where(d => d.Id != null).Select(d => d.Id!).ToHashSet();

                    long currentUsageBytes = existingDocs
                        .Where(v => v.DocumentId != null && workspaceDocIds.Contains(v.DocumentId))
                        .Sum(v => (long)v.FileSize);

                    long incomingBytes = fileStream.CanSeek ? fileStream.Length : 0;
                    long limitBytes = (long)workspace.Settings.StorageLimitMb * 1024 * 1024;

                    if (currentUsageBytes + incomingBytes > limitBytes)
                    {
                        return new ResponseResult<Document>(
                            _localizationService.Get("Msg_StorageLimitExceeded") ?? $"Storage limit exceeded. Workspace limit is {workspace.Settings.StorageLimitMb} MB.",
                            ApiStatusCode.BadRequest);
                    }
                }
            }
        }
        
        // CHECK WORKFLOW (Blocking Upload)
        string? targetId = !string.IsNullOrEmpty(dto.ParentId) ? dto.ParentId : dto.WorkspaceId;
        bool hasBlockingWorkflow = false;
        Core.Entities.Workflow? workflow = null;

        if (!string.IsNullOrEmpty(targetId))
        {
             var workflowResult = await _workflowAssignmentService.GetApplicableWorkflowAsync(targetId, "Upload", currentUser.UserId ?? string.Empty, dto.DocumentType);
             if (workflowResult.IsSucceeded && workflowResult.ReturnData != null)
             {
                 workflow = workflowResult.ReturnData;
                 hasBlockingWorkflow = true;
             }
        }

        var document = new Document
        {
            Title = string.IsNullOrEmpty(dto.Title) ? fileName : dto.Title,
            WorkspaceId = dto.WorkspaceId,
            ParentId = dto.ParentId,
            DocumentType = dto.DocumentType,
            Tags = dto.Tags,
            CreatedAt = DateTime.UtcNow,
            Status = hasBlockingWorkflow ? "Pending" : (dto.Status ?? "Draft"),
            TenantId = currentUser.TenantId,
            OwnerUserId = currentUser.UserId,
            CreatedBy = currentUser.UserId,
            CurrentVersion = 0,
            LegalHold = legalHold
        };

        await _unitOfWork.Documents.AddAsync(document);

        // Convert stream to byte array
        var fileBytes = new byte[0];
        if (fileStream.CanSeek)
            fileStream.Position = 0;
            
        using (var ms = new MemoryStream())
        {
            await fileStream.CopyToAsync(ms);
            fileBytes = ms.ToArray();
        }

        document.CurrentVersion = 1;
        await _unitOfWork.Documents.UpdateAsync(document.Id!, document);

        var version = new DocumentVersion
        {
            DocumentId = document.Id,
            TenantId = currentUser.TenantId,
            Version = 1,
            FileName = fileName,
            FileContent = fileBytes,
            FileId = ObjectId.GenerateNewId().ToString(),
            FileSize = fileBytes.Length,
            ContentType = MimeTypes.GetMimeType(fileName),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUser.UserId
        };

        await _unitOfWork.DocumentVersions.AddAsync(version);

        // If a blocking workflow exists, start it with the saved document_id in context
        if (hasBlockingWorkflow && workflow != null && !string.IsNullOrEmpty(targetId))
        {
            var context = new BsonDocument
            {
                { "trigger_type", "Event" },
                { "trigger_code", "Upload" }, // Hardcoded since ConstWorkflowTriggers.Upload was removed
                { "target_id", document.Id! }, // The document is the target to approve!
                { "target_type", "Document" },
                { "container_id", targetId },
                { "data", new BsonDocument {
                    { "fileName", fileName },
                    { "fileSize", fileBytes.Length },
                    { "documentTitle", document.Title ?? "" }
                }}
            };

            try
            {
                await _workflowInstanceService.StartWorkflowAsync(workflow.Id!, dto.WorkspaceId ?? "", currentUser.UserId ?? string.Empty, context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Workflow Start Error after upload: {ex.Message}");
            }

            await _auditLogService.LogAsync(
                actorUserId: currentUser.UserId!,
                tenantId: currentUser.TenantId!,
                action: "Upload Document (Pending Approval)",
                entityType: "document",
                entityId: document.Id,
                details: $"Uploaded document '{document.Title}' - awaiting workflow approval"
            );

            return new ResponseResult<Document>(document, ApiStatusCode.OK, _localizationService.Get("Msg_DocumentWorkflowInitiated"));
        }

        // Trigger Workflows
        try
        {
            var triggerContext = new BsonDocument
            {
                { "type", "DocumentUpload" },
                { "document_id", document.Id },
                { "workspace_id", document.WorkspaceId ?? "" },
                { "user_id", document.OwnerUserId },
                { "file_extension", Path.GetExtension(fileName) },
                { "file_name", fileName }
            };
            await _workflowService.EvaluateTriggersAsync(triggerContext);

            // Process explicit assignments
            await _workflowAssignmentService.ProcessAssignmentsAsync(document.Id!, currentUser.UserId ?? string.Empty);
        }
        catch (Exception ex)
        {
            // Log error but don't fail upload
            Console.WriteLine($"Workflow Trigger Error: {ex.Message}");
        }

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Upload Document",
            entityType: "document",
            entityId: document.Id,
            details: $"Uploaded document: {document.Title}"
        );

        return new ResponseResult<Document>(document, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Document>> UpdateAsync(string id, UpdateDocumentDto dto, CurrentUser currentUser)
    {
        var document = (await _unitOfWork.Documents.FindAsync(d => d.Id == id && d.TenantId == currentUser.TenantId && !d.IsDeleted)).FirstOrDefault();
        if (document == null) return new ResponseResult<Document>(_localizationService.Get("Msg_DocumentNotFound"), ApiStatusCode.NotFound);

        if (document.LegalHold)
            return new ResponseResult<Document>(_localizationService.Get("Msg_DocumentLegalHoldUpdate"), ApiStatusCode.Forbidden);

        // Also block if the parent workspace has legalHold
        if (!string.IsNullOrEmpty(document.WorkspaceId))
        {
            var ws = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == document.WorkspaceId && w.TenantId == currentUser.TenantId)).FirstOrDefault();
            if (ws != null && ws.LegalHold)
                return new ResponseResult<Document>(_localizationService.Get("Msg_WorkspaceLegalHold"), ApiStatusCode.Forbidden);
        }

        // CHECK WORKFLOW (Blocking Update/Edit)
        var workflowResult = await _workflowAssignmentService.GetApplicableWorkflowAsync(id, "Update", currentUser.UserId ?? string.Empty); // OR 'Edit'
        if (workflowResult.IsSucceeded && workflowResult.ReturnData != null)
        {
             var workflow = workflowResult.ReturnData;
             var context = new BsonDocument
             {
                 { "trigger_type", "Event" },
                 { "trigger_code", "Update" },
                 { "target_id", id },
                 { "target_type", "Document" },
                 { "data", new BsonDocument { 
                     { "title", dto.Title ?? string.Empty }
                 }}
             };

             try 
             {
                 await _workflowInstanceService.StartWorkflowAsync(workflow.Id!, document.WorkspaceId ?? "", currentUser.UserId ?? string.Empty, context);
                 
                 await _auditLogService.LogAsync(
                     actorUserId: currentUser.UserId!,
                     tenantId: currentUser.TenantId!,
                     action: "Update Document (Pending Workflow Approval)",
                     entityType: "document",
                     entityId: id,
                     details: $"Update for document '{document.Title}' is pending workflow '{workflow.Name}' approval"
                 );

                 return new ResponseResult<Document>((string)_localizationService.Get("Msg_DocumentWorkflowUpdate") ?? "Update pending workflow approval", ApiStatusCode.WorkflowRequired);
             }
             catch (Exception ex)
             {
                 Console.WriteLine($"[DocumentService Update] Workflow Exception: {ex.Message}\n{ex.StackTrace}");
                 return new ResponseResult<Document>(_localizationService.Get("Msg_DocumentWorkflowFailed", ex.Message) ?? ex.Message, ApiStatusCode.BadRequest);
             }
        }

        document.Title = dto.Title;
        document.Status = dto.Status;
        document.Tags = dto.Tags;
        
        await _unitOfWork.Documents.UpdateAsync(id, document);

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Update Document",
            entityType: "document",
            entityId: id,
            details: $"Updated document: {document.Title}"
        );

        return new ResponseResult<Document>(document, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<StringModel>> DeleteAsync(string id, CurrentUser currentUser)
    {
        var document = (await _unitOfWork.Documents.FindAsync(d => d.Id == id && d.TenantId == currentUser.TenantId && !d.IsDeleted)).FirstOrDefault();
        if (document == null) return new ResponseResult<StringModel>(_localizationService.Get("Msg_DocumentNotFound"), ApiStatusCode.NotFound);

        // CHECK WORKFLOW (Blocking)
        var workflowResult = await _workflowAssignmentService.GetApplicableWorkflowAsync(id, "Delete", currentUser.UserId ?? string.Empty);
        if (workflowResult.IsSucceeded && workflowResult.ReturnData != null)
        {
             // Start Workflow Instance
             var workflow = workflowResult.ReturnData;
             var context = new BsonDocument
             {
                 { "trigger_type", "Event" },
                 { "trigger_code", "Delete" },
                 { "target_id", document.Id },
                 { "target_type", "Document" },
                 { "data", new BsonDocument { 
                     { "title", document.Title ?? string.Empty }
                 }}
             };

             try 
             {
                 await _workflowInstanceService.StartWorkflowAsync(workflow.Id!, document.WorkspaceId ?? "", currentUser.UserId ?? string.Empty, context);
                 
                 await _auditLogService.LogAsync(
                     actorUserId: currentUser.UserId!,
                     tenantId: currentUser.TenantId!,
                     action: "Delete Document (Pending Workflow Approval)",
                     entityType: "document",
                     entityId: id,
                     details: $"Deletion for document '{document.Title}' is pending workflow '{workflow.Name}' approval"
                 );

                 // BLOCK ACTION
                 return new ResponseResult<StringModel>((string)_localizationService.Get("Msg_DocumentWorkflowDelete") ?? "Delete pending workflow approval", ApiStatusCode.WorkflowRequired);
             }
             catch (Exception ex)
             {
                 Console.WriteLine($"[DocumentService Delete] Workflow Exception: {ex.Message}\n{ex.StackTrace}");
                 return new ResponseResult<StringModel>(_localizationService.Get("Msg_DocumentWorkflowFailed", ex.Message) ?? ex.Message, ApiStatusCode.BadRequest);
             }
        }

        if (document.LegalHold)
             return new ResponseResult<StringModel>(_localizationService.Get("Msg_DocumentLegalHoldDelete"), ApiStatusCode.Forbidden);

        // Also block if parent workspace has legalHold
        if (!string.IsNullOrEmpty(document.WorkspaceId))
        {
            var ws = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == document.WorkspaceId && w.TenantId == currentUser.TenantId)).FirstOrDefault();
            if (ws != null && ws.LegalHold)
                return new ResponseResult<StringModel>(_localizationService.Get("Msg_WorkspaceLegalHold"), ApiStatusCode.Forbidden);
        }

        document.IsDeleted = true;
        document.DeletedAt = DateTime.UtcNow;
        document.DeletedBy = currentUser.UserId;
        await _unitOfWork.Documents.UpdateAsync(id, document);

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Delete Document",
            entityType: "document",
            entityId: id,
            details: $"Deleted document: {document.Title}"
        );

        return new ResponseResult<StringModel>(new StringModel { Value = _localizationService.Get("Msg_DeletedSuccessfully") }, ApiStatusCode.OK);
    }

    public async Task<(Stream Stream, string FileName, string ContentType)> DownloadAsync(string id, CurrentUser currentUser, bool isPreview = false)
    {
        // First verify document exists and belongs to tenant
        var document = (await _unitOfWork.Documents.FindAsync(d => d.Id == id && d.TenantId == currentUser.TenantId && !d.IsDeleted)).FirstOrDefault();
        if (document == null) throw new FileNotFoundException("Document not found.");

        var versions = await _unitOfWork.DocumentVersions.FindAsync(v => v.DocumentId == id);
        var latestVersion = versions.OrderByDescending(v => v.Version).FirstOrDefault();
        
        if (latestVersion == null)
            throw new FileNotFoundException("Document file not found.");

        Stream stream;
        if (latestVersion.FileContent != null && latestVersion.FileContent.Length > 0)
        {
            stream = new MemoryStream(latestVersion.FileContent);
        }
        else if (!string.IsNullOrEmpty(latestVersion.FileId))
        {
             stream = await _gridFS.OpenDownloadStreamAsync(new ObjectId(latestVersion.FileId));
        }
        else
        {
            throw new FileNotFoundException("Document content missing.");
        }

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: isPreview ? "Preview Document" : "Download Document",
            entityType: "document",
            entityId: id,
            details: (isPreview ? "Previewed document: " : "Downloaded document: ") + document.Title
        );

        if (isPreview && latestVersion.FileName != null &&
            (latestVersion.FileName.EndsWith(".doc", StringComparison.OrdinalIgnoreCase) ||
             latestVersion.FileName.EndsWith(".docx", StringComparison.OrdinalIgnoreCase)))
        {
            try
            {
                var outStream = new MemoryStream();
                using (var wordDoc = new Spire.Doc.Document())
                {
                    wordDoc.LoadFromStream(stream, Spire.Doc.FileFormat.Auto);
                    wordDoc.SaveToStream(outStream, Spire.Doc.FileFormat.PDF);
                }
                outStream.Position = 0;
                return (outStream, System.IO.Path.ChangeExtension(latestVersion.FileName, ".pdf"), "application/pdf");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Preview conversion failed: {ex.Message}");
                // Fallback to original stream if conversion fails
                stream.Position = 0;
            }
        }

        return (stream, latestVersion.FileName ?? "Unknown", latestVersion.ContentType ?? "application/octet-stream");
    }

    private async Task<List<DocumentDetailsDto>> EnrichWithUserNames(IEnumerable<Document> documents)
    {
        var dtos = documents.Select(d => new DocumentDetailsDto
        {
            Id = d.Id,
            TenantId = d.TenantId,
            WorkspaceId = d.WorkspaceId,
            ParentId = d.ParentId,
            Title = d.Title,
            DocumentType = d.DocumentType,
            Status = d.Status,
            CurrentVersion = d.CurrentVersion,
            OwnerUserId = d.OwnerUserId,
            Tags = d.Tags,
            CreatedBy = d.CreatedBy,
            CreatedAt = d.CreatedAt,
            LegalHold = d.LegalHold
        }).ToList();

        var userIds = new HashSet<string>();
        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy)) userIds.Add(dto.CreatedBy);
            if (!string.IsNullOrEmpty(dto.OwnerUserId)) userIds.Add(dto.OwnerUserId);
        }

        if (!userIds.Any()) return dtos;

        var userMaps = await _unitOfWork.UserMaps.FindAsync(u => u.Id != null && userIds.Contains(u.Id));
        var userMapDict = userMaps.Where(u => u.Id != null).ToDictionary(u => u.Id!, u => u);

        var lang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString() ?? "ar";
        bool isEnglish = lang.Contains("en", StringComparison.OrdinalIgnoreCase);

        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy) && userMapDict.TryGetValue(dto.CreatedBy, out var createdByMap))
            {
                dto.CreatedByName = isEnglish ? createdByMap.GrcNameEn : createdByMap.GrcNameAr;
            }

            if (!string.IsNullOrEmpty(dto.OwnerUserId) && userMapDict.TryGetValue(dto.OwnerUserId, out var ownerMap))
            {
                dto.OwnerName = isEnglish ? ownerMap.GrcNameEn : ownerMap.GrcNameAr;
            }
        }

        return dtos;
    }

    private async Task<bool> IsVaultAdminAsync(CurrentUser currentUser)
    {
        if (string.IsNullOrEmpty(currentUser.UserId) || string.IsNullOrEmpty(currentUser.TenantId))
            return false;

        // Get the admin role by code
        var adminRole = (await _unitOfWork.Roles.FindAsync(r => r.Code == ConstRoles.Admin)).FirstOrDefault();
        if (adminRole == null || string.IsNullOrEmpty(adminRole.Id))
            return false;

        // Check if this user has the admin role assigned
        var userAdminRole = (await _unitOfWork.UserRoles.FindAsync(
            ur => ur.UserId == currentUser.UserId && 
                  ur.RoleId == adminRole.Id && 
                  ur.TenantId == currentUser.TenantId
        )).FirstOrDefault();

        return userAdminRole != null;
    }
}
