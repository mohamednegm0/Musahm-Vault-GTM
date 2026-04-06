using Core.DTOs;
using Core.DTOs.Document;
using Core.DTOs.Identity;

namespace Core.Interfaces.Service;
public interface IDocumentService
{
    Task<ResponseResult<IEnumerable<DocumentDetailsDto>>> GetAllAsync(CurrentUser currentUser);
    Task<ResponseResult<DocumentDetailsDto>> GetByIdAsync(string id, CurrentUser currentUser);
    Task<ResponseResult<IEnumerable<DocumentDetailsDto>>> GetByWorkspaceIdAsync(string workspaceId, CurrentUser currentUser);
    Task<ResponseResult<Document>> UploadDocumentAsync(CreateDocumentDto dto, Stream fileStream, string fileName, CurrentUser currentUser);
    Task<ResponseResult<Document>> UpdateAsync(string id, UpdateDocumentDto dto, CurrentUser currentUser);
    Task<ResponseResult<StringModel>> DeleteAsync(string id, CurrentUser currentUser);
    Task<(Stream Stream, string FileName, string ContentType)> DownloadAsync(string id, CurrentUser currentUser, bool isPreview = false);
}

