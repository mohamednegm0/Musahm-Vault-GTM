using MongoDB.Bson;

using Core.DTOs;
using Core.DTOs.Identity;
using Core.DTOs.Task;

namespace Core.Interfaces.Service;
public interface ITaskEntityService
{
    Task<ResponseResult<IEnumerable<TaskDetailsDto>>> GetAllAsync(CurrentUser currentUser);
    Task<ResponseResult<TaskDetailsDto>> GetByIdAsync(string id, CurrentUser currentUser);
    Task<ResponseResult<TaskDetailsDto>> CreateAsync(CreateTaskDto dto, CurrentUser currentUser);
    Task<ResponseResult<TaskDetailsDto>> UpdateAsync(string id, UpdateTaskDto dto, CurrentUser currentUser);
    Task<ResponseResult<object>> DeleteAsync(string id, CurrentUser currentUser);
    Task<ResponseResult<IEnumerable<TaskDetailsDto>>> GetByUserIdAsync(string userId, CurrentUser currentUser);
    Task<ResponseResult<object>> CompleteTaskAsync(string id, CurrentUser currentUser, string outcome = "Completed", BsonDocument? data = null);
}