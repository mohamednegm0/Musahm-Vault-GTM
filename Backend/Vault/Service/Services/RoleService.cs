using Core.DTOs;
using Core.DTOs.Role;
using Core.DTOs.Identity;
using Core.Entities;
using Core.Interfaces.Service;
using static Core.Constants.ConstAppConfiguration;

namespace Service;

public class RoleService : IRoleService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJsonLocalizationService _localizationService;
    private readonly IAuditLogService _auditLogService;

    public RoleService(IUnitOfWork unitOfWork, IJsonLocalizationService localizationService, IAuditLogService auditLogService)
    {
        _unitOfWork = unitOfWork;
        _localizationService = localizationService;
        _auditLogService = auditLogService;
    }

    public async Task<ResponseResult<IEnumerable<Role>>> GetAllAsync()
    {
        var roles = await _unitOfWork.Roles.GetAllAsync();
        return new ResponseResult<IEnumerable<Role>>(roles, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Role>> GetByIdAsync(string id)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(id);
        if (role == null)
            return new ResponseResult<Role>(_localizationService.Get("Msg_RoleNotFound"), ApiStatusCode.NotFound);
        
        return new ResponseResult<Role>(role, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Role>> GetByCodeAsync(string code)
    {
        var roles = await _unitOfWork.Roles.FindAsync(r => r.Code == code);
        var role = roles.FirstOrDefault();
        
        if (role == null)
            return new ResponseResult<Role>(_localizationService.Get("Msg_RoleNotFound"), ApiStatusCode.NotFound);
        
        return new ResponseResult<Role>(role, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Role>> CreateAsync(CreateRoleDto dto, CurrentUser currentUser)
    {
        var existingRoles = await _unitOfWork.Roles.FindAsync(r => r.Code == dto.Code);
        if (existingRoles.Any())
            return new ResponseResult<Role>(_localizationService.Get("Msg_RoleCodeExists"), ApiStatusCode.BadRequest);

        var role = new Role
        {
            Code = dto.Code.ToLower(),
            NameAr = dto.NameAr,
            NameEn = dto.NameEn,
            DescriptionAr = dto.DescriptionAr,
            DescriptionEn = dto.DescriptionEn,
            Level = dto.Level,
            IsSystemRole = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Roles.AddAsync(role);

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Create Role",
            entityType: "role",
            entityId: role.Id,
            details: $"Created role: {role.NameEn} ({role.Code})"
        );

        return new ResponseResult<Role>(role, ApiStatusCode.OK, _localizationService.Get("Msg_RoleCreatedSuccess"));
    }

    public async Task<ResponseResult<Role>> UpdateAsync(string id, UpdateRoleDto dto, CurrentUser currentUser)
    {
        var existingRole = await _unitOfWork.Roles.GetByIdAsync(id);
        if (existingRole == null)
            return new ResponseResult<Role>(_localizationService.Get("Msg_RoleNotFound"), ApiStatusCode.NotFound);

        if (existingRole.IsSystemRole)
            return new ResponseResult<Role>(_localizationService.Get("Msg_RoleSystemModify"), ApiStatusCode.BadRequest);

        existingRole.NameAr = dto.NameAr;
        existingRole.NameEn = dto.NameEn;
        existingRole.DescriptionAr = dto.DescriptionAr;
        existingRole.DescriptionEn = dto.DescriptionEn;
        existingRole.IsActive = dto.IsActive;
        existingRole.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Roles.UpdateAsync(id, existingRole);

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Update Role",
            entityType: "role",
            entityId: id,
            details: $"Updated role: {existingRole.NameEn} ({existingRole.Code}). Active: {existingRole.IsActive}"
        );

        return new ResponseResult<Role>(existingRole, ApiStatusCode.OK, _localizationService.Get("Msg_RoleUpdatedSuccess"));
    }

    public async Task<ResponseResult<string>> DeleteAsync(string id, CurrentUser currentUser)
    {
        var existingRole = await _unitOfWork.Roles.GetByIdAsync(id);
        if (existingRole == null)
            return new ResponseResult<string>(_localizationService.Get("Msg_RoleNotFound"), ApiStatusCode.NotFound);

        if (existingRole.IsSystemRole)
            return new ResponseResult<string>(_localizationService.Get("Msg_RoleSystemDelete"), ApiStatusCode.BadRequest);

        await _unitOfWork.Roles.DeleteAsync(id);

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Delete Role",
            entityType: "role",
            entityId: id,
            details: $"Deleted role: {existingRole.NameEn} ({existingRole.Code})"
        );

        return new ResponseResult<string>(_localizationService.Get("Msg_DeletedSuccessfully"), ApiStatusCode.OK, _localizationService.Get("Msg_RoleDeletedSuccess"));
    }

    public async Task<ResponseResult<List<Core.Entities.Permission>>> GetRolePermissionsAsync(string roleId)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(roleId);
        if (role == null)
            return new ResponseResult<List<Core.Entities.Permission>>(_localizationService.Get("Msg_RoleNotFound"), ApiStatusCode.NotFound);

        var rolePermissions = await _unitOfWork.RolePermissions.FindAsync(rp => rp.RoleId == roleId);
        var permissionIds = rolePermissions.Select(rp => rp.PermissionId).ToList();

        var permissions = new List<Core.Entities.Permission>();
        foreach (var permissionId in permissionIds)
        {
            var permission = await _unitOfWork.Permissions.GetByIdAsync(permissionId);
            if (permission != null)
                permissions.Add(permission);
        }

        return new ResponseResult<List<Core.Entities.Permission>>(permissions, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<string>> AssignPermissionsAsync(string roleId, AssignPermissionsToRoleDto dto, CurrentUser currentUser)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(roleId);
        if (role == null)
            return new ResponseResult<string>(_localizationService.Get("Msg_RoleNotFound"), ApiStatusCode.NotFound);

        var existingRolePermissions = await _unitOfWork.RolePermissions.FindAsync(rp => rp.RoleId == roleId);
        foreach (var rp in existingRolePermissions)
        {
            if (rp.Id != null)
                await _unitOfWork.RolePermissions.DeleteAsync(rp.Id);
        }

        foreach (var permissionId in dto.PermissionIds)
        {
            var rolePermission = new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId,
                AssignedAt = DateTime.UtcNow
            };
            await _unitOfWork.RolePermissions.AddAsync(rolePermission);
        }

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Assign Role Permissions",
            entityType: "role",
            entityId: roleId,
            details: $"Assigned {dto.PermissionIds.Count} permissions to role: {role.NameEn}"
        );

        return new ResponseResult<string>(_localizationService.Get("Msg_Success"), ApiStatusCode.OK, _localizationService.Get("Msg_PermissionsAssignedSuccess"));
    }
}
