using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.WorkspaceMember;
using Core.Entities;
using Core.Interfaces.Service;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WorkspaceMembersController(IWorkspaceMemberService service, IUserMapService userMapService, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IWorkspaceMemberService _service = service;
    private readonly IUserMapService _userMapService = userMapService;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<WorkspaceMember>>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<IEnumerable<WorkspaceMember>>>> Get(string id) => Ok(await _service.GetByWorkspaceIdAsync(id));

    [HttpGet("details/{workspaceId}")]
    public async Task<ActionResult<ResponseResult<IEnumerable<Core.DTOs.WorkspaceMember.WorkspaceMemberDetailsDto>>>> GetDetails(string workspaceId) => Ok(await _service.GetWorkspaceMembersDetailsAsync(workspaceId));

    [HttpPost]
    public async Task<ActionResult<ResponseResult<WorkspaceMember>>> Create([FromBody] CreateWorkspaceMemberDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<WorkspaceMember>(errorMessage, ApiStatusCode.BadRequest));
        }

        var entity = new WorkspaceMember
        {
            WorkspaceId = dto.WorkspaceId,
            Role = dto.Role,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = CurrentUser.UserId,
            TenantId = CurrentUser.TenantId
        };

        await _service.CreateAsync(entity, dto.GrcUserId, dto.GrcUserType);
        return Ok(new ResponseResult<WorkspaceMember>(entity, ApiStatusCode.OK));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseResult<WorkspaceMember>>> Update(string id, [FromBody] UpdateWorkspaceMemberDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<WorkspaceMember>(errorMessage, ApiStatusCode.BadRequest));
        }

        // Since GetByIdAsync was replaced by GetByWorkspaceIdAsync logic, we need to find the specific member differently for update
        // We will fallback to GetAllAsync and filter, or finding another way.
        // For now, let's use GetAllAsync + LINQ as a temporary measure if not performance critical, or assume the service handles specific ID updates internally differently.
        // Actually, we can assume the user wants access by ID for updates still.
        // We will fetch all and filter for now as a safe fallback without adding new repo methods immediately.
        var allMembersResult = await _service.GetAllAsync();
        var entity = allMembersResult.ReturnData?.FirstOrDefault(x => x.Id == id);
        
        if (entity == null) return NotFound();

        entity.Role = dto.Role;
        entity.UpdatedAt = DateTime.UtcNow;

        await _service.UpdateAsync(id, entity);
        return Ok(new ResponseResult<WorkspaceMember>(entity, ApiStatusCode.OK));
    }

    /*
    [HttpPost("invite")]
    public async Task<IActionResult> Invite([FromBody] InviteMemberRequestDto dto)
    {
        // Deprecated: Invitations are now Document-centric
        return Ok(new ResponseResult<string>("Workspace invitations are deprecated. Use /api/invitations for documents.", ApiStatusCode.BadRequest));
    }
    */

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<string>>> Delete(string id) 
    { 
        await _service.DeleteAsync(id); 
        return Ok(new ResponseResult<string>("Deleted successfully", ApiStatusCode.OK)); 
    }
}