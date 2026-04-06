namespace Core.Interfaces.Service;

public interface IEmailService
{
    Task SendInvitationEmailAsync(string toEmail, string invitationId, string documentName);
    Task SendInvitationAcceptedEmailAsync(string toEmail, string invitationId, string documentName);
    Task SendOtpEmailAsync(string toEmail, string otp, string documentName);
    Task SendTaskAssignedEmailAsync(string toEmail, string taskTitle, string taskId, string? documentName = null, string? documentId = null);
}
