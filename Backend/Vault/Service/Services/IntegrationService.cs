using Core.DTOs.Identity;
using Core.DTOs.Integration;
using Core.DTOs.Workspace;
using Core.Interfaces.Service;
using ApiStatusCode = Core.Constants.ConstAppConfiguration.ApiStatusCode;

namespace Service.Services;

/// <summary>
/// خدمة التكامل مع الأنظمة الخارجية (GRC وغيرها)
/// </summary>
public class IntegrationService : IIntegrationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWorkspaceService _workspaceService;
    private readonly IDocumentService _documentService;
    private readonly IAuditLogService _auditLogService;
    private readonly IJsonLocalizationService _localizationService;

    public IntegrationService(IUnitOfWork unitOfWork, IWorkspaceService workspaceService, IDocumentService documentService, IAuditLogService auditLogService, IJsonLocalizationService localizationService)
    {
        _unitOfWork = unitOfWork;
        _workspaceService = workspaceService;
        _documentService = documentService;
        _auditLogService = auditLogService;
        _localizationService = localizationService;
    }

    /// <inheritdoc/>
    public async Task<ResponseResult<CreateSubWorkspaceWithFilesResult>> CreateSubWorkspaceWithFilesAsync(CreateSubWorkspaceWithFilesRequest request, IEnumerable<(Stream FileStream, string FileName)> fileStreams, CurrentUser currentUser, CancellationToken cancellationToken = default)
    {
        // ── 1. التحقق من وجود الـ Parent Workspace ──────────────────────────────
        var parentWorkspace = (await _unitOfWork.Workspaces.FindAsync(w => w.Type == request.WorkspaceType && w.TenantId == currentUser.TenantId && !w.IsDeleted)).FirstOrDefault();

        if (parentWorkspace == null)
        {
            return new ResponseResult<CreateSubWorkspaceWithFilesResult>(_localizationService.Get("Msg_WorkspaceNotFound"), ApiStatusCode.NotFound);
        }

        // ── 2. إنشاء الـ Sub-Workspace ───────────────────────────────────────────
        var createWorkspaceRequest = new CreateWorkspaceRequestDto
        {
            Name          = request.Name,
            Slug          = GenerateSlug(request.Name),
            Description   = request.Description,
            Type          = request.Type,
            ParentId      = parentWorkspace.Id,
            IsQuickAccess = false,
            LegalHold     = false,
            Settings      = request.Settings
        };

        var workspaceResult = await _workspaceService.CreateWorkspaceAsync(createWorkspaceRequest, currentUser);

        if (!workspaceResult.IsSucceeded || workspaceResult.ReturnData == null)
        {
            return new ResponseResult<CreateSubWorkspaceWithFilesResult>(workspaceResult.ErrorMessage ?? "Failed to create sub-workspace", ApiStatusCode.BadRequest);
        }

        var createdWorkspace = workspaceResult.ReturnData;
        var result = new CreateSubWorkspaceWithFilesResult
        {
            Workspace = new SubWorkspaceSummary
            {
                Id          = createdWorkspace.Id,
                Name        = createdWorkspace.Name,
                ParentId    = createdWorkspace.ParentId,
                Description = createdWorkspace.Description,
                Type        = createdWorkspace.Type,
                CreatedAt   = createdWorkspace.CreatedAt
            }
        };

        // ── 3. رفع الملفات داخل الـ Sub-Workspace ────────────────────────────────
        var fileStreamsList = fileStreams?.ToList() ?? new List<(Stream, string)>();
        var fileDtosList    = request.Files ?? new List<SubWorkspaceFileDto>();

        int successCount = 0;
        int failedCount  = 0;

        for (int i = 0; i < fileStreamsList.Count; i++)
        {
            var (fileStream, fileName) = fileStreamsList[i];
            var fileDto = (i < fileDtosList.Count) ? fileDtosList[i] : null;

            var documentSummary = new SubWorkspaceDocumentSummary
            {
                Title = fileDto?.Title ?? System.IO.Path.GetFileNameWithoutExtension(fileName)
            };

            try
            {
                var docDto = new Core.DTOs.Document.CreateDocumentDto
                {
                    Title        = fileDto?.Title ?? System.IO.Path.GetFileNameWithoutExtension(fileName),
                    WorkspaceId  = createdWorkspace.Id,
                    DocumentType = fileDto?.DocumentType ?? string.Empty,
                    Status       = fileDto?.Status ?? "Final",
                    Tags         = fileDto?.Tags ?? new List<string>()
                };

                var uploadResult = await _documentService.UploadDocumentAsync(
                    docDto,
                    fileStream,
                    fileName,
                    currentUser);

                if (uploadResult.IsSucceeded && uploadResult.ReturnData != null)
                {
                    documentSummary.Id         = uploadResult.ReturnData.Id;
                    documentSummary.Status     = uploadResult.ReturnData.Status ?? docDto.Status ?? "Final";
                    documentSummary.IsUploaded = true;
                    successCount++;
                }
                else
                {
                    documentSummary.IsUploaded  = false;
                    documentSummary.ErrorMessage = uploadResult.ErrorMessage;
                    failedCount++;
                }
            }
            catch (Exception ex)
            {
                documentSummary.IsUploaded   = false;
                documentSummary.ErrorMessage = ex.Message;
                failedCount++;
            }

            result.CreatedDocuments.Add(documentSummary);
        }

        result.SuccessCount = successCount;
        result.FailedCount  = failedCount;

        // ── 4. Audit Log ─────────────────────────────────────────────────────────
        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId:    currentUser.TenantId!,
            action:      "GRC Integration - Create Sub-Workspace With Files",
            entityType:  "workspace",
            entityId:    createdWorkspace.Id ?? string.Empty,
            details:     $"Created sub-workspace '{createdWorkspace.Name}' under '{parentWorkspace.Name}' " +
                         $"with {successCount} document(s) uploaded successfully, {failedCount} failed."
        );

        return new ResponseResult<CreateSubWorkspaceWithFilesResult>(result, ApiStatusCode.OK);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    /// <summary>
    /// توليد slug بسيط من الاسم
    /// </summary>
    private static string GenerateSlug(string name)
        => name.ToLowerInvariant().Replace(" ", "-").Replace("_", "-");
}
