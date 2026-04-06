using Api.Controllers;
using Core.DTOs;
using Core.DTOs.Workflow;
using Core.Interfaces.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WorkflowAssignmentsController : BaseApiController
{
    private readonly IWorkflowAssignmentService _service;

    public WorkflowAssignmentsController(IWorkflowAssignmentService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<ResponseResult<WorkflowAssignmentDto>>> Create(CreateWorkflowAssignmentDto dto)
    {
        return Ok(await _service.CreateAsync(dto, CurrentUser.UserId ?? string.Empty));
    }

    [HttpGet("target/{targetId}")]
    public async Task<ActionResult<ResponseResult<IEnumerable<WorkflowAssignmentDto>>>> GetByTarget(string targetId)
    {
        return Ok(await _service.GetByTargetAsync(targetId));
    }

    [HttpGet("workflow/{workflowId}")]
    public async Task<ActionResult<ResponseResult<IEnumerable<WorkflowAssignmentDto>>>> GetByWorkflow(string workflowId)
    {
        return Ok(await _service.GetByWorkflowAsync(workflowId));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseResult<WorkflowAssignmentDto>>> Update(string id, UpdateWorkflowAssignmentDto dto)
    {
        return Ok(await _service.UpdateAsync(id, dto, CurrentUser.UserId ?? string.Empty));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<StringModel>>> Delete(string id)
    {
        return Ok(await _service.DeleteAsync(id, CurrentUser.UserId ?? string.Empty));
    }

    [HttpGet("check-applicable")]
    public async Task<ActionResult<ResponseResult<Core.Entities.Workflow>>> GetApplicableWorkflow([FromQuery] string targetId, [FromQuery] string actionCode)
    {
        return Ok(await _service.GetApplicableWorkflowAsync(targetId, actionCode, CurrentUser.UserId ?? string.Empty));
    }
}
