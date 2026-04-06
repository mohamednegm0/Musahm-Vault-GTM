using Core.DTOs;
using Core.DTOs.Invitation;

namespace Core.Interfaces.Service;
public interface IInvitationService
{
    Task<ResponseResult<IEnumerable<InvitationDetailsDto>>> GetAllAsync();
    Task<ResponseResult<InvitationDetailsDto>> GetByIdAsync(string id);
    Task<ResponseResult<bool>> CreateInvitationsAsync(CreateInvitationDto dto, string userId, string tenantId);
    Task<ResponseResult<IEnumerable<InvitationDetailsDto>>> GetByDocumentIdAsync(string documentId);
    Task<ResponseResult<Invitation>> CreateAsync(Invitation entity);
    Task<ResponseResult<Invitation>> UpdateAsync(string id, Invitation entity);
    Task<ResponseResult<object>> DeleteAsync(string id);
    Task<ResponseResult<IEnumerable<InvitationDetailsDto>>> GetPendingAsync();
    Task<ResponseResult<object>> AcceptAsync(string id, string userId);
    Task<ResponseResult<object>> DeclineAsync(string id);
    Task<ResponseResult<Invitation>> GenerateOtpAsync(string id, string email);
    Task<(Stream Stream, string FileName, string ContentType)> VerifyOtpAsync(string id, string email, string otp);
}