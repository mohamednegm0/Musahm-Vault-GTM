using Core.DTOs.Workspace;
using Core.DTOs.Identity;

public interface IWorkspaceService
{
    Task<ResponseResult<IEnumerable<WorkspaceDetailsDto>>> GetWorkspacesAsync(CurrentUser currentUser);
    Task<ResponseResult<WorkspaceDetailsDto>> GetWorkspaceByIdAsync(string id, CurrentUser currentUser);
    Task<ResponseResult<Workspace>> CreateWorkspaceAsync(CreateWorkspaceRequestDto request, CurrentUser currentUser);
    Task<ResponseResult<Workspace>> UpdateWorkspaceAsync(string id, UpdateWorkspaceRequestDto request, CurrentUser currentUser);
    Task<ResponseResult<StringModel>> DeleteWorkspaceAsync(string id, CurrentUser currentUser);
    Task<ResponseResult<IEnumerable<WorkspaceDetailsDto>>> GetQuickAccessWorkspacesAsync(CurrentUser currentUser);
    Task<ResponseResult<Workspace>> SetQuickAccessAsync(string id, bool isQuickAccess, CurrentUser currentUser);
    Task<ResponseResult<IEnumerable<WorkspaceDetailsDto>>> GetWorkspacesByParentIdAsync(string parentId, CurrentUser currentUser);
    Task<ResponseResult<IEnumerable<WorkspaceDetailsDto>>> GetRootWorkspacesAsync(CurrentUser currentUser);
    Task<ResponseResult<Workspace>> DeactivateWorkspaceAsync(string id, CurrentUser currentUser);
}
