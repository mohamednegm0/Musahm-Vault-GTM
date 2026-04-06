using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.Workspace;
using Microsoft.AspNetCore.Authorization;
using static Core.Constants.ConstAppConfiguration;
using static Core.Constants.ConstPermissions;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkspacesController(IWorkspaceService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IWorkspaceService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    // [HttpGet]
    // public async Task<ActionResult<ResponseResult<IEnumerable<Workspace>>>> Get()
    // {
    //     return Ok(await _service.GetWorkspacesAsync(CurrentUser));
    // }

    [HttpGet("{id}")]
    [Authorize(Policy = Workspaces.View)]
    public async Task<ActionResult<ResponseResult<Workspace>>> Get(string id)
    {
        return Ok(await _service.GetWorkspaceByIdAsync(id, CurrentUser));
    }

    [HttpGet("{id}/children")]
    public async Task<ActionResult<ResponseResult<IEnumerable<Workspace>>>> GetChildren(string id)
    {
        return Ok(await _service.GetWorkspacesByParentIdAsync(id, CurrentUser));
    }

    [HttpGet]
    [Authorize(Policy = Workspaces.View)]
    public async Task<ActionResult<ResponseResult<IEnumerable<Workspace>>>> GetRoot()
    {
        return Ok(await _service.GetRootWorkspacesAsync(CurrentUser));
    }

    [HttpPost]
    [Authorize(Policy = Workspaces.Create)]
    public async Task<ActionResult<ResponseResult<Workspace>>> Post([FromBody] CreateWorkspaceRequestDto request)
    {
        try
        {
            var validationResults = new List<ValidationResult>();
            if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
            {
                var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
                return Ok(new ResponseResult<Workspace>(errorMessage, ApiStatusCode.BadRequest));
            }

            return Ok(await _service.CreateWorkspaceAsync(request, CurrentUser));
        }
        catch (Exception ex)
        {
             return Ok(new ResponseResult<Workspace>(ex.Message, ApiStatusCode.BadRequest));
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = Workspaces.Edit)]
    public async Task<ActionResult<ResponseResult<Workspace>>> Put(string id, [FromBody] UpdateWorkspaceRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<Workspace>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _service.UpdateWorkspaceAsync(id, request, CurrentUser));
    }

    [HttpGet("quick-access")]
    public async Task<ActionResult<ResponseResult<IEnumerable<Workspace>>>> GetQuickAccess()
    {
        return Ok(await _service.GetQuickAccessWorkspacesAsync(CurrentUser));
    }

    [HttpPut("{id}/quick-access")]
    public async Task<ActionResult<ResponseResult<Workspace>>> SetQuickAccess(string id, [FromBody] SetQuickAccessDto request)
    {
        return Ok(await _service.SetQuickAccessAsync(id, request.IsQuickAccess, CurrentUser));
    }

    [HttpPut("{id}/deactivate")]
    [Authorize(Policy = Workspaces.Edit)]
    public async Task<ActionResult<ResponseResult<Workspace>>> Deactivate(string id)
    {
        return Ok(await _service.DeactivateWorkspaceAsync(id, CurrentUser));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = Workspaces.Delete)]
    public async Task<ActionResult<ResponseResult<StringModel>>> Delete(string id)
    {
        return Ok(await _service.DeleteWorkspaceAsync(id, CurrentUser));
    }

    
}
