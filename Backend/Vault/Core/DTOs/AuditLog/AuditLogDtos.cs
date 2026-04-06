using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;

namespace Core.DTOs.AuditLog;

public class AuditLogDetailsDto
{
    public string? Id { get; set; }
    public string? ActorUserId { get; set; }
    public string? ActorUserName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? EntityName { get; set; }
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAuditLogDto : IValidatableObject
{
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? Details { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Action))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Action is required";
            yield return new ValidationResult(msg, new[] { nameof(Action) });
        }

        if (string.IsNullOrEmpty(EntityType))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Entity Type is required";
            yield return new ValidationResult(msg, new[] { nameof(EntityType) });
        }
    }
}
