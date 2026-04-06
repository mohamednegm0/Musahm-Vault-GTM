using Core.DTOs;
using Core.DTOs.Role;
using Core.Entities;
using Core.Interfaces.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static Core.Constants.ConstAppConfiguration;
using static Core.Constants.ConstPermissions;

namespace Api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class RolesController : BaseApiController
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    /// <summary>
    /// Get all roles
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<Role>>>> GetAll()
    {
        var result = await _roleService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Get role by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<Role>>> GetById(string id)
    {
        var result = await _roleService.GetByIdAsync(id);
        return Ok(result);
    }

    /// <summary>
    /// Get role by code
    /// </summary>
    [HttpGet("code/{code}")]
    public async Task<ActionResult<ResponseResult<Role>>> GetByCode(string code)
    {
        var result = await _roleService.GetByCodeAsync(code);
        return Ok(result);
    }

    /// <summary>
    /// Create a new role
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ResponseResult<Role>>> Create([FromBody] CreateRoleDto dto)
    {
        var result = await _roleService.CreateAsync(dto, CurrentUser);
        return Ok(result);
    }

    /// <summary>
    /// Update an existing role
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseResult<Role>>> Update(string id, [FromBody] UpdateRoleDto dto)
    {
        var result = await _roleService.UpdateAsync(id, dto, CurrentUser);
        return Ok(result);
    }

    /// <summary>
    /// Delete a role
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<string>>> Delete(string id)
    {
        var result = await _roleService.DeleteAsync(id, CurrentUser);
        return Ok(result);
    }

    /// <summary>
    /// Get all permissions for a specific role
    /// </summary>
    [HttpGet("{roleId}/permissions")]
    public async Task<ActionResult<ResponseResult<List<Core.Entities.Permission>>>> GetRolePermissions(string roleId)
    {
        var result = await _roleService.GetRolePermissionsAsync(roleId);
        return Ok(result);
    }

    /// <summary>
    /// Assign permissions to a role
    /// </summary>
    [HttpPost("{roleId}/permissions")]
    public async Task<ActionResult<ResponseResult<string>>> AssignPermissions(
        string roleId, 
        [FromBody] AssignPermissionsToRoleDto dto)
    {
        var result = await _roleService.AssignPermissionsAsync(roleId, dto, CurrentUser);
        return Ok(result);
    }
}
