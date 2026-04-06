using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.AuditLog;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuditLogsController(IAuditLogService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IAuditLogService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<AuditLogDetailsDto>>>> GetAll() => Ok(await _service.GetAllAsync(CurrentUser.TenantId));

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<AuditLogDetailsDto>>> Get(string id) => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<ResponseResult<AuditLog>>> Create([FromBody] CreateAuditLogDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<AuditLog>(errorMessage, ApiStatusCode.BadRequest));
        }

        var entity = new AuditLog
        {
            Action = dto.Action,
            EntityType = dto.EntityType,
            EntityId = dto.EntityId,
            Details = dto.Details,
            CreatedAt = DateTime.UtcNow,
            ActorUserId = CurrentUser.UserId
        };

        await _service.CreateAsync(entity);
        return Ok(new ResponseResult<AuditLog>(entity, ApiStatusCode.OK));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<string>>> Delete(string id) 
    { 
        await _service.DeleteAsync(id); 
        return Ok(new ResponseResult<string>("Deleted successfully", ApiStatusCode.OK)); 
    }
}