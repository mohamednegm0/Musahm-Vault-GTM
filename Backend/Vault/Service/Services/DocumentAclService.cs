using Core.DTOs;
using Core.DTOs.DocumentAcl;
using Core.DTOs.Profile;
using Core.Entities;
using Core.Interfaces.Service;
using System.Collections.Generic;
using System.Linq;
using static Core.Constants.ConstAppConfiguration;
using Microsoft.AspNetCore.Http;

namespace Service;
public class DocumentAclService : IDocumentAclService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IGRCService _grcService;
    private readonly IAuditLogService _auditLogService;

    public DocumentAclService(IUnitOfWork unitOfWork,IHttpContextAccessor httpContextAccessor, IGRCService grcService, IAuditLogService auditLogService) 
    { 
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;
        _grcService = grcService;
        _auditLogService = auditLogService;
    }

    public async Task<ResponseResult<IEnumerable<DocumentAclDetailsDto>>> GetAllAsync()
    {
        var acls = await _unitOfWork.DocumentAcls.GetAllAsync();
        var dtos = await EnrichWithUserNames(acls);
        return new ResponseResult<IEnumerable<DocumentAclDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<DocumentAclDetailsDto>> GetByIdAsync(string id)
    {
        var acl = await _unitOfWork.DocumentAcls.GetByIdAsync(id);
        if (acl == null) return new ResponseResult<DocumentAclDetailsDto>("ACL not found", ApiStatusCode.NotFound);
        var dtos = await EnrichWithUserNames(new[] { acl });
        return new ResponseResult<DocumentAclDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }

    public async Task<ResponseResult<DocumentAcl>> CreateAsync(DocumentAcl entity, int? grcUserId, string? grcUserType) 
    {
        if (grcUserId.HasValue)
        {
            var userMaps = await _unitOfWork.UserMaps.FindAsync(x => x.GrcUserId == grcUserId);
            var userMap = userMaps.FirstOrDefault();
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

        await _unitOfWork.DocumentAcls.AddAsync(entity);

        var actorId = entity.CreatedBy ?? string.Empty;
        var tenantId = entity.TenantId ?? string.Empty;
        if (!string.IsNullOrEmpty(actorId) && !string.IsNullOrEmpty(tenantId) && !string.IsNullOrEmpty(entity.DocumentId))
        {
            await _auditLogService.LogAsync(
                actorUserId: actorId,
                tenantId: tenantId,
                action: "Grant Document Access",
                entityType: "document",
                entityId: entity.DocumentId,
                details: "Granted access to a user"
            );
        }

        return new ResponseResult<DocumentAcl>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<DocumentAcl>> UpdateAsync(string id, DocumentAcl entity) 
    {
        await _unitOfWork.DocumentAcls.UpdateAsync(id, entity);
        return new ResponseResult<DocumentAcl>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> DeleteAsync(string id, string actorUserId, string tenantId) 
    {
        var acl = await _unitOfWork.DocumentAcls.GetByIdAsync(id);
        if (acl == null) return new ResponseResult<object>("ACL not found", ApiStatusCode.NotFound);

        if (!string.IsNullOrEmpty(acl.UserId))
        {
            var userMaps = await _unitOfWork.UserMaps.FindAsync(u => u.Id == acl.UserId);
            var userMap = userMaps.FirstOrDefault();
            if (userMap != null && !string.IsNullOrEmpty(userMap.Email))
            {
                var invitations = await _unitOfWork.Invitations.FindAsync(i => i.DocumentId == acl.DocumentId && i.Email == userMap.Email);
                foreach (var inv in invitations)
                {
                    if (inv.Id != null)
                        await _unitOfWork.Invitations.DeleteAsync(inv.Id);
                }
            }
        }

        await _unitOfWork.DocumentAcls.DeleteAsync(id);

        if (!string.IsNullOrEmpty(actorUserId) && !string.IsNullOrEmpty(tenantId) && !string.IsNullOrEmpty(acl.DocumentId))
        {
            await _auditLogService.LogAsync(
                actorUserId: actorUserId,
                tenantId: tenantId,
                action: "Revoke Document Access",
                entityType: "document",
                entityId: acl.DocumentId,
                details: "Revoked access from a user"
            );
        }

        return new ResponseResult<object>(null, ApiStatusCode.OK, "Deleted successfully");
    }

    public async Task<ResponseResult<IEnumerable<DocumentAclDetailsDto>>> GetByDocumentIdAsync(string documentId)
    {
        var acls = await _unitOfWork.DocumentAcls.FindAsync(acl => acl.DocumentId == documentId);
        var dtos = await EnrichWithUserNames(acls);
        return new ResponseResult<IEnumerable<DocumentAclDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<DocumentAclDetailsDto>>> GetDetailsByDocumentIdAsync(string documentId)
    {
        var acls = await _unitOfWork.DocumentAcls.FindAsync(x => x.DocumentId == documentId);
        var dtos = await EnrichWithUserNames(acls);
        return new ResponseResult<IEnumerable<DocumentAclDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> UpdatePermissionAsync(string documentId, string userId, string permission, string actorUserId, string tenantId)
    {
        var acls = await _unitOfWork.DocumentAcls.FindAsync(x => x.DocumentId == documentId && x.UserId == userId);
        var acl = acls.FirstOrDefault();
        if (acl != null)
        {
            acl.Permission = permission;
            await _unitOfWork.DocumentAcls.UpdateAsync(acl.Id!, acl);

            if (!string.IsNullOrEmpty(actorUserId) && !string.IsNullOrEmpty(tenantId))
            {
                await _auditLogService.LogAsync(
                    actorUserId: actorUserId,
                    tenantId: tenantId,
                    action: "Update Document Access",
                    entityType: "document",
                    entityId: documentId,
                    details: $"Updated access permission to {permission}"
                );
            }

            return new ResponseResult<object>(null, ApiStatusCode.OK, "Permission updated");
        }
        return new ResponseResult<object>("ACL not found", ApiStatusCode.NotFound);
    }

    private async Task<List<DocumentAclDetailsDto>> EnrichWithUserNames(IEnumerable<DocumentAcl> acls)
    {
        var dtos = acls.Select(a => new DocumentAclDetailsDto
        {
            Id = a.Id,
            TenantId = a.TenantId,
            DocumentId = a.DocumentId,
            UserId = a.UserId,
            Permission = a.Permission,
            CreatedBy = a.CreatedBy,
            CreatedAt = a.CreatedAt
        }).ToList();

        var userIds = new HashSet<string>();
        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy)) userIds.Add(dto.CreatedBy);
            if (!string.IsNullOrEmpty(dto.UserId)) userIds.Add(dto.UserId);
        }

        if (!userIds.Any()) return dtos;

        var userMaps = await _unitOfWork.UserMaps.FindAsync(u => u.Id != null && userIds.Contains(u.Id));
        var userMapDict = userMaps.Where(u => u.Id != null).ToDictionary(u => u.Id!, u => u);

        var lang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString() ?? "ar";
        bool isEnglish = lang.Contains("en", StringComparison.OrdinalIgnoreCase);

        var usersResult = await _grcService.GetUsersAsync();
        var allUsers = (usersResult.IsSucceeded && usersResult.ReturnData != null) ? usersResult.ReturnData.ToList() : new List<CompanyUserDto>();

        foreach (var dto in dtos)
        {
            // Enrich CreatedBy Info
            if (!string.IsNullOrEmpty(dto.CreatedBy) && userMapDict.TryGetValue(dto.CreatedBy, out var createdByMap))
            {
                var creator = allUsers.FirstOrDefault(x => x.Id == createdByMap.GrcUserId);
                if (creator != null)
                {
                    dto.CreatedByName = !string.IsNullOrEmpty(creator.Name) ? creator.Name : (isEnglish ? creator.NameEn : creator.NameAr);
                }
                else
                {
                    dto.CreatedByName = isEnglish ? createdByMap.GrcNameEn : createdByMap.GrcNameAr;
                }
            }

            // Enrich User Info (who has permission)
            if (!string.IsNullOrEmpty(dto.UserId) && userMapDict.TryGetValue(dto.UserId, out var userMap))
            {
                var user = allUsers.FirstOrDefault(x => x.Id == userMap.GrcUserId);
                if (user != null)
                {
                    dto.Name = !string.IsNullOrEmpty(user.Name) ? user.Name : (isEnglish ? user.NameEn : user.NameAr);
                    dto.Type = user.Type;
                }
                else
                {
                    dto.Name = isEnglish ? userMap.GrcNameEn : userMap.GrcNameAr;
                    dto.Type = userMap.GrcUserType; // Assuming GrcUserType maps to Type
                }
            }
        }

        return dtos;
    }
}