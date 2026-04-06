using Core.DTOs;
using Core.Entities;
using System.Linq;
using Core.Interfaces.Service;
using Core.Repository;
using static Core.Constants.ConstAppConfiguration;

namespace Service;

public class UserMapService : IUserMapService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJsonLocalizationService _localizationService;

    public UserMapService(IUnitOfWork unitOfWork, IJsonLocalizationService localizationService)
    {
        _unitOfWork = unitOfWork;
        _localizationService = localizationService;
    }

    public async Task<ResponseResult<IEnumerable<UserMap>>> GetAllAsync()
    {
        var users = await _unitOfWork.UserMaps.GetAllAsync();
        return new ResponseResult<IEnumerable<UserMap>>(users, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<UserMap>> GetByIdAsync(string id)
    {
        var user = await _unitOfWork.UserMaps.GetByIdAsync(id);
        if (user == null) return new ResponseResult<UserMap>(_localizationService.Get("Msg_UserMapNotFound"), ApiStatusCode.NotFound);
        return new ResponseResult<UserMap>(user, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<UserMap>> CreateAsync(UserMap entity)
    {
        await _unitOfWork.UserMaps.AddAsync(entity);
        return new ResponseResult<UserMap>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<UserMap>> UpdateAsync(string id, UserMap entity)
    {
        await _unitOfWork.UserMaps.UpdateAsync(id, entity);
        return new ResponseResult<UserMap>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> DeleteAsync(string id)
    {
        var user = await _unitOfWork.UserMaps.GetByIdAsync(id);
        if (user == null) return new ResponseResult<object>(_localizationService.Get("Msg_UserMapNotFound"), ApiStatusCode.NotFound);
        await _unitOfWork.UserMaps.DeleteAsync(id);
        return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_DeletedSuccessfully"));
    }

    public async Task<ResponseResult<UserMap>> GetByGrcUserIdAsync(int grcUserId)
    {
        var users = await _unitOfWork.UserMaps.FindAsync(x => x.GrcUserId == grcUserId);
        var user = users.FirstOrDefault();
        if (user == null) return new ResponseResult<UserMap>(_localizationService.Get("Msg_UserNotFound"), ApiStatusCode.NotFound);
        return new ResponseResult<UserMap>(user, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<UserMap>> GetByGrcIdAndTypeAsync(int grcUserId, string grcUserType)
    {
        var users = await _unitOfWork.UserMaps.FindAsync(x => x.GrcUserId == grcUserId && x.GrcUserType == grcUserType);
        var user = users.FirstOrDefault();
        if (user == null) return new ResponseResult<UserMap>(_localizationService.Get("Msg_UserNotFound"), ApiStatusCode.NotFound);
        return new ResponseResult<UserMap>(user, ApiStatusCode.OK);
    }
}
