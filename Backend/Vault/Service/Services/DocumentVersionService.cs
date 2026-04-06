using Core.DTOs;
using Core.DTOs.DocumentVersion;
using MongoDB.Bson;
using MongoDB.Driver.GridFS;
using Service.Helpers;
using static Core.Constants.ConstAppConfiguration;
using Microsoft.AspNetCore.Http; // Added

namespace Service;
public class DocumentVersionService : IDocumentVersionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGridFSBucket _gridFS;
    private readonly IWorkflowService _workflowService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IJsonLocalizationService _localizationService;

    public DocumentVersionService(IUnitOfWork unitOfWork, IWorkflowService workflowService, IHttpContextAccessor httpContextAccessor, IJsonLocalizationService localizationService) 
    { 
        _unitOfWork = unitOfWork;
        _workflowService = workflowService;
        _gridFS = new GridFSBucket(_unitOfWork.Database);
        _httpContextAccessor = httpContextAccessor;
        _localizationService = localizationService;
    }

    public async Task<ResponseResult<IEnumerable<DocumentVersionDetailsDto>>> GetAllAsync(string? documentId = null)
    {
        IEnumerable<DocumentVersion> versions;
        if (!string.IsNullOrEmpty(documentId))
        {
            var doc = await _unitOfWork.Documents.GetByIdAsync(documentId);
            // Removed blocking check for LegalHold on Get

            versions = await _unitOfWork.DocumentVersions.FindAsync(v => v.DocumentId == documentId);
            
            // Populate LegalHold from parent document for the list view
            if (doc != null)
            {
                foreach (var v in versions)
                {
                    v.LegalHold = doc.LegalHold;
                }
            }
        }
        else
        {
             versions = await _unitOfWork.DocumentVersions.GetAllAsync();
        }
        
        var dtos = await EnrichWithUserNames(versions);
        return new ResponseResult<IEnumerable<DocumentVersionDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<DocumentVersionDetailsDto>> GetByIdAsync(string id)
    {
        var version = await _unitOfWork.DocumentVersions.GetByIdAsync(id);
        if (version == null) return new ResponseResult<DocumentVersionDetailsDto>(_localizationService.Get("Msg_VersionNotFound"), ApiStatusCode.NotFound);
        var dtos = await EnrichWithUserNames(new[] { version });
        return new ResponseResult<DocumentVersionDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }

    public async Task<ResponseResult<DocumentVersion>> UploadDocumentVersionAsync(string documentId, Stream fileStream, string fileName, string userId, string tenantId)
    {
        var doc = await _unitOfWork.Documents.GetByIdAsync(documentId);
        if (doc == null) return new ResponseResult<DocumentVersion>(_localizationService.Get("Msg_DocumentNotFound"), ApiStatusCode.NotFound);

        if (doc.LegalHold)
             return new ResponseResult<DocumentVersion>(_localizationService.Get("Msg_VersionLegalHold"), ApiStatusCode.Forbidden);

        // Convert stream to byte array
        using var ms = new MemoryStream();
        await fileStream.CopyToAsync(ms);
        var fileBytes = ms.ToArray();

        // Calculate next version
        var existingVersions = await _unitOfWork.DocumentVersions.FindAsync(v => v.DocumentId == documentId);
        int nextVersion = 1;
        if (existingVersions.Any())
        {
            nextVersion = existingVersions.Max(v => v.Version) + 1;
        }

        doc.CurrentVersion = nextVersion;
        await _unitOfWork.Documents.UpdateAsync(documentId, doc);

        var version = new DocumentVersion
        {
            DocumentId = documentId,
            TenantId = tenantId,
            Version = nextVersion,
            FileName = fileName,
            FileContent = fileBytes, // Store content directly
            FileId = ObjectId.GenerateNewId().ToString(), // Generate dummy ID to satisfy validation
            FileSize = fileStream.Length,
            ContentType = MimeTypes.GetMimeType(fileName),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        await _unitOfWork.DocumentVersions.AddAsync(version);

        // Trigger Workflows
        try
        {
            var triggerContext = new BsonDocument
            {
                { "type", "VersionUpload" },
                { "document_id", documentId },
                { "workspace_id", doc.WorkspaceId ?? "" },
                { "user_id", userId },
                { "file_extension", Path.GetExtension(fileName) },
                { "file_name", fileName }
            };
            await _workflowService.EvaluateTriggersAsync(triggerContext);
        }
        catch (Exception ex)
        {
             Console.WriteLine($"Workflow Trigger Error: {ex.Message}");
        }

        return new ResponseResult<DocumentVersion>(version, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<StringModel>> DeleteAsync(string id)
    {
        var version = await _unitOfWork.DocumentVersions.GetByIdAsync(id);
        if (version != null && version.DocumentId != null)
        {
            var doc = await _unitOfWork.Documents.GetByIdAsync(version.DocumentId);
            if (doc != null && doc.LegalHold)
                return new ResponseResult<StringModel>(_localizationService.Get("Msg_VersionDeleteLegalHold"), ApiStatusCode.Forbidden);
        }
        if (version != null && !string.IsNullOrEmpty(version.FileId))
        {
            try
            {
                await _gridFS.DeleteAsync(new ObjectId(version.FileId));
            }
            catch (GridFSFileNotFoundException)
            {
                // Ignore if file is not found
            }
        }
        await _unitOfWork.DocumentVersions.DeleteAsync(id);
        return new ResponseResult<StringModel>(new StringModel { Value = _localizationService.Get("Msg_DeletedSuccessfully") }, ApiStatusCode.OK);
    }

    public async Task<(Stream Stream, string FileName, string ContentType)> DownloadAsync(string id)
    {
        var version = await _unitOfWork.DocumentVersions.GetByIdAsync(id);
        if (version == null)
            throw new FileNotFoundException("Version file not found.");

        Stream stream;
        if (version.FileContent != null && version.FileContent.Length > 0)
        {
            stream = new MemoryStream(version.FileContent);
        }
        else if (!string.IsNullOrEmpty(version.FileId))
        {
            stream = await _gridFS.OpenDownloadStreamAsync(new ObjectId(version.FileId));
        }
        else
        {
             throw new FileNotFoundException("Version content missing.");
        }
        
        return (stream, version.FileName, version.ContentType);
    }
    private async Task<List<DocumentVersionDetailsDto>> EnrichWithUserNames(IEnumerable<DocumentVersion> versions)
    {
        var dtos = versions.Select(v => new DocumentVersionDetailsDto
        {
            Id = v.Id,
            TenantId = v.TenantId,
            DocumentId = v.DocumentId,
            Version = v.Version,
            FileId = v.FileId,
            FileName = v.FileName,
            FileSize = v.FileSize,
            ContentType = v.ContentType,
            // FileContent = v.FileContent, // Usually don't want content in list
            CreatedBy = v.CreatedBy,
            CreatedAt = v.CreatedAt,
            LegalHold = v.LegalHold
        }).ToList();

        var userIds = new HashSet<string>();
        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy)) userIds.Add(dto.CreatedBy);
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
        }

        return dtos;
    }
}
