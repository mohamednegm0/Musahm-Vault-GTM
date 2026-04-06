using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.Obligation;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ObligationsController(IObligationService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IObligationService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<Obligation>>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<Obligation>>> Get(string id) => Ok(await _service.GetByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<ResponseResult<Obligation>>> Create([FromBody] CreateObligationDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<Obligation>(errorMessage, ApiStatusCode.BadRequest));
        }

        var entity = new Obligation
        {
            Title = dto.Title,
            Description = dto.Description,
            DocumentId = dto.DocumentId,
            DueDate = dto.DueDate,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow,
            TenantId = CurrentUser.TenantId
        };

        await _service.CreateAsync(entity);
        return Ok(new ResponseResult<Obligation>(entity, ApiStatusCode.OK));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseResult<Obligation>>> Update(string id, [FromBody] UpdateObligationDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<Obligation>(errorMessage, ApiStatusCode.BadRequest));
        }

        var entityResult = await _service.GetByIdAsync(id);
        if (entityResult.ReturnData == null) return NotFound();

        entityResult.ReturnData.Title = dto.Title;
        entityResult.ReturnData.Description = dto.Description;
        entityResult.ReturnData.DueDate = dto.DueDate;
        entityResult.ReturnData.Status = dto.Status;

        await _service.UpdateAsync(id, entityResult.ReturnData);
        return Ok(new ResponseResult<Obligation>(entityResult.ReturnData, ApiStatusCode.OK));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<string>>> Delete(string id) 
    { 
        await _service.DeleteAsync(id); 
        return Ok(new ResponseResult<string>("Deleted successfully", ApiStatusCode.OK)); 
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<ResponseResult<IEnumerable<Obligation>>>> GetUpcoming([FromQuery] int days = 7)
    {
        return Ok(await _service.GetUpcomingObligationsAsync(days));
    }
}