using Core.DTOs;
using Core.DTOs.AuditLog;

namespace Core.Interfaces.Service;
public interface IAuditLogService
{
    Task<ResponseResult<IEnumerable<AuditLogDetailsDto>>> GetAllAsync(string? tenantId = null);
    Task<ResponseResult<AuditLogDetailsDto>> GetByIdAsync(string id);
    Task<ResponseResult<AuditLog>> CreateAsync(AuditLog entity);
    Task<ResponseResult<AuditLog>> UpdateAsync(string id, AuditLog entity);
    Task<ResponseResult<object>> DeleteAsync(string id);

    /// <summary>Helper: logs an audit entry without the caller needing to construct an AuditLog object.</summary>
    Task LogAsync(string actorUserId, string tenantId, string action, string entityType, string? entityId, string? details = null);
}