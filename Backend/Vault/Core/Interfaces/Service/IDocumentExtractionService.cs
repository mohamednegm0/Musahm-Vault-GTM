using Core.DTOs;
using Core.DTOs.DocumentExtraction;

namespace Core.Interfaces.Service;
public interface IDocumentExtractionService
{
    Task<ResponseResult<IEnumerable<DocumentExtractionDto>>> GetAllAsync();
    Task<ResponseResult<DocumentExtractionDto>> GetByIdAsync(string id);
    Task<ResponseResult<DocumentExtraction>> CreateAsync(DocumentExtraction entity);
    Task<ResponseResult<DocumentExtraction>> UpdateAsync(string id, DocumentExtraction entity);
    Task<ResponseResult<object>> DeleteAsync(string id);
    Task<ResponseResult<IEnumerable<DocumentExtractionDto>>> GetPendingAsync();
    Task<ResponseResult<object>> ApproveAsync(string id);
    Task<ResponseResult<object>> RejectAsync(string id);
    Task<ResponseResult<DocumentExtraction>> ExtractDocumentAsync(string documentId, string userId, string tenantId);
}