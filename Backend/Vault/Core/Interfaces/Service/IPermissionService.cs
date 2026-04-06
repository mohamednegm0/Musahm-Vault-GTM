using Core.DTOs;
using Core.DTOs.Permission;

namespace Core.Interfaces.Service;

public interface IPermissionService
{
    Task<ResponseResult<IEnumerable<Core.Entities.Permission>>> GetAllAsync();
    Task<ResponseResult<Core.Entities.Permission>> GetByIdAsync(string id);
    Task<ResponseResult<Core.Entities.Permission>> GetByCodeAsync(string code);
    Task<ResponseResult<IEnumerable<Core.Entities.Permission>>> GetByModuleAsync(string module);
}
