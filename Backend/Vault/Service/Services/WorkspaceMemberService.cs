namespace Service;
using System.Collections.Generic;
using System.Linq;
using System;
using Core.DTOs.WorkspaceMember;
using Core.Interfaces.Service;
using Core.Entities;
using Core.DTOs.Profile;
using Core.Repository;
using Core.DTOs;
using static Core.Constants.ConstAppConfiguration;
using Microsoft.AspNetCore.Http; // Added

public class WorkspaceMemberService : IWorkspaceMemberService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGRCService _grcService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IJsonLocalizationService _localizationService;

    public WorkspaceMemberService(IUnitOfWork unitOfWork, IGRCService grcService, IHttpContextAccessor httpContextAccessor, IJsonLocalizationService localizationService) 
    { 
        _unitOfWork = unitOfWork;
        _grcService = grcService;
        _httpContextAccessor = httpContextAccessor;
        _localizationService = localizationService;
    }

    public async Task<ResponseResult<IEnumerable<WorkspaceMember>>> GetAllAsync() 
    {
        var members = await _unitOfWork.WorkspaceMembers.GetAllAsync();
        return new ResponseResult<IEnumerable<WorkspaceMember>>(members, ApiStatusCode.OK); 
    }

    public async Task<ResponseResult<IEnumerable<WorkspaceMemberDetailsDto>>> GetByWorkspaceIdAsync(string workspaceId)
    {
        var members = await _unitOfWork.WorkspaceMembers.FindAsync(x => x.WorkspaceId == workspaceId);
        var result = await EnrichMembers(members);
        return new ResponseResult<IEnumerable<WorkspaceMemberDetailsDto>>(result, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<WorkspaceMemberDetailsDto>>> GetWorkspaceMembersDetailsAsync(string workspaceId)
    {
        var members = await _unitOfWork.WorkspaceMembers.FindAsync(x => x.WorkspaceId == workspaceId);
        var result = await EnrichMembers(members);
        return new ResponseResult<IEnumerable<WorkspaceMemberDetailsDto>>(result, ApiStatusCode.OK);
    }

    private async Task<List<WorkspaceMemberDetailsDto>> EnrichMembers(IEnumerable<WorkspaceMember> members)
    {
        var dtos = members.Select(entity => new WorkspaceMemberDetailsDto
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            WorkspaceId = entity.WorkspaceId,
            UserId = entity.UserId,
            Role = entity.Role,
            CreatedBy = entity.CreatedBy,
            CreatedAt = entity.CreatedAt,
            UpdatedBy = entity.UpdatedBy,
            UpdatedAt = entity.UpdatedAt
        }).ToList();

        var userIds = dtos.Where(x => !string.IsNullOrEmpty(x.UserId)).Select(x => x.UserId!).Distinct().ToList();
        
        if (userIds.Any())
        {
            var userMaps = await _unitOfWork.UserMaps.FindAsync(x => x.Id != null && userIds.Contains(x.Id));
            var userMapDict = userMaps.Where(x => x.Id != null).ToDictionary(x => x.Id!, x => x);

            var usersResult = await _grcService.GetUsersAsync();
            var allUsers = (usersResult.IsSucceeded && usersResult.ReturnData != null) ? usersResult.ReturnData.ToList() : new List<CompanyUserDto>();

            var lang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString() ?? "ar";
            bool isEnglish = lang.Contains("en", StringComparison.OrdinalIgnoreCase);

            foreach (var dto in dtos)
            {
                if (!string.IsNullOrEmpty(dto.UserId) && userMapDict.TryGetValue(dto.UserId, out var userMap))
                {
                    // Find user in fetched users (names are already in NameAr/NameEn inside ProfileService or mapped to Name)
                    // Wait, ProfileService GetUsersAsync returns CompanyUserDto with 'Name'. 
                    // See above: 'GetUsersAsync' calls external API and maps. 
                    // I will need to make sure 'GetUsersAsync' returns correct 'Name' based on language, OR returns object with both names if I want to decide here.
                    // But standard approach is: Service returns correct DTO. 
                    // So if ProfileService.GetUsersAsync behaves correctly (returning 'Name' based on language), I just use 'user.Name'.
                    
                    var user = allUsers.FirstOrDefault(x => x.Id == userMap.GrcUserId);
                    if (user != null)
                    {
                        dto.Name = user.Name; 
                        dto.Type = user.Type;
                    }
                }
            }
        }
        return dtos;
    }

    public async Task<ResponseResult<object>> CreateAsync(WorkspaceMember entity, int? grcUserId, string? grcUserType)
    {
        if (grcUserId.HasValue)
        {
            var userMap = (await _unitOfWork.UserMaps.FindAsync(x => x.GrcUserId == grcUserId)).FirstOrDefault();
            if (userMap == null)
            {
                userMap = new UserMap
                {
                    GrcUserId = grcUserId.Value,
                    GrcUserType = grcUserType ?? string.Empty,
                    CreatedAt = DateTime.UtcNow
                };
                userMap = await _unitOfWork.UserMaps.AddAsync(userMap);
            }
            entity.UserId = userMap.Id;
        }
        await _unitOfWork.WorkspaceMembers.AddAsync(entity);
        return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_CreatedSuccessfully"));
    }

    public async Task<ResponseResult<object>> CreateRangeAsync(IEnumerable<(WorkspaceMember Entity, int? GrcUserId, string? GrcUserType)> items)
    {
        var grcUserIds = items
            .Where(x => x.GrcUserId.HasValue)
            .Select(x => x.GrcUserId!.Value)
            .Distinct()
            .ToList();

        var processedMaps = new Dictionary<int, string?>();

        if (grcUserIds.Any())
        {
            var existingMaps = (await _unitOfWork.UserMaps.FindAsync(x => grcUserIds.Contains(x.GrcUserId))).ToList();
            foreach (var map in existingMaps)
            {
                processedMaps[map.GrcUserId] = map.Id;
            }
        }

        foreach (var item in items)
        {
            if (item.GrcUserId.HasValue)
            {
                if (!processedMaps.TryGetValue(item.GrcUserId.Value, out var userMapId))
                {
                    var newMap = new UserMap
                    {
                        GrcUserId = item.GrcUserId.Value,
                        GrcUserType = item.GrcUserType ?? string.Empty,
                        CreatedAt = DateTime.UtcNow
                    };
                    var createdMap = await _unitOfWork.UserMaps.AddAsync(newMap);
                    userMapId = createdMap.Id;
                    processedMaps[item.GrcUserId.Value] = userMapId;
                }
                item.Entity.UserId = userMapId;
            }
            await _unitOfWork.WorkspaceMembers.AddAsync(item.Entity);
        }
        return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_WorkspaceMemberRangeCreated"));
    }

    public async Task<ResponseResult<object>> UpdateAsync(string id, WorkspaceMember entity) 
    {
        await _unitOfWork.WorkspaceMembers.UpdateAsync(id, entity);
        return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_UpdatedSuccessfully"));
    }

    public async Task<ResponseResult<object>> DeleteAsync(string id)
    {
        await _unitOfWork.WorkspaceMembers.DeleteAsync(id);
        return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_DeletedSuccessfully"));
    }

    public async Task<ResponseResult<object>> ChangeRoleAsync(string memberId, string newRole)
    {
        var member = await _unitOfWork.WorkspaceMembers.GetByIdAsync(memberId);
        if (member != null)
        {
            member.Role = newRole;
            await _unitOfWork.WorkspaceMembers.UpdateAsync(memberId, member);
            return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_WorkspaceMemberRoleChanged"));
        }
        return new ResponseResult<object>(_localizationService.Get("Msg_WorkspaceMemberNotFound"), ApiStatusCode.NotFound);
    }
}