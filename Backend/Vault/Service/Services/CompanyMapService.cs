using Core.DTOs;
using Core.Entities;
using Core.Interfaces.Service;
using Core.Repository;
using static Core.Constants.ConstAppConfiguration;

namespace Service;

public class CompanyMapService : ICompanyMapService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJsonLocalizationService _localizationService;

    public CompanyMapService(IUnitOfWork unitOfWork, IJsonLocalizationService localizationService)
    {
        _unitOfWork = unitOfWork;
        _localizationService = localizationService;
    }

    public async Task<ResponseResult<IEnumerable<CompanyMap>>> GetAllAsync()
    {
        var maps = await _unitOfWork.CompanyMaps.GetAllAsync();
        return new ResponseResult<IEnumerable<CompanyMap>>(maps, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<CompanyMap>> GetByIdAsync(string id)
    {
        var map = await _unitOfWork.CompanyMaps.GetByIdAsync(id);
        if (map == null) return new ResponseResult<CompanyMap>(_localizationService.Get("Msg_CompanyMapNotFound"), ApiStatusCode.NotFound);
        return new ResponseResult<CompanyMap>(map, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<CompanyMap>> CreateAsync(CompanyMap entity)
    {
        await _unitOfWork.CompanyMaps.AddAsync(entity);
        return new ResponseResult<CompanyMap>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<CompanyMap>> UpdateAsync(string id, CompanyMap entity)
    {
        await _unitOfWork.CompanyMaps.UpdateAsync(id, entity);
        return new ResponseResult<CompanyMap>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> DeleteAsync(string id)
    {
        var map = await _unitOfWork.CompanyMaps.GetByIdAsync(id);
        if (map == null) return new ResponseResult<object>(_localizationService.Get("Msg_CompanyMapNotFound"), ApiStatusCode.NotFound);
        await _unitOfWork.CompanyMaps.DeleteAsync(id);
        return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_DeletedSuccessfully"));
    }
}
