using Core.DTOs;
using Core.DTOs.WorkspaceMember;

namespace Core.Interfaces.Service;
public interface IWorkspaceMemberService
{
    Task<ResponseResult<IEnumerable<WorkspaceMember>>> GetAllAsync();
    Task<ResponseResult<IEnumerable<WorkspaceMemberDetailsDto>>> GetByWorkspaceIdAsync(string workspaceId);
    Task<ResponseResult<object>> CreateAsync(WorkspaceMember entity, int? grcUserId, string? grcUserType);
    Task<ResponseResult<object>> CreateRangeAsync(IEnumerable<(WorkspaceMember Entity, int? GrcUserId, string? GrcUserType)> items);
    Task<ResponseResult<object>> UpdateAsync(string id, WorkspaceMember entity);
    Task<ResponseResult<object>> DeleteAsync(string id);
    Task<ResponseResult<object>> ChangeRoleAsync(string memberId, string newRole);
    Task<ResponseResult<IEnumerable<WorkspaceMemberDetailsDto>>> GetWorkspaceMembersDetailsAsync(string workspaceId);
}