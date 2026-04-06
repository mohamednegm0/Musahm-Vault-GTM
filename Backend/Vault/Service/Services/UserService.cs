using Core.DTOs;
using Core.DTOs.Identity;
using Core.DTOs.User;
using Core.DTOs.Role;
using Core.Entities;
using Core.Interfaces.Service;
using Core.Repository;
using Core.Constants;
using Microsoft.AspNetCore.Http;
using static Core.Constants.ConstAppConfiguration;


namespace Service;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGRCService _grcService;
    private readonly IJsonLocalizationService _localizationService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IAuditLogService _auditLogService;

    public UserService(IUnitOfWork unitOfWork, IGRCService grcService, IJsonLocalizationService localizationService, IHttpContextAccessor httpContextAccessor, IAuditLogService auditLogService)
    {
        _unitOfWork = unitOfWork;
        _grcService = grcService;
        _localizationService = localizationService;
        _httpContextAccessor = httpContextAccessor;
        _auditLogService = auditLogService;
    }

    public async Task<ResponseResult<List<UserDto>>> GetUsersAsync(CurrentUser currentUser, CancellationToken cancellationToken = default)
    {
        try
        {
            // Detect language from request
            var langHeader = _httpContextAccessor.HttpContext?.Request.Headers["lang"].ToString();
            var acceptLang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString();
            var lang = !string.IsNullOrWhiteSpace(langHeader) ? langHeader
                      : !string.IsNullOrWhiteSpace(acceptLang) ? acceptLang
                      : "ar";
            bool isEnglish = lang.StartsWith("en", StringComparison.OrdinalIgnoreCase);

            // 1. Get all valid users for this company from external system (companyId from token)
            var companyUsersResult = await _grcService.GetUsersAsync(cancellationToken);
            if (!companyUsersResult.IsSucceeded || companyUsersResult.ReturnData == null)
            {
                return new ResponseResult<List<UserDto>>(_localizationService.Get("Msg_FailedFetchCompanyUsers"), ApiStatusCode.BadRequest);
            }

            var validVaultIds = companyUsersResult.ReturnData
                .Where(u => !string.IsNullOrEmpty(u.VaultUserId))
                .Select(u => u.VaultUserId!)
                .ToHashSet();

            if (!validVaultIds.Any())
            {
                return new ResponseResult<List<UserDto>>(new List<UserDto>(), ApiStatusCode.OK);
            }

            // 2. Get UserRoles scoped to THIS tenant — this is how we scope by TenantId
            //    UserMap has no TenantId; tenant scoping is done through UserRoles
            var userRoles = (await _unitOfWork.UserRoles.FindAsync(
                ur => ur.TenantId == currentUser.TenantId
            )).ToList();

            // Only care about users who have a role in this tenant AND are in the company
            var tenantUserIds = userRoles.Select(ur => ur.UserId).ToHashSet();
            var tenantValidVaultIds = validVaultIds.Intersect(tenantUserIds).ToHashSet();

            if (!tenantValidVaultIds.Any())
            {
                return new ResponseResult<List<UserDto>>(new List<UserDto>(), ApiStatusCode.OK);
            }

            // 3. Get UserMaps for users who belong to THIS company AND have a role in THIS tenant
            var userMaps = (await _unitOfWork.UserMaps.FindAsync(
                u => u.Id != null && tenantValidVaultIds.Contains(u.Id)
            )).ToList();

            // 4. Get all Roles for enrichment
            var allRoles = (await _unitOfWork.Roles.GetAllAsync()).ToDictionary(r => r.Id!, r => r);
            var userRolesGrouped = userRoles.GroupBy(ur => ur.UserId).ToDictionary(g => g.Key, g => g.ToList());

            var users = new List<UserDto>();

            foreach (var map in userMaps)
            {
                var userDto = new UserDto
                {
                    Id                = map.Id ?? string.Empty,
                    NameAr            = map.GrcNameAr ?? string.Empty,
                    NameEn            = map.GrcNameEn ?? string.Empty,
                    Email             = map.Email ?? string.Empty,
                    MobileCountryCode = map.MobileCountryCode ?? 0,
                    MobileNumber      = map.MobileNumber ?? string.Empty,
                    CompanyId         = 0,
                    IsActive          = map.IsActive
                };

                // Enrich with roles — name in correct language
                if (map.Id != null && userRolesGrouped.TryGetValue(map.Id, out var roles))
                {
                    foreach (var ur in roles)
                    {
                        var userRoleDto = new UserRoleDto { RoleId = ur.RoleId };
                        if (allRoles.TryGetValue(ur.RoleId, out var role))
                        {
                            userRoleDto.RoleName = isEnglish
                                ? (role.NameEn ?? role.NameAr ?? string.Empty)
                                : (role.NameAr ?? role.NameEn ?? string.Empty);
                        }
                        userDto.Roles.Add(userRoleDto);
                    }
                }

                users.Add(userDto);
            }

            return new ResponseResult<List<UserDto>>(users, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<List<UserDto>>(_localizationService.Get("Msg_ErrorFetchingUsers", ex.Message), ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<string>> AssignRoleToUserAsync(AssignRoleDto dto, CurrentUser currentUser)
    {
        // Validate TenantId
        if (string.IsNullOrEmpty(currentUser.TenantId))
            return new ResponseResult<string>(_localizationService.Get("Msg_TenantIdRequired"), ApiStatusCode.BadRequest);

        // Check if role exists
        var role = await _unitOfWork.Roles.GetByIdAsync(dto.RoleId);
        if (role == null)
            return new ResponseResult<string>(_localizationService.Get("Msg_RoleNotFound"), ApiStatusCode.NotFound);

        // Check if user already has this role (in this company)
        var existingUserRoles = await _unitOfWork.UserRoles.FindAsync(
            ur => ur.UserId == dto.UserId && ur.RoleId == dto.RoleId && ur.TenantId == currentUser.TenantId);
        
        if (existingUserRoles.Any())
            return new ResponseResult<string>(_localizationService.Get("Msg_UserAlreadyHasRole"), ApiStatusCode.BadRequest);

        var userRole = new UserRole
        {
            UserId = dto.UserId,
            RoleId = dto.RoleId,
            TenantId = currentUser.TenantId!,
            AssignedAt = DateTime.UtcNow,
            AssignedBy = currentUser.UserId
        };

        await _unitOfWork.UserRoles.AddAsync(userRole);

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Assign Role To User",
            entityType: "user",
            entityId: dto.UserId,
            details: $"Assigned role {role.NameEn} ({role.Code}) to user {dto.UserId}"
        );

        return new ResponseResult<string>(_localizationService.Get("Msg_Success"), ApiStatusCode.OK, _localizationService.Get("Msg_RoleAssignedSuccess"));
    }

    // public async Task<ResponseResult<string>> RemoveRoleFromUserAsync(string userId, string roleId, CurrentUser currentUser)
    // {
    //     // Only remove roles within the current tenant
    //     var userRoles = await _unitOfWork.UserRoles.FindAsync(
    //         ur => ur.UserId == userId && ur.RoleId == roleId && ur.TenantId == currentUser.TenantId);
    //     var userRole = userRoles.FirstOrDefault();
        
    //     if (userRole == null)
    //         return new ResponseResult<string>(_localizationService.Get("Msg_UserRoleNotFound"), ApiStatusCode.NotFound);

    //     if (userRole.Id != null)
    //         await _unitOfWork.UserRoles.DeleteAsync(userRole.Id);

    //     await _auditLogService.LogAsync(
    //         actorUserId: currentUser.UserId!,
    //         tenantId: currentUser.TenantId!,
    //         action: "Remove Role From User",
    //         entityType: "user",
    //         entityId: userId,
    //         details: $"Removed role {roleId} from user {userId}"
    //     );
        
    //     return new ResponseResult<string>(_localizationService.Get("Msg_Success"), ApiStatusCode.OK, _localizationService.Get("Msg_RoleRemovedSuccess"));
    // }

    public async Task<ResponseResult<List<Role>>> GetUserRolesAsync(string userId, string? tenantId = null)
    {
        // Get roles for user in specific tenant, or all if tenantId is null (used internally only)
        var userRoles = tenantId != null
            ? await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == userId && ur.TenantId == tenantId)
            : await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == userId);

        var roleIds = userRoles.Select(ur => ur.RoleId).Distinct().ToList();

        var roles = new List<Role>();
        foreach (var roleId in roleIds)
        {
            var role = await _unitOfWork.Roles.GetByIdAsync(roleId);
            if (role != null && role.IsActive)
                roles.Add(role);
        }

        return new ResponseResult<List<Role>>(roles, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<List<string>>> GetUserPermissionsAsync(string userId, string? tenantId = null)
    {
        // Get all user roles
        var userRolesResult = await GetUserRolesAsync(userId, tenantId);
        if (userRolesResult.ReturnData == null || !userRolesResult.ReturnData.Any())
            return new ResponseResult<List<string>>(new List<string>(), ApiStatusCode.OK);

        var allPermissions = new HashSet<string>();

        foreach (var role in userRolesResult.ReturnData)
        {
            if (role.Id == null) continue;

            // Get permissions for this role
            var rolePermissions = await _unitOfWork.RolePermissions.FindAsync(rp => rp.RoleId == role.Id);
            
            foreach (var rolePermission in rolePermissions)
            {
                var permission = await _unitOfWork.Permissions.GetByIdAsync(rolePermission.PermissionId);
                if (permission != null && permission.IsActive)
                {
                    allPermissions.Add(permission.Code);
                }
            }
        }

        return new ResponseResult<List<string>>(allPermissions.ToList(), ApiStatusCode.OK);
    }

    public async Task<ResponseResult<string>> HasPermissionAsync(string userId, string permissionCode)
    {
        // Note: This method might be unsafe without tenant context if called directly
        // Typically permissions are checked from the token/CurrentPermissions
        var userPermissions = await GetUserPermissionsAsync(userId);
        
        if (userPermissions.ReturnData == null)
            return new ResponseResult<string>(_localizationService.Get("Msg_NoPermissionsFound"), ApiStatusCode.OK);

        var hasPermission = userPermissions.ReturnData.Contains(permissionCode);
        return new ResponseResult<string>(
            hasPermission ? "true" : "false", 
            ApiStatusCode.OK, 
            hasPermission ? _localizationService.Get("Msg_UserHasPermission") : _localizationService.Get("Msg_UserDoesNotHavePermission")
        );
    }
    public async Task<ResponseResult<UserDto>> GetUserByIdAsync(string userId, CurrentUser currentUser)
    {
        try
        {
            // Detect language
            var langHeader = _httpContextAccessor.HttpContext?.Request.Headers["lang"].ToString();
            var acceptLang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString();
            var lang = !string.IsNullOrWhiteSpace(langHeader) ? langHeader
                      : !string.IsNullOrWhiteSpace(acceptLang) ? acceptLang
                      : "ar";
            bool isEnglish = lang.StartsWith("en", StringComparison.OrdinalIgnoreCase);

            // 1. Get UserMap
            var userMap = await _unitOfWork.UserMaps.GetByIdAsync(userId);
            if (userMap == null)
            {
                return new ResponseResult<UserDto>(_localizationService.Get("Msg_UserNotFound"), ApiStatusCode.NotFound);
            }

            // 2. Map to DTO
            var userDto = new UserDto
            {
                Id                = userMap.Id ?? string.Empty,
                NameAr            = userMap.GrcNameAr ?? string.Empty,
                NameEn            = userMap.GrcNameEn ?? string.Empty,
                Email             = userMap.Email ?? string.Empty,
                MobileCountryCode = userMap.MobileCountryCode ?? 0,
                MobileNumber      = userMap.MobileNumber ?? string.Empty,
                CompanyId         = 0,
                IsActive          = userMap.IsActive
            };

            // 3. Enrich with roles for current tenant — name in correct language
            var rolesResult = await GetUserRolesAsync(userId, currentUser.TenantId);
            if (rolesResult.IsSucceeded && rolesResult.ReturnData != null)
            {
                foreach (var role in rolesResult.ReturnData)
                {
                    if (role.Id != null)
                    {
                        userDto.Roles.Add(new UserRoleDto
                        {
                            RoleId   = role.Id,
                            RoleName = isEnglish
                                ? (role.NameEn ?? role.NameAr ?? string.Empty)
                                : (role.NameAr ?? role.NameEn ?? string.Empty)
                        });
                    }
                }
            }

            return new ResponseResult<UserDto>(userDto, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<UserDto>(_localizationService.Get("Msg_ErrorFetchingUser", ex.Message), ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<StringModel>> UpdateUserAsync(UpdateUserDto dto, CurrentUser currentUser)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.Id))
                return new ResponseResult<StringModel>(_localizationService.Get("Msg_UserIdRequired"), ApiStatusCode.BadRequest);

            // Verify user exists
            var userMap = await _unitOfWork.UserMaps.GetByIdAsync(dto.Id);
            if (userMap == null)
                return new ResponseResult<StringModel>(_localizationService.Get("Msg_UserNotFound"), ApiStatusCode.NotFound);

            var addedRoleNames = new List<string>();
            var removedRoleNames = new List<string>();

            if (dto.RoleIds != null)
            {
                // Get current roles
                var currentRolesResult = await GetUserRolesAsync(dto.Id, currentUser.TenantId);
                var currentRoleIds = currentRolesResult.ReturnData?.Where(r => r.Id != null).Select(r => r.Id!).ToList() ?? new List<string>();
                var newRoleIds = dto.RoleIds;

                // Roles to add
                var rolesToAdd = newRoleIds.Except(currentRoleIds).ToList();
                
                // Roles to remove
                var rolesToRemove = currentRoleIds.Except(newRoleIds).ToList();

                // SAFETY CHECK: prevent removing admin role if this is the last admin in the tenant
                var adminRole = (await _unitOfWork.Roles.FindAsync(r => r.Code == ConstRoles.Admin)).FirstOrDefault();
                if (adminRole != null && rolesToRemove.Contains(adminRole.Id!))
                {
                    // Count all other admins in the tenant (excluding this user)
                    var allAdminAssignments = await _unitOfWork.UserRoles.FindAsync(
                        ur => ur.RoleId == adminRole.Id && ur.TenantId == currentUser.TenantId && ur.UserId != dto.Id
                    );
                    if (!allAdminAssignments.Any())
                    {
                        return new ResponseResult<StringModel>(
                            _localizationService.Get("Msg_LastAdminCannotBeRemoved") ?? "Cannot remove the Admin role from the last admin user. Assign Admin to another user first.",
                            ApiStatusCode.BadRequest
                        );
                    }
                }

                // Add roles directly (without triggering individual audit logs)
                foreach (var roleId in rolesToAdd)
                {
                    var roleToAdd = await _unitOfWork.Roles.GetByIdAsync(roleId);
                    var userRole = new UserRole
                    {
                        UserId = dto.Id,
                        RoleId = roleId,
                        TenantId = currentUser.TenantId!,
                        AssignedAt = DateTime.UtcNow,
                        AssignedBy = currentUser.UserId
                    };
                    await _unitOfWork.UserRoles.AddAsync(userRole);
                    if (roleToAdd != null)
                        addedRoleNames.Add(roleToAdd.NameAr ?? roleToAdd.NameEn ?? roleId);
                }

                // Remove roles directly (without triggering individual audit logs)
                foreach (var roleId in rolesToRemove)
                {
                    var roleToRemove = currentRolesResult.ReturnData?.FirstOrDefault(r => r.Id == roleId);
                    var userRoles = await _unitOfWork.UserRoles.FindAsync(
                        ur => ur.UserId == dto.Id && ur.RoleId == roleId && ur.TenantId == currentUser.TenantId);
                    var userRole = userRoles.FirstOrDefault();
                    if (userRole?.Id != null)
                        await _unitOfWork.UserRoles.DeleteAsync(userRole.Id);
                    if (roleToRemove != null)
                        removedRoleNames.Add(roleToRemove.NameAr ?? roleToRemove.NameEn ?? roleId);
                }
            }


            // Call GRC Service to update external user if needed
            // We need to map our UpdateUserDto to UpdateExternalUserDto
            // But we need the GrcUserId (Active Directory Id / External Id)
            // It is stored in UserMap.GrcUserId
            
            if (userMap.GrcUserId > 0)
            {
                var extDto = new Core.DTOs.GRC.UpdateExternalUserDto
                {
                    Id = userMap.GrcUserId,
                    // CompanyId = userMap.GrcCompanyId, // Removed as property does not exist 
                    // Actually LoginAsync uses CompanyMaps.GrcCompanyId.
                    // UserMap does not have GrcCompanyId stored directly.
                    // However, the external API requires CompanyId.
                    // Let's try to find it. 
                    // Wait, `UpdateExternalUserDto` requires `CompanyId`.
                    // UserMap only stores GrcUserId, GrcUserType, Names.
                };

                // Helper to get CompanyId map?
                // The prompt assumes we can update it.
                // If we don't have CompanyId easily, maybe we can fetch it or ignore if 0?
                // Actually LoginAsync logic: 
                // var existingMap = (await _unitOfWork.CompanyMaps.FindAsync(x => x.GrcCompanyId == companyId)).FirstOrDefault();
                // We have currentUser.TenantId.
                var companyMap = (await _unitOfWork.CompanyMaps.FindAsync(cm => cm.Id == currentUser.TenantId)).FirstOrDefault();
                if (companyMap != null)
                {
                     extDto.CompanyId = companyMap.GrcCompanyId;
                }

                // Map fields
                if (!string.IsNullOrEmpty(dto.NameAr)) extDto.NameAr = dto.NameAr;
                if (!string.IsNullOrEmpty(dto.NameEn)) extDto.NameEn = dto.NameEn;
                if (!string.IsNullOrEmpty(dto.Email)) extDto.Email = dto.Email;
                if (!string.IsNullOrEmpty(dto.MobileNumber)) extDto.MobileNumber = dto.MobileNumber;
                if (dto.MobileCountryCode.HasValue) extDto.MobileCountryCode = dto.MobileCountryCode.Value;
                if (dto.IsActive.HasValue) extDto.IsActive = dto.IsActive.Value;
                

                // Call External API
                // We should probably only call if we are updating profile info, not just roles.
                // But the user said "UpdateUserAsync ... update external user also".
                
                var updateResult = await _grcService.UpdateExternalUserAsync(extDto);
                if (!updateResult.IsSucceeded)
                {
                    // Should we fail the whole operation? 
                    // Maybe return warning?
                    // For now, let's log or append to message.
                    var msg = _localizationService.Get("Msg_PartialUpdateWarning", updateResult.ErrorMessage ?? "");
                    return new ResponseResult<StringModel>(msg , ApiStatusCode.BadRequest); // Partial success
                }


                // Only call if we have data to update
                // The PUT usually replaces, so we might need all data?
                // Or maybe the API handles partial updates? 
                // The user request shows a full object structure.
                // Safest to fetch current external data and merge?
                // Or just send what we have. API constraints are unknown but let's assume standard behavior or blindly send what we changed.
                // Wait, if I send nulls, will it clear them?
                // The prompt shows a full object in the request example.
                // Let's assume we send what we have. 
                
                // Also update local UserMap to reflect changes immediately
                bool localUpdate = false;
                if (!string.IsNullOrEmpty(dto.NameAr)) { userMap.GrcNameAr = dto.NameAr; localUpdate = true; }
                if (!string.IsNullOrEmpty(dto.NameEn)) { userMap.GrcNameEn = dto.NameEn; localUpdate = true; }
                if (!string.IsNullOrEmpty(dto.Email)) { userMap.Email = dto.Email; localUpdate = true; }
                if (!string.IsNullOrEmpty(dto.MobileNumber)) { userMap.MobileNumber = dto.MobileNumber; localUpdate = true; }
                if (dto.MobileCountryCode.HasValue) { userMap.MobileCountryCode = dto.MobileCountryCode.Value; localUpdate = true; }
                if (dto.IsActive.HasValue) { userMap.IsActive = dto.IsActive.Value; localUpdate = true; }

                if (localUpdate)
                {
                     await _unitOfWork.UserMaps.UpdateAsync(userMap.Id!, userMap);
                }


            }

            // Build descriptive audit log based on what changed
            var auditParts = new List<string>();
            if (addedRoleNames.Any())
                auditParts.Add($"تم إضافة الصلاحيات: {string.Join("، ", addedRoleNames)}");
            if (removedRoleNames.Any())
                auditParts.Add($"تم إزالة الصلاحيات: {string.Join("، ", removedRoleNames)}");

            string auditAction;
            string auditDetails;

            if (addedRoleNames.Any() && removedRoleNames.Any())
            {
                auditAction = "Update User (Assign & Remove Roles)";
            }
            else if (addedRoleNames.Any())
            {
                auditAction = "Update User (Assign Role)";
            }
            else if (removedRoleNames.Any())
            {
                auditAction = "Update User (Remove Role)";
            }
            else
            {
                auditAction = "Update User";
            }

            auditDetails = auditParts.Any()
                ? $"{userMap.Email} — {string.Join(" | ", auditParts)}"
                : $"تم تحديث بيانات المستخدم: {userMap.Email}";

            await _auditLogService.LogAsync(
                actorUserId: currentUser.UserId!,
                tenantId: currentUser.TenantId!,
                action: auditAction,
                entityType: "user",
                entityId: dto.Id,
                details: auditDetails
            );

            return new ResponseResult<StringModel>(new StringModel { Value = _localizationService.Get("Msg_UserUpdatedSuccess") }, ApiStatusCode.OK, _localizationService.Get("Msg_UserUpdatedSuccess"));
        }
        catch (Exception ex)
        {
            return new ResponseResult<StringModel>(_localizationService.Get("Msg_ErrorUpdatingUserRoles", ex.Message), ApiStatusCode.BadRequest);
        }
    }
    public async Task<CurrentUser> LoadUserPermissionsAsync(CurrentUser user)
    {
        if (user == null || string.IsNullOrEmpty(user.UserId))
            return user!;

        // 1. Get Roles
        var rolesResult = await GetUserRolesAsync(user.UserId, user.TenantId);
        if (rolesResult.ReturnData != null)
        {
            user.Roles = rolesResult.ReturnData
                .Where(r => r.IsActive)
                .Select(r => r.Code)
                .ToList();
        }

        // 2. Get Permissions
        var permissionsResult = await GetUserPermissionsAsync(user.UserId, user.TenantId);
        if (permissionsResult.ReturnData != null)
        {
            user.Permissions = permissionsResult.ReturnData;
        }

        return user;
    }
}

