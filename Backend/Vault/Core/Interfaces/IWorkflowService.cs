using Core.Entities;
using MongoDB.Bson;

namespace Core.Interfaces;

public interface IWorkflowService
{
    // Workflow Management
    Task<Workflow> CreateWorkflowAsync(Workflow workflow);
    Task<Workflow?> GetWorkflowAsync(string id);
    Task<IEnumerable<Workflow>> GetWorkflowsByWorkspaceAsync(string workspaceId);
    Task UpdateWorkflowAsync(string id, Workflow workflow);
    
    // Instance Management
    Task<WorkflowInstance> StartWorkflowAsync(string workflowId, string workspaceId, string userId, BsonDocument? context = null);
    Task<WorkflowInstance?> GetInstanceAsync(string id);
    Task<IEnumerable<WorkflowInstance>> GetInstancesByWorkspaceAsync(string workspaceId);
    
    // Step Execution
    Task ProcessActionAsync(string instanceId, string stepId, string actorId, string action, BsonDocument? data = null);
    
    // Safety / Logic
    Task<bool> EvaluateConfidenceAsync(string instanceId, double confidenceScore);
}
