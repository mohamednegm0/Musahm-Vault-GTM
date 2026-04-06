using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;

namespace Core.DTOs.Invitation;

public class CreateInvitationDto : IValidatableObject
{
    public string? DocumentId { get; set; }
    public List<string> Emails { get; set; } = new List<string>();
    public DateTime? ExpiryDate { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (Emails == null || !Emails.Any())
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "At least one email is required";
            yield return new ValidationResult(msg, new[] { nameof(Emails) });
        }
        else
        {
            var emailAttr = new EmailAddressAttribute();
            foreach (var email in Emails)
            {
                if (!emailAttr.IsValid(email))
                {
                    var msg = localizationService != null ? localizationService.Get("Val_Email") : $"Invalid email format: {email}";
                    yield return new ValidationResult(msg, new[] { nameof(Emails) });
                }
            }
        }

        if (string.IsNullOrEmpty(DocumentId))
        {
             yield return new ValidationResult("DocumentId is required", new[] { nameof(DocumentId) });
        }
    }
}

public class InvitationResponseDto
{
    public string DocumentId { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public List<Core.Entities.Invitation> Invitations { get; set; } = new List<Core.Entities.Invitation>();
}

public class GenerateOtpDto
{
    public string InvitationId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class VerifyOtpDto
{
    public string InvitationId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}
