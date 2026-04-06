using Core.DTOs;
using Core.DTOs.AgentActionLog;
using static Core.Constants.ConstAppConfiguration;
using Microsoft.AspNetCore.Http;

namespace Service;
public class AgentActionLogService : IAgentActionLogService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AgentActionLogService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor) 
    { 
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<ResponseResult<IEnumerable<AgentActionLogDetailsDto>>> GetAllAsync()
    {
        var logs = await _unitOfWork.AgentActionLogs.GetAllAsync();
        var dtos = await EnrichWithUserNames(logs);
        return new ResponseResult<IEnumerable<AgentActionLogDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<AgentActionLogDetailsDto>> GetByIdAsync(string id)
    {
        var log = await _unitOfWork.AgentActionLogs.GetByIdAsync(id);
        if (log == null) return new ResponseResult<AgentActionLogDetailsDto>("Action log not found", ApiStatusCode.NotFound);
        var dtos = await EnrichWithUserNames(new[] { log });
        return new ResponseResult<AgentActionLogDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }
    public async Task<ResponseResult<AgentActionLog>> CreateAsync(AgentActionLog entity) 
    {
        await _unitOfWork.AgentActionLogs.AddAsync(entity);
        return new ResponseResult<AgentActionLog>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<AgentActionLog>> UpdateAsync(string id, AgentActionLog entity) 
    {
        await _unitOfWork.AgentActionLogs.UpdateAsync(id, entity);
        return new ResponseResult<AgentActionLog>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> DeleteAsync(string id) 
    {
        var log = await _unitOfWork.AgentActionLogs.GetByIdAsync(id);
        if (log == null) return new ResponseResult<object>("Action log not found", ApiStatusCode.NotFound);
        await _unitOfWork.AgentActionLogs.DeleteAsync(id);
        return new ResponseResult<object>(null, ApiStatusCode.OK, "Deleted successfully");
    }

    public async Task<ResponseResult<IEnumerable<AgentActionLogDetailsDto>>> GetPendingAsync()
    {
        var logs = await _unitOfWork.AgentActionLogs.FindAsync(a => a.ApprovalStatus == "Pending");
        var dtos = await EnrichWithUserNames(logs);
        return new ResponseResult<IEnumerable<AgentActionLogDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> ApproveAsync(string id)
    {
        var action = await _unitOfWork.AgentActionLogs.GetByIdAsync(id);
        if (action != null)
        {
            action.ApprovalStatus = "Approved";
            await _unitOfWork.AgentActionLogs.UpdateAsync(id, action);
            return new ResponseResult<object>(null, ApiStatusCode.OK, "Approved");
        }
        return new ResponseResult<object>("Action log not found", ApiStatusCode.NotFound);
    }

    public async Task<ResponseResult<object>> RejectAsync(string id)
    {
        var action = await _unitOfWork.AgentActionLogs.GetByIdAsync(id);
        if (action != null)
        {
            action.ApprovalStatus = "Rejected";
            await _unitOfWork.AgentActionLogs.UpdateAsync(id, action);
            return new ResponseResult<object>(null, ApiStatusCode.OK, "Rejected");
        }
        return new ResponseResult<object>("Action log not found", ApiStatusCode.NotFound);
    }

    private async Task<List<AgentActionLogDetailsDto>> EnrichWithUserNames(IEnumerable<AgentActionLog> logs)
    {
        var dtos = logs.Select(a => new AgentActionLogDetailsDto
        {
            Id = a.Id,
            TenantId = a.TenantId,
            AgentType = a.AgentType,
            TriggeredBy = a.TriggeredBy,
            ProposedAction = a.ProposedAction,
            ApprovalStatus = a.ApprovalStatus,
            CreatedAt = a.CreatedAt,
            CreatedBy = a.CreatedBy
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