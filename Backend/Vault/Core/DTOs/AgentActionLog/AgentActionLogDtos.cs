using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;

namespace Core.DTOs.AgentActionLog;

public class CreateAgentActionLogDto : IValidatableObject
{
    public string AgentType { get; set; } = string.Empty;
    public string ProposedAction { get; set; } = string.Empty;
    public string ApprovalStatus { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(AgentType))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Agent Type is required";
            yield return new ValidationResult(msg, new[] { nameof(AgentType) });
        }

        if (string.IsNullOrEmpty(ProposedAction))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Proposed Action is required";
            yield return new ValidationResult(msg, new[] { nameof(ProposedAction) });
        }
    }
}

public class UpdateAgentActionLogDto : IValidatableObject
{
    public string ApprovalStatus { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(ApprovalStatus))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Approval Status is required";
            yield return new ValidationResult(msg, new[] { nameof(ApprovalStatus) });
        }
    }
}
