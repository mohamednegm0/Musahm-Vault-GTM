using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using Core.DTOs;
using Core.DTOs.WorkflowInstance;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WorkflowInstancesController(IWorkflowInstanceService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IWorkflowInstanceService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<WorkflowInstance>>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<WorkflowInstance>>> Get(string id)
    {
         var result = await _service.GetByIdAsync(id);
         if (!result.IsSucceeded || result.ReturnData == null) return NotFound(result);
         return Ok(result);
    }

    [HttpGet("workflow/{workflowId}")]
    public async Task<ActionResult<ResponseResult<IEnumerable<WorkflowInstance>>>> GetByWorkflow(string workflowId)
    {
        return Ok(await _service.GetByWorkflowAsync(workflowId));
    }

    [HttpGet("target/{targetId}")]
    public async Task<ActionResult<ResponseResult<IEnumerable<WorkflowInstanceDetailsDto>>>> GetByTarget(string targetId)
    {
        return Ok(await _service.GetByTargetAsync(targetId));
    }

    [HttpPost]
    public async Task<ActionResult<ResponseResult<WorkflowInstance>>> Create([FromBody] CreateWorkflowInstanceDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<WorkflowInstance>(errorMessage, ApiStatusCode.BadRequest));
        }

        var context = dto.Context != null ? new BsonDocument(dto.Context) : new BsonDocument();
        // StartWorkflowAsync returns ResponseResult<WorkflowInstance>
        return Ok(await _service.StartWorkflowAsync(dto.WorkflowId!, dto.WorkspaceId!, CurrentUser.UserId ?? "System", context));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseResult<WorkflowInstance>>> Update(string id, [FromBody] UpdateWorkflowInstanceDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<WorkflowInstance>(errorMessage, ApiStatusCode.BadRequest));
        }

        var existingResult = await _service.GetByIdAsync(id);
        if (!existingResult.IsSucceeded || existingResult.ReturnData == null) return NotFound(existingResult);

        var entity = existingResult.ReturnData;
        entity.Status = dto.Status;
        entity.Context = dto.Context != null ? new BsonDocument(dto.Context) : entity.Context;

        await _service.UpdateAsync(id, entity);
        return Ok(new ResponseResult<WorkflowInstance>(entity, ApiStatusCode.OK));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<string>>> Delete(string id) 
    { 
        var result = await _service.DeleteAsync(id);
        return Ok(result); 
    }
}