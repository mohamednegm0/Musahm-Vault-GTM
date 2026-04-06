using Core.DTOs;
using Core.DTOs.Permission;
using Core.Interfaces.Service;
using static Core.Constants.ConstAppConfiguration;

namespace Service;

public class PermissionService : IPermissionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJsonLocalizationService _localizationService;

    public PermissionService(IUnitOfWork unitOfWork, IJsonLocalizationService localizationService)
    {
        _unitOfWork = unitOfWork;
        _localizationService = localizationService;
    }

    public async Task<ResponseResult<IEnumerable<Core.Entities.Permission>>> GetAllAsync()
    {
        var permissions = await _unitOfWork.Permissions.GetAllAsync();
        return new ResponseResult<IEnumerable<Core.Entities.Permission>>(permissions, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Core.Entities.Permission>> GetByIdAsync(string id)
    {
        var permission = await _unitOfWork.Permissions.GetByIdAsync(id);
        if (permission == null)
            return new ResponseResult<Core.Entities.Permission>(_localizationService.Get("Msg_PermissionNotFound"), ApiStatusCode.NotFound);
        
        return new ResponseResult<Core.Entities.Permission>(permission, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Core.Entities.Permission>> GetByCodeAsync(string code)
    {
        var permissions = await _unitOfWork.Permissions.FindAsync(p => p.Code == code);
        var permission = permissions.FirstOrDefault();
        
        if (permission == null)
            return new ResponseResult<Core.Entities.Permission>(_localizationService.Get("Msg_PermissionNotFound"), ApiStatusCode.NotFound);
        
        return new ResponseResult<Core.Entities.Permission>(permission, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<Core.Entities.Permission>>> GetByModuleAsync(string module)
    {
        var permissions = await _unitOfWork.Permissions.FindAsync(p => p.Module == module);
        return new ResponseResult<IEnumerable<Core.Entities.Permission>>(permissions, ApiStatusCode.OK);
    }
}
