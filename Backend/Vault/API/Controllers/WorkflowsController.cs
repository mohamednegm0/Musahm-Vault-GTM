using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.Workflow;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WorkflowsController(IWorkflowService service, IAuditLogService auditLogService, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IWorkflowService _service = service;
    private readonly IAuditLogService _auditLogService = auditLogService;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<Workflow>>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<Workflow>>> Get(string id)
    {
         var result = await _service.GetByIdAsync(id);
         if (!result.IsSucceeded || result.ReturnData == null) return NotFound(result);
         return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ResponseResult<Workflow>>> Create([FromBody] CreateWorkflowDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<Workflow>(errorMessage, ApiStatusCode.BadRequest));
        }

        var entity = new Workflow
        {
            Name = dto.Name,
            Description = dto.Description,
            WorkspaceId = dto.WorkspaceId,
            Steps = dto.Steps,
            Triggers = dto.Triggers,
            MinConfidenceScore = dto.MinConfidenceScore,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = CurrentUser.UserId,
            TenantId = CurrentUser.TenantId
        };
        
        var result = await _service.CreateAsync(entity);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseResult<Workflow>>> Update(string id, [FromBody] UpdateWorkflowDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<Workflow>(errorMessage, ApiStatusCode.BadRequest));
        }

        var existing = await _service.GetByIdAsync(id);
        if (!existing.IsSucceeded || existing.ReturnData == null) return NotFound(existing);

        // 🔒 Block editing if workflow is currently active
        if (existing.ReturnData.IsActive)
            return Ok(new ResponseResult<Workflow>("Cannot edit an active workflow. Please deactivate it first.", ApiStatusCode.BadRequest));

        var entity = existing.ReturnData;
        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.Steps = dto.Steps;
        entity.Triggers = dto.Triggers;
        entity.MinConfidenceScore = dto.MinConfidenceScore;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        var result = await _service.UpdateAsync(id, entity);
        return Ok(result);
    }

    [HttpPut("{id}/toggle-active")]
    public async Task<ActionResult<ResponseResult<object>>> ToggleActive(string id, [FromQuery] bool isActive, [FromQuery] bool activateAssignments = false)
    {
        var result = await _service.ToggleActiveStatusAsync(id, isActive, activateAssignments);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<string>>> Delete(string id) 
    { 
        var result = await _service.DeleteAsync(id);
        return Ok(result); 
    }

    [HttpGet("actions")]
    public async Task<ActionResult<ResponseResult<IEnumerable<ActionDefinition>>>> GetActions()
    {
        return Ok(await _service.GetActionsAsync());
    }

    [HttpGet("triggers")]
    public async Task<ActionResult<ResponseResult<IEnumerable<WorkflowTriggerDefinition>>>> GetTriggers()
    {
        return Ok(await _service.GetTriggersAsync());
    }

    [HttpGet("events")]
    public async Task<ActionResult<ResponseResult<IEnumerable<WorkflowEventDefinition>>>> GetEvents()
    {
        return Ok(await _service.GetEventsAsync());
    }
}
