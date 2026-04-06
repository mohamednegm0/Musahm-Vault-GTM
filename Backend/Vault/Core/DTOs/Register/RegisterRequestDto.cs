using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;

namespace Core.DTOs.Register;

public class RegisterRequestDto : IValidatableObject
{
    public string FullNameAr { get; set; } = string.Empty;
    public string FullNameEn { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CompanyNameAr { get; set; } = string.Empty;
    public string CompanyNameEn { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Email))
        {
            yield return new ValidationResult(localizationService?.Get("Val_Required") ?? "Email is required", new[] { nameof(Email) });
        }
        else if (!new EmailAddressAttribute().IsValid(Email))
        {
            yield return new ValidationResult(localizationService?.Get("Val_Email") ?? "Invalid email format", new[] { nameof(Email) });
        }

        if (string.IsNullOrEmpty(FullNameAr))
            yield return new ValidationResult(localizationService?.Get("Val_Required") ?? "Arabic Name is required", new[] { nameof(FullNameAr) });
        
        if (string.IsNullOrEmpty(FullNameEn))
            yield return new ValidationResult(localizationService?.Get("Val_Required") ?? "English Name is required", new[] { nameof(FullNameEn) });
        else if (!System.Text.RegularExpressions.Regex.IsMatch(FullNameEn, "^[a-zA-Z ]+$"))
            yield return new ValidationResult(localizationService?.Get("Val_EnglishOnly", "English Name") ?? "English Name must contain English characters only", new[] { nameof(FullNameEn) });

        if (string.IsNullOrEmpty(Password))
            yield return new ValidationResult(localizationService?.Get("Val_Required") ?? "Password is required", new[] { nameof(Password) });

        if (Password != ConfirmPassword)
            yield return new ValidationResult("Passwords do not match", new[] { nameof(ConfirmPassword) });
    }
}
