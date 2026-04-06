using Core.DTOs;
using Core.DTOs.DocumentVersion;

namespace Core.Interfaces.Service;
public interface IDocumentVersionService
{
    Task<ResponseResult<IEnumerable<DocumentVersionDetailsDto>>> GetAllAsync(string? documentId = null);
    Task<ResponseResult<DocumentVersionDetailsDto>> GetByIdAsync(string id);
    Task<ResponseResult<DocumentVersion>> UploadDocumentVersionAsync(string documentId, Stream fileStream, string fileName, string userId, string tenantId);
    Task<ResponseResult<StringModel>> DeleteAsync(string id);
    Task<(Stream Stream, string FileName, string ContentType)> DownloadAsync(string id);
}
