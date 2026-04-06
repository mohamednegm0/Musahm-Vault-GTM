using Core.DTOs;
using Core.DTOs.DocumentAcl;
using Core.Entities;

namespace Core.Interfaces.Service;
public interface IDocumentAclService
{
    Task<ResponseResult<IEnumerable<DocumentAclDetailsDto>>> GetAllAsync();
    Task<ResponseResult<DocumentAclDetailsDto>> GetByIdAsync(string id);
    Task<ResponseResult<DocumentAcl>> CreateAsync(DocumentAcl entity, int? grcUserId, string? grcUserType);
    Task<ResponseResult<DocumentAcl>> UpdateAsync(string id, DocumentAcl entity);
    Task<ResponseResult<object>> DeleteAsync(string id, string actorUserId, string tenantId);
    Task<ResponseResult<IEnumerable<DocumentAclDetailsDto>>> GetByDocumentIdAsync(string documentId);
    Task<ResponseResult<IEnumerable<DocumentAclDetailsDto>>> GetDetailsByDocumentIdAsync(string documentId);
    Task<ResponseResult<object>> UpdatePermissionAsync(string documentId, string userId, string permission, string actorUserId, string tenantId);
}