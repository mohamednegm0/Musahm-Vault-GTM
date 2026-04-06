using System.ComponentModel.DataAnnotations;
namespace Core.DTOs.Workspace;

public class UpdateWorkspaceRequestDto : IValidatableObject
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? RetentionPolicyId { get; set; }
    public bool LegalHold { get; set; }
    public WorkspaceSettingsDto? Settings { get; set; }
    
    // Updates might allow changing status/archived state, adding here if needed
    public bool IsActive { get; set; }
    public bool IsArchived { get; set; }

    public bool IsQuickAccess { get; set; }
    public string? ParentId { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(Core.Interfaces.Service.IJsonLocalizationService)) as Core.Interfaces.Service.IJsonLocalizationService;

        if (string.IsNullOrEmpty(Name) || Name.Length < 3)
        {
            var msg = localizationService != null ? localizationService.Get("Val_NameMinLength") : "Name must be at least 3 characters long";
            yield return new ValidationResult(msg, new string[] { "Name" });
        }
        if (!string.IsNullOrEmpty(RetentionPolicyId) && !System.Text.RegularExpressions.Regex.IsMatch(RetentionPolicyId, "^[0-9a-fA-F]{24}$"))
        {
             var msg = localizationService != null ? localizationService.Get("Val_InvalidId") : "Invalid ID format";
             yield return new ValidationResult(msg, new string[] { "RetentionPolicyId" });
        }
    }
}

public class SetQuickAccessDto
{
    public bool IsQuickAccess { get; set; }
}
