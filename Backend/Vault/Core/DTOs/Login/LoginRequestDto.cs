using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;

namespace Core.DTOs.Login;

public class LoginRequestDto : IValidatableObject
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Email))
            yield return new ValidationResult(localizationService?.Get("Val_Required") ?? "Email is required", new[] { nameof(Email) });
        
        // Email format validation (if needed, could be added here or as a custom attribute)
        // For simplicity, only required check is implemented as per the provided Code Edit.

        if (string.IsNullOrEmpty(Password))
            yield return new ValidationResult(localizationService?.Get("Val_Required") ?? "Password is required", new[] { nameof(Password) });
    }
}
