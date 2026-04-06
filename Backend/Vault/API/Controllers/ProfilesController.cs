using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.Profile;
using Core.DTOs.Account;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfilesController(IGRCService gRCService, IAuditLogService auditLogService, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IGRCService _gRCService = gRCService;
    private readonly IAuditLogService _auditLogService = auditLogService;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<UserProfileDto>>> GetProfile()
    {
        var result = await _gRCService.GetProfileAsync();
        return Ok(result);
    }

    [HttpPost("update")]
    public async Task<ActionResult<ResponseResult<StringModel>>> UpdateProfile([FromBody] UserProfileDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<StringModel>(errorMessage, ApiStatusCode.BadRequest));
        }

        var result = await _gRCService.UpdateProfileAsync(request);

        if (result.IsSucceeded)
        {
            await _auditLogService.CreateAsync(new AuditLog
            {
                ActorUserId = CurrentUser.UserId,
                Action = "Update Profile",
                EntityType = "User",
                EntityId = CurrentUser.UserId,
                Details = "User updated their profile information.",
                CreatedAt = DateTime.UtcNow,
                TenantId = CurrentUser.TenantId
            });
        }

        return Ok(result);
    }

    [HttpPost("change-password")]
    public async Task<ActionResult<ResponseResult<StringModel>>> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<StringModel>(errorMessage, ApiStatusCode.BadRequest));
        }

        var result = await _gRCService.ChangePasswordAsync(request);

        if (result.IsSucceeded)
        {
            await _auditLogService.CreateAsync(new AuditLog
            {
                ActorUserId = CurrentUser.UserId,
                Action = "Change Password",
                EntityType = "User",
                EntityId = CurrentUser.UserId,
                Details = "User changed their password.",
                CreatedAt = DateTime.UtcNow,
                TenantId = CurrentUser.TenantId
            });
        }

        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<ActionResult<ResponseResult<IEnumerable<CompanyUserDto>>>> GetUsers()
    {
        var result = await _gRCService.GetUsersAsync();
        return Ok(result);
    }
}
