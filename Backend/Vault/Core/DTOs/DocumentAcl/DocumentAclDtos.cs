using System.ComponentModel.DataAnnotations;
using System.Linq;
using Core.Interfaces.Service;

namespace Core.DTOs.DocumentAcl;

public class CreateDocumentAclDto : IValidatableObject
{
    public string? DocumentId { get; set; }
    public string? UserId { get; set; }
    public int? GrcUserId { get; set; }
    public string? GrcUserType { get; set; }
    public string? Permission { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(DocumentId))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Document ID is required";
            yield return new ValidationResult(msg, new[] { nameof(DocumentId) });
        }

        if (string.IsNullOrEmpty(UserId) && !GrcUserId.HasValue)
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "UserId or GrcUserId is required";
            yield return new ValidationResult(msg, new[] { nameof(UserId), nameof(GrcUserId) });
        }
    }
}
