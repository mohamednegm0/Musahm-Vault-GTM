using Core.DTOs.Workflow;
using Core.DTOs;
using Core.Entities;

namespace Core.Interfaces.Service;

public interface IWorkflowAssignmentService
{
    Task<ResponseResult<WorkflowAssignmentDto>> CreateAsync(CreateWorkflowAssignmentDto dto, string userId);
    Task<ResponseResult<WorkflowAssignmentDto>> UpdateAsync(string id, UpdateWorkflowAssignmentDto dto, string userId);
    Task<ResponseResult<StringModel>> DeleteAsync(string id, string userId);
    Task<ResponseResult<IEnumerable<WorkflowAssignmentDto>>> GetByTargetAsync(string targetId);
    Task<ResponseResult<IEnumerable<WorkflowAssignmentDto>>> GetByWorkflowAsync(string workflowId);
    Task<ResponseResult<WorkflowAssignmentDto>> GetByIdAsync(string id);
    Task<ResponseResult<int>> ProcessAssignmentsAsync(string targetId, string userId);
    Task<ResponseResult<Workflow>> GetApplicableWorkflowAsync(string targetId, string actionCode, string userId, string? documentTypeId = null);
}
