using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.AgentActionLog;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;
[Route("api/[controller]")]
[ApiController]
public class AgentActionLogsController(IAgentActionLogService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IAgentActionLogService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<AgentActionLog>>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<AgentActionLog>>> Get(string id) => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<ResponseResult<AgentActionLog>>> Create([FromBody] CreateAgentActionLogDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<AgentActionLog>(errorMessage, ApiStatusCode.BadRequest));
        }

        var entity = new AgentActionLog
        {
            AgentType = dto.AgentType,
            ProposedAction = dto.ProposedAction,
            ApprovalStatus = dto.ApprovalStatus,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = CurrentUser.UserId,
            TenantId = CurrentUser.TenantId
        };

        await _service.CreateAsync(entity);
        return Ok(new ResponseResult<AgentActionLog>(entity, ApiStatusCode.OK));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseResult<AgentActionLog>>> Update(string id, [FromBody] UpdateAgentActionLogDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<AgentActionLog>(errorMessage, ApiStatusCode.BadRequest));
        }

        var entityResult = await _service.GetByIdAsync(id);
        if (entityResult.ReturnData == null) return NotFound();

        entityResult.ReturnData.ApprovalStatus = dto.ApprovalStatus;
        await _service.UpdateAsync(id, entityResult.ReturnData);
        return Ok(new ResponseResult<AgentActionLog>(entityResult.ReturnData, ApiStatusCode.OK));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<string>>> Delete(string id) 
    { 
        await _service.DeleteAsync(id); 
        return Ok(new ResponseResult<string>("Deleted successfully", ApiStatusCode.OK)); 
    }

    [HttpGet("pending")]
    public async Task<ActionResult<ResponseResult<IEnumerable<AgentActionLog>>>> GetPending()
    {
        return Ok(await _service.GetPendingAsync());
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult<ResponseResult<string>>> Approve(string id)
    {
        await _service.ApproveAsync(id);
        return Ok(new ResponseResult<string>("Approved successfully", ApiStatusCode.OK));
    }

    [HttpPost("{id}/reject")]
    public async Task<ActionResult<ResponseResult<string>>> Reject(string id)
    {
        await _service.RejectAsync(id);
        return Ok(new ResponseResult<string>("Rejected successfully", ApiStatusCode.OK));
    }
}