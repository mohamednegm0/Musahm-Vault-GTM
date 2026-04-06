using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.Activity;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ActivitiesController(IActivityService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IActivityService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<ActivityDetailsDto>>>> GetAll() => Ok(await _service.GetAllAsync(CurrentUser));

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<ActivityDetailsDto>>> Get(string id) => Ok(await _service.GetByIdAsync(id, CurrentUser));

    [HttpPost]
    public async Task<ActionResult<ResponseResult<Activity>>> Create([FromBody] CreateActivityDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<Activity>(errorMessage, ApiStatusCode.BadRequest));
        }

        var entity = new Activity
        {
            WorkspaceId = dto.WorkspaceId,
            Action = dto.Action,
            Details = dto.Details,
            CreatedAt = DateTime.UtcNow
        };

        await _service.CreateAsync(entity, CurrentUser);
        return Ok(new ResponseResult<Activity>(entity, ApiStatusCode.OK));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<string>>> Delete(string id) 
    { 
        await _service.DeleteAsync(id, CurrentUser); 
        return Ok(new ResponseResult<string>("Deleted successfully", ApiStatusCode.OK)); 
    }
}