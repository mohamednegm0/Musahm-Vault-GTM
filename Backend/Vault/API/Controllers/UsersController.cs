using Core.DTOs;
using Core.DTOs.User;
using Core.DTOs.Role;
using Core.DTOs.Login;
using Core.DTOs.GRC;
using Core.Entities;
using System.Threading;
using Core.Interfaces.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UsersController : BaseApiController
{
    private readonly IGRCService _grcService;
    private readonly IUserService _userService;
    private readonly IAuditLogService _auditLogService;

    public UsersController(IGRCService grcService, IUserService userService, IAuditLogService auditLogService)
    {
        _grcService = grcService;
        _userService = userService;
        _auditLogService = auditLogService;
    }

    [HttpPost("CreateUser")]
    public async Task<ActionResult<ResponseResult<bool>>> CreateUser(CreateUserDto payload, CancellationToken cancellationToken)
    {
        var result = await _grcService.CreateUserAsync(payload, CurrentUser, cancellationToken);
        
        if (result.IsSucceeded)
        {
            await _auditLogService.CreateAsync(new AuditLog
            {
                ActorUserId = CurrentUser.UserId,
                Action = "Create User",
                EntityType = "User",
                EntityId = payload.Email, // Email as identifier if ID not yet known or returned in bool result
                Details = $"System user '{payload.NameEn}' created.",
                CreatedAt = DateTime.UtcNow,
                TenantId = CurrentUser.TenantId
            });
        }

        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpPut("UpdateUser")]
    public async Task<ActionResult<ResponseResult<StringModel>>> UpdateUser(UpdateUserDto payload, CancellationToken cancellationToken)
    {
        var result = await _userService.UpdateUserAsync(payload, CurrentUser);
        return StatusCode(result.ApiStatusCode, result);
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<UserDto>>> GetUser(string id)
    {
        var result = await _userService.GetUserByIdAsync(id, CurrentUser);
        return StatusCode(result.ApiStatusCode, result);
    }

    /// <summary>
    /// Get all roles for a specific user
    /// </summary>
    [HttpGet("{userId}/roles")]
    public async Task<ActionResult<ResponseResult<List<Role>>>> GetUserRoles(string userId)
    {
        var result = await _userService.GetUserRolesAsync(userId);
        return StatusCode(result.ApiStatusCode, result);
    }

    /// <summary>
    /// Get all permissions for a specific user
    /// </summary>
    [HttpGet("{userId}/permissions")]
    public async Task<ActionResult<ResponseResult<List<string>>>> GetUserPermissions(string userId)
    {
        var result = await _userService.GetUserPermissionsAsync(userId);
        return StatusCode(result.ApiStatusCode, result);
    }

    /// <summary>
    /// Check if a user has a specific permission
    /// </summary>
    [HttpGet("{userId}/has-permission")]
    public async Task<ActionResult<ResponseResult<string>>> HasPermission(string userId, [FromQuery] string permissionCode)
    {
        var result = await _userService.HasPermissionAsync(userId, permissionCode);
        return StatusCode(result.ApiStatusCode, result);
    }
    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet()]
    public async Task<ActionResult<ResponseResult<List<UserDto>>>> GetUsers(CancellationToken cancellationToken)
    {
        var result = await _userService.GetUsersAsync(CurrentUser, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("AdminAsEmployeeChangeCompany/{companyId}")]
    public async Task<ActionResult<ResponseResult<LoginResponseDto>>> AdminAsEmployeeChangeCompany(int companyId, CancellationToken cancellationToken)
    {
        var result = await _grcService.AdminAsEmployeeChangeCompanyAsync(companyId, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("PartnerChangeCompany/{companyId}")]
    public async Task<ActionResult<ResponseResult<LoginResponseDto>>> PartnerChangeCompany(int companyId, CancellationToken cancellationToken)
    {
        var result = await _grcService.PartnerChangeCompanyAsync(companyId, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("PartnerCompanies/{partnerId}")]
    public async Task<ActionResult<ResponseResult<List<PartnerCompanyDto>>>> GetPartnerCompanies(int partnerId, [FromQuery] int? pageIndex, [FromQuery] int? pageSize, [FromQuery] string searchTerm = "", CancellationToken cancellationToken = default)
    {
        var result = await _grcService.GetPartnerCompaniesAsync(partnerId, pageIndex, pageSize, searchTerm, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("PartnerCompaniesCount/{partnerId}")]
    public async Task<ActionResult<ResponseResult<int>>> GetPartnerCompaniesCount(int partnerId, CancellationToken cancellationToken = default)
    {
        var result = await _grcService.GetPartnerCompaniesCountAsync(partnerId, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("PartnerCompaniesList/{partnerId}")]
    public async Task<ActionResult<ResponseResult<List<PartnerCompanyListDto>>>> GetPartnerCompaniesList(int partnerId, CancellationToken cancellationToken = default)
    {
        var result = await _grcService.GetPartnerCompaniesListAsync(partnerId, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("EmployeeChangeCompany/{companyId}")]
    public async Task<ActionResult<ResponseResult<LoginResponseDto>>> EmployeeChangeCompany(int companyId, CancellationToken cancellationToken)
    {
        var result = await _grcService.EmployeeChangeCompanyAsync(companyId, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("EmployeeCompanies/{employeeId}")]
    public async Task<ActionResult<ResponseResult<List<EmployeeCompanyDto>>>> GetEmployeeCompanies(int employeeId, [FromQuery] int? pageIndex, [FromQuery] int? pageSize, [FromQuery] string searchTerm = "", CancellationToken cancellationToken = default)
    {
        var result = await _grcService.GetEmployeeCompaniesAsync(employeeId, pageIndex, pageSize, searchTerm, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("EmployeeCompaniesCount/{employeeId}")]
    public async Task<ActionResult<ResponseResult<int>>> GetEmployeeCompaniesCount(int employeeId, CancellationToken cancellationToken = default)
    {
        var result = await _grcService.GetEmployeeCompaniesCountAsync(employeeId, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("EmployeeCompaniesList/{employeeId}")]
    public async Task<ActionResult<ResponseResult<List<EmployeeCompanyListDto>>>> GetEmployeeCompaniesList(int employeeId, CancellationToken cancellationToken = default)
    {
        var result = await _grcService.GetEmployeeCompaniesListAsync(employeeId, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }
}
