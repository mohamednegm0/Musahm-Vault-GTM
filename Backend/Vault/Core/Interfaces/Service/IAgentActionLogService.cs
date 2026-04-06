using Core.DTOs;
using Core.DTOs.AgentActionLog;

namespace Core.Interfaces.Service;
public interface IAgentActionLogService
{
    Task<ResponseResult<IEnumerable<AgentActionLogDetailsDto>>> GetAllAsync();
    Task<ResponseResult<AgentActionLogDetailsDto>> GetByIdAsync(string id);
    Task<ResponseResult<AgentActionLog>> CreateAsync(AgentActionLog entity);
    Task<ResponseResult<AgentActionLog>> UpdateAsync(string id, AgentActionLog entity);
    Task<ResponseResult<object>> DeleteAsync(string id);
    Task<ResponseResult<IEnumerable<AgentActionLogDetailsDto>>> GetPendingAsync();
    Task<ResponseResult<object>> ApproveAsync(string id);
    Task<ResponseResult<object>> RejectAsync(string id);
}