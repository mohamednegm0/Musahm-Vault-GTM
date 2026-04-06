using Core.DTOs;
using Core.Interfaces.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class PermissionsController : BaseApiController
{
    private readonly IPermissionService _permissionService;

    public PermissionsController(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    /// <summary>
    /// Get all permissions
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<Core.Entities.Permission>>>> GetAll()
    {
        var result = await _permissionService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Get permission by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<Core.Entities.Permission>>> GetById(string id)
    {
        var result = await _permissionService.GetByIdAsync(id);
        return Ok(result);
    }

    /// <summary>
    /// Get permission by code
    /// </summary>
    [HttpGet("code/{code}")]
    public async Task<ActionResult<ResponseResult<Core.Entities.Permission>>> GetByCode(string code)
    {
        var result = await _permissionService.GetByCodeAsync(code);
        return Ok(result);
    }

    /// <summary>
    /// Get permissions by module
    /// </summary>
    [HttpGet("module/{module}")]
    public async Task<ActionResult<ResponseResult<IEnumerable<Core.Entities.Permission>>>> GetByModule(string module)
    {
        var result = await _permissionService.GetByModuleAsync(module);
        return Ok(result);
    }
}
