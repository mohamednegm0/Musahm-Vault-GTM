using Core.DTOs;
using Core.DTOs.Obligation;

namespace Core.Interfaces.Service;
public interface IObligationService
{
    Task<ResponseResult<IEnumerable<ObligationDetailsDto>>> GetAllAsync();
    Task<ResponseResult<ObligationDetailsDto>> GetByIdAsync(string id);
    Task<ResponseResult<Obligation>> CreateAsync(Obligation entity);
    Task<ResponseResult<Obligation>> UpdateAsync(string id, Obligation entity);
    Task<ResponseResult<object>> DeleteAsync(string id);
    Task<ResponseResult<IEnumerable<ObligationDetailsDto>>> GetUpcomingObligationsAsync(int days = 7);
}