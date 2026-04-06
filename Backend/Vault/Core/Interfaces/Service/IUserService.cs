using Core.DTOs;
using Core.DTOs.Identity;
using Core.DTOs.Role;
using Core.Entities;

using Core.DTOs.User;

namespace Core.Interfaces.Service;

public interface IUserService
{
    Task<ResponseResult<List<UserDto>>> GetUsersAsync(CurrentUser currentUser, CancellationToken cancellationToken = default);
    Task<ResponseResult<string>> AssignRoleToUserAsync(AssignRoleDto dto, CurrentUser currentUser);
  //  Task<ResponseResult<string>> RemoveRoleFromUserAsync(string userId, string roleId, CurrentUser currentUser);
    Task<ResponseResult<List<Role>>> GetUserRolesAsync(string userId, string? tenantId = null);
    Task<ResponseResult<List<string>>> GetUserPermissionsAsync(string userId, string? tenantId = null);
    Task<ResponseResult<string>> HasPermissionAsync(string userId, string permissionCode);
    Task<ResponseResult<UserDto>> GetUserByIdAsync(string userId, CurrentUser currentUser);
    Task<ResponseResult<StringModel>> UpdateUserAsync(UpdateUserDto dto, CurrentUser currentUser);
    Task<CurrentUser> LoadUserPermissionsAsync(CurrentUser user);
}
