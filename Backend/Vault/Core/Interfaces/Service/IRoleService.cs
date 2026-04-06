using Core.DTOs;
using Core.DTOs.Role;
using Core.Entities;

namespace Core.Interfaces.Service;

public interface IRoleService
{
    Task<ResponseResult<IEnumerable<Role>>> GetAllAsync();
    Task<ResponseResult<Role>> GetByIdAsync(string id);
    Task<ResponseResult<Role>> GetByCodeAsync(string code);
    Task<ResponseResult<Role>> CreateAsync(CreateRoleDto dto, CurrentUser currentUser);
    Task<ResponseResult<Role>> UpdateAsync(string id, UpdateRoleDto dto, CurrentUser currentUser);
    Task<ResponseResult<string>> DeleteAsync(string id, CurrentUser currentUser);
    Task<ResponseResult<List<Core.Entities.Permission>>> GetRolePermissionsAsync(string roleId);
    Task<ResponseResult<string>> AssignPermissionsAsync(string roleId, AssignPermissionsToRoleDto dto, CurrentUser currentUser);
}
