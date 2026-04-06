using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.Task;
using static Core.Constants.ConstAppConfiguration;

using MongoDB.Bson;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TasksController(ITaskEntityService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly ITaskEntityService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<TaskDetailsDto>>>> GetAll()
    {
        if (CurrentUser.IsAdmin)
        {
            return Ok(await _service.GetAllAsync(CurrentUser));
        }

        var userId = CurrentUser.UserId;
        if (!string.IsNullOrEmpty(userId))
        {
            return Ok(await _service.GetByUserIdAsync(userId, CurrentUser));
        }

        return Ok(await _service.GetAllAsync(CurrentUser));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<TaskDetailsDto>>> Get(string id) => Ok(await _service.GetByIdAsync(id, CurrentUser));

    [HttpPost]
    public async Task<ActionResult<ResponseResult<TaskDetailsDto>>> Create([FromBody] CreateTaskDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<TaskDetailsDto>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _service.CreateAsync(dto, CurrentUser));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseResult<TaskDetailsDto>>> Update(string id, [FromBody] UpdateTaskDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<TaskDetailsDto>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _service.UpdateAsync(id, dto, CurrentUser));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<object>>> Delete(string id) 
    { 
        return Ok(await _service.DeleteAsync(id, CurrentUser)); 
    }

    [HttpGet("my-tasks")]
    public async Task<ActionResult<ResponseResult<IEnumerable<TaskDetailsDto>>>> GetMyTasks()
    {
        var userId = CurrentUser.UserId;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        return Ok(await _service.GetByUserIdAsync(userId, CurrentUser));
    }

    [HttpPut("{id}/complete")]
    public async Task<ActionResult<ResponseResult<object>>> Complete(string id, [FromBody] CompleteTaskDto? dto)
    {
        var outcome = dto?.Outcome ?? "Completed";
        BsonDocument? data = null;
        
        if (dto?.Data != null)
        {
             try 
             {
                data = new BsonDocument(dto.Data);
             } 
             catch 
             {
                // ignore conversion errors
             }
        }
        
        return Ok(await _service.CompleteTaskAsync(id, CurrentUser, outcome, data));
    }
}