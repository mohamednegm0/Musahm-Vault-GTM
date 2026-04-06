using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;

namespace Core.DTOs.Login;

public class LoginByTokenRequestDto : IValidatableObject
{
    public string Token { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Token))
            yield return new ValidationResult(
                localizationService?.Get("Val_Required") ?? "Token is required",
                new[] { nameof(Token) });
    }
}
