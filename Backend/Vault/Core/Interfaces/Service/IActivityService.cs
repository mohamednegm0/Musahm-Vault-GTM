using Core.DTOs;
using Core.DTOs.Activity;

namespace Core.Interfaces.Service;
public interface IActivityService
{
    Task<ResponseResult<IEnumerable<ActivityDetailsDto>>> GetAllAsync(CurrentUser currentUser);
    Task<ResponseResult<ActivityDetailsDto>> GetByIdAsync(string id, CurrentUser currentUser);
    Task<ResponseResult<object>> CreateAsync(Activity entity, CurrentUser currentUser);
    Task<ResponseResult<object>> UpdateAsync(string id, Activity entity, CurrentUser currentUser);
    Task<ResponseResult<object>> DeleteAsync(string id, CurrentUser currentUser);
}