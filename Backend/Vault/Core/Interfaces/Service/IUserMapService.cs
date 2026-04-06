using Core.DTOs;
using Core.Entities;

namespace Core.Interfaces.Service;
public interface IUserMapService
{
    Task<ResponseResult<IEnumerable<UserMap>>> GetAllAsync();
    Task<ResponseResult<UserMap>> GetByIdAsync(string id);
    Task<ResponseResult<UserMap>> CreateAsync(UserMap entity);
    Task<ResponseResult<UserMap>> UpdateAsync(string id, UserMap entity);
    Task<ResponseResult<object>> DeleteAsync(string id);
    Task<ResponseResult<UserMap>> GetByGrcUserIdAsync(int grcUserId);
    Task<ResponseResult<UserMap>> GetByGrcIdAndTypeAsync(int grcUserId, string grcUserType);
}
