using Core.DTOs;
using Core.DTOs.Obligation;
using static Core.Constants.ConstAppConfiguration;
using Microsoft.AspNetCore.Http; // Added

namespace Service;
public class ObligationService : IObligationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IJsonLocalizationService _localizationService;
    private readonly IAuditLogService _auditLogService;

    public ObligationService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, IJsonLocalizationService localizationService, IAuditLogService auditLogService) 
    { 
        _unitOfWork = unitOfWork; 
        _httpContextAccessor = httpContextAccessor;
        _localizationService = localizationService;
        _auditLogService = auditLogService;
    }

    public async Task<ResponseResult<IEnumerable<ObligationDetailsDto>>> GetAllAsync()
    {
        var obligations = await _unitOfWork.Obligations.GetAllAsync();
        var dtos = await EnrichWithUserNames(obligations);
        return new ResponseResult<IEnumerable<ObligationDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<ObligationDetailsDto>> GetByIdAsync(string id)
    {
        var obligation = await _unitOfWork.Obligations.GetByIdAsync(id);
        if (obligation == null) return new ResponseResult<ObligationDetailsDto>(_localizationService.Get("Msg_ObligationNotFound"), ApiStatusCode.NotFound);
        var dtos = await EnrichWithUserNames(new[] { obligation });
        return new ResponseResult<ObligationDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Obligation>> CreateAsync(Obligation entity) 
    {
        await _unitOfWork.Obligations.AddAsync(entity);

        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value ?? entity.CreatedBy ?? "SYSTEM";
        await _auditLogService.LogAsync(
            actorUserId: userId,
            tenantId: entity.TenantId ?? "",
            action: "Create Obligation",
            entityType: "obligation",
            entityId: entity.Id,
            details: $"Created obligation: {entity.Title} for document {entity.DocumentId}"
        );

        return new ResponseResult<Obligation>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Obligation>> UpdateAsync(string id, Obligation entity) 
    {
        await _unitOfWork.Obligations.UpdateAsync(id, entity);

        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value ?? "SYSTEM";
        await _auditLogService.LogAsync(
            actorUserId: userId,
            tenantId: entity.TenantId ?? "",
            action: "Update Obligation",
            entityType: "obligation",
            entityId: id,
            details: $"Updated obligation: {entity.Title}. Status: {entity.Status}"
        );

        return new ResponseResult<Obligation>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> DeleteAsync(string id) 
    {
        var obligation = await _unitOfWork.Obligations.GetByIdAsync(id);
        if (obligation == null) return new ResponseResult<object>(_localizationService.Get("Msg_ObligationNotFound"), ApiStatusCode.NotFound);
        
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value ?? "SYSTEM";
        await _auditLogService.LogAsync(
            actorUserId: userId,
            tenantId: obligation.TenantId ?? "",
            action: "Delete Obligation",
            entityType: "obligation",
            entityId: id,
            details: $"Deleted obligation: {obligation.Title}"
        );

        await _unitOfWork.Obligations.DeleteAsync(id);
        return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_DeletedSuccessfully"));
    }

    public async Task<ResponseResult<IEnumerable<ObligationDetailsDto>>> GetUpcomingObligationsAsync(int days = 7)
    {
        var targetDate = DateTime.UtcNow.AddDays(days);
        var obligations = await _unitOfWork.Obligations.FindAsync(o => o.DueDate <= targetDate && o.Status != "Completed");
        var dtos = await EnrichWithUserNames(obligations);
        return new ResponseResult<IEnumerable<ObligationDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    private async Task<List<ObligationDetailsDto>> EnrichWithUserNames(IEnumerable<Obligation> obligations)
    {
        var dtos = obligations.Select(o => new ObligationDetailsDto
        {
            Id = o.Id,
            TenantId = o.TenantId,
            DocumentId = o.DocumentId,
            Title = o.Title,
            Description = o.Description,
            DueDate = o.DueDate,
            Status = o.Status,
            AssignedTo = o.AssignedTo,
            CreatedBy = o.CreatedBy,
            CreatedAt = o.CreatedAt
        }).ToList();

        var userIds = new HashSet<string>();
        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy)) userIds.Add(dto.CreatedBy);
            if (!string.IsNullOrEmpty(dto.AssignedTo)) userIds.Add(dto.AssignedTo);
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

            if (!string.IsNullOrEmpty(dto.AssignedTo) && userMapDict.TryGetValue(dto.AssignedTo, out var assignedToMap))
            {
                dto.AssignedToName = isEnglish ? assignedToMap.GrcNameEn : assignedToMap.GrcNameAr;
            }
        }

        return dtos;
    }
}