using Core.DTOs;
using Core.Entities;

namespace Core.Interfaces.Service;
public interface ICompanyMapService
{
    Task<ResponseResult<IEnumerable<CompanyMap>>> GetAllAsync();
    Task<ResponseResult<CompanyMap>> GetByIdAsync(string id);
    Task<ResponseResult<CompanyMap>> CreateAsync(CompanyMap entity);
    Task<ResponseResult<CompanyMap>> UpdateAsync(string id, CompanyMap entity);
    Task<ResponseResult<object>> DeleteAsync(string id);
}
