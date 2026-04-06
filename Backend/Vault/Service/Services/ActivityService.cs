using Core.DTOs;
using Core.DTOs.Activity;
using Core.DTOs.Identity;
using Core.Entities;
using Core.Repository;
using Core.Interfaces.Service;
using static Core.Constants.ConstAppConfiguration;
using Microsoft.AspNetCore.Http;
using System.Text.Json.Serialization;

namespace Service;
public class ActivityService : IActivityService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ActivityService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor) 
    { 
        _unitOfWork = unitOfWork; 
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<ResponseResult<IEnumerable<ActivityDetailsDto>>> GetAllAsync(CurrentUser currentUser)
    {
         var activities = await _unitOfWork.Activities.FindAsync(x => x.TenantId == currentUser.TenantId);
         var list = activities.ToList();
         var dtos = await EnrichActivities(list);
         return new ResponseResult<IEnumerable<ActivityDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<ActivityDetailsDto>> GetByIdAsync(string id, CurrentUser currentUser)
    {
        var entities = await _unitOfWork.Activities.FindAsync(x => x.Id == id && x.TenantId == currentUser.TenantId);
        var activity = entities.FirstOrDefault();
        if (activity == null) return new ResponseResult<ActivityDetailsDto>("Activity not found", ApiStatusCode.NotFound);
        
        var dtos = await EnrichActivities(new List<Activity> { activity });
        return new ResponseResult<ActivityDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> CreateAsync(Activity entity, CurrentUser currentUser)
    {
        entity.TenantId = currentUser.TenantId;
        entity.UserId = currentUser.UserId;
        await _unitOfWork.Activities.AddAsync(entity);
        return new ResponseResult<object>(null, ApiStatusCode.OK, "Created successfully");
    }

    public async Task<ResponseResult<object>> UpdateAsync(string id, Activity entity, CurrentUser currentUser)
    {
        var entities = await _unitOfWork.Activities.FindAsync(x => x.Id == id && x.TenantId == currentUser.TenantId);
        var existing = entities.FirstOrDefault();
        if (existing == null) return new ResponseResult<object>("Activity not found", ApiStatusCode.NotFound);

        entity.TenantId = currentUser.TenantId;
        entity.UserId = currentUser.UserId;
        await _unitOfWork.Activities.UpdateAsync(id, entity);
        return new ResponseResult<object>(null, ApiStatusCode.OK, "Updated successfully");
    }

    public async Task<ResponseResult<object>> DeleteAsync(string id, CurrentUser currentUser)
    {
        var entities = await _unitOfWork.Activities.FindAsync(x => x.Id == id && x.TenantId == currentUser.TenantId);
        if (!entities.Any()) return new ResponseResult<object>("Activity not found", ApiStatusCode.NotFound);

        await _unitOfWork.Activities.DeleteAsync(id);
        return new ResponseResult<object>(null, ApiStatusCode.OK, "Deleted successfully");
    }

    private async Task<List<ActivityDetailsDto>> EnrichActivities(IEnumerable<Activity> activities)
    {
        var dtos = activities.Select(a => new ActivityDetailsDto
        {
            Id = a.Id,
            TenantId = a.TenantId,
            WorkspaceId = a.WorkspaceId,
            DocumentId = a.DocumentId,
            UserId = a.UserId,
            Action = a.Action,
            Details = a.Details,
            CreatedAt = a.CreatedAt
        }).ToList();

        var userIds = dtos.Where(a => !string.IsNullOrEmpty(a.UserId)).Select(a => a.UserId!).Distinct().ToList();
        var workspaceIds = dtos.Where(a => !string.IsNullOrEmpty(a.WorkspaceId)).Select(a => a.WorkspaceId!).Distinct().ToList();
        var documentIds = dtos.Where(a => !string.IsNullOrEmpty(a.DocumentId)).Select(a => a.DocumentId!).Distinct().ToList();

        Console.WriteLine($"[Enrich] Batch size: {dtos.Count}. Users: {userIds.Count}, Workspaces: {workspaceIds.Count}, Docs: {documentIds.Count}");

        var userDict = new Dictionary<string, UserMap>();
        var wsDict = new Dictionary<string, Workspace>();
        var docDict = new Dictionary<string, Document>();

        foreach (var uid in userIds)
        {
            if (uid == "000000000000000000000000") continue;
            var user = await _unitOfWork.UserMaps.GetByIdAsync(uid);
            if (user != null) userDict[uid] = user;
        }

        foreach (var wid in workspaceIds)
        {
            var ws = await _unitOfWork.Workspaces.GetByIdAsync(wid);
            if (ws != null) wsDict[wid] = ws;
        }

        foreach (var did in documentIds)
        {
            var doc = await _unitOfWork.Documents.GetByIdAsync(did);
            if (doc != null) docDict[did] = doc;
        }

        var acceptLang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString() ?? "ar";
        bool isEnglish = acceptLang.StartsWith("en", StringComparison.OrdinalIgnoreCase);

        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.UserId))
            {
                if (userDict.TryGetValue(dto.UserId, out var user))
                {
                    dto.UserName = isEnglish ? (user.GrcNameEn ?? user.GrcNameAr) : (user.GrcNameAr ?? user.GrcNameEn);
                }
                else if (dto.UserId == "000000000000000000000000")
                {
                    dto.UserName = isEnglish ? "System" : "النظام";
                }
            }

            if (!string.IsNullOrEmpty(dto.WorkspaceId) && wsDict.TryGetValue(dto.WorkspaceId, out var ws))
            {
                dto.WorkspaceName = ws.Name;
            }

            if (!string.IsNullOrEmpty(dto.DocumentId) && docDict.TryGetValue(dto.DocumentId, out var doc))
            {
                dto.DocumentName = doc.Title;
            }
        }

        return dtos;
    }
}