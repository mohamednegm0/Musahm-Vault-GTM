using MongoDB.Bson;
using Core.DTOs.WorkflowInstance;

namespace Core.Interfaces.Service;
public interface IWorkflowInstanceService
{
    Task<ResponseResult<IEnumerable<WorkflowInstanceDetailsDto>>> GetAllAsync();
    Task<ResponseResult<WorkflowInstanceDetailsDto>> GetByIdAsync(string id);
    Task<ResponseResult<WorkflowInstance>> CreateAsync(WorkflowInstance entity);
    Task<ResponseResult<WorkflowInstance>> UpdateAsync(string id, WorkflowInstance entity);
    Task<ResponseResult<object>> DeleteAsync(string id);

    // Engine Methods
    Task<ResponseResult<WorkflowInstance>> StartWorkflowAsync(string workflowId, string workspaceId, string userId, BsonDocument? context = null);
    Task<ResponseResult<object>> ProcessActionAsync(string instanceId, string stepId, string actorId, string action, BsonDocument? data = null);
    Task<ResponseResult<object>> ProcessTaskCompletionAsync(string taskId, string actorId, string action, BsonDocument? data = null);
    // Use 'object' to wrap boolean or define a specific DTO if needed. ResponseResult<T> expects T : class. 
    // Usually ResponseResult(isSucceeded) ctor exists, but generic needs a class.
    // Let's use ResponseResult<object> and put logic result in it, or just return bool? 
    // Auth uses ResponseResult<StringModel>. 
    // Let's use ResponseResult<object> where Data can be a Boolean wrapped or just null if we only care about success.
    // Actually evaluate confidence returns 'true/false' for "IsHighConfidence".
    // Let's wrap it in an anonymous object or just use object.
    Task<ResponseResult<object>> EvaluateConfidenceAsync(string instanceId, double confidenceScore);
    Task<ResponseResult<IEnumerable<WorkflowInstanceDetailsDto>>> GetByWorkflowAsync(string workflowId);
    Task<ResponseResult<IEnumerable<WorkflowInstanceDetailsDto>>> GetByTargetAsync(string targetId);
}