using Core.DTOs;
using Core.DTOs.Workflow;
using Core.Entities;

namespace Core.Interfaces.Service;
public interface IWorkflowService
{
    Task<ResponseResult<IEnumerable<WorkflowDetailsDto>>> GetAllAsync();
    Task<ResponseResult<WorkflowDetailsDto>> GetByIdAsync(string id);
    Task<ResponseResult<Workflow>> CreateAsync(Workflow entity);
    Task<ResponseResult<Workflow>> UpdateAsync(string id, Workflow entity);
    Task<ResponseResult<object>> DeleteAsync(string id);
    Task<ResponseResult<object>> ToggleActiveStatusAsync(string id, bool isActive, bool activateAssignments = false);
    Task<ResponseResult<object>> EvaluateTriggersAsync(MongoDB.Bson.BsonDocument context);
    Task<ResponseResult<IEnumerable<ActionDefinition>>> GetActionsAsync();
    Task<ResponseResult<IEnumerable<WorkflowTriggerDefinition>>> GetTriggersAsync();
    Task<ResponseResult<IEnumerable<WorkflowEventDefinition>>> GetEventsAsync();
}
