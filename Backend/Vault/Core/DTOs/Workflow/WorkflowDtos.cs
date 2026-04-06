using Core.Entities;
using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;

namespace Core.DTOs.Workflow;

public class CreateWorkflowDto : IValidatableObject
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? WorkspaceId { get; set; }
    public List<WorkflowStep> Steps { get; set; } = new();
    public List<WorkflowTrigger> Triggers { get; set; } = new();
    public double MinConfidenceScore { get; set; } = 0.8;
    public bool IsActive { get; set; } = true;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrWhiteSpace(Name))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required", "Name") : "Name is required";
            yield return new ValidationResult(msg, new[] { nameof(Name) });
        }
    }
}

public class UpdateWorkflowDto : IValidatableObject
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<WorkflowStep> Steps { get; set; } = new();
    public List<WorkflowTrigger> Triggers { get; set; } = new();
    public double MinConfidenceScore { get; set; }
    public bool IsActive { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrWhiteSpace(Name))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required", "Name") : "Name is required";
            yield return new ValidationResult(msg, new[] { nameof(Name) });
        }
    }
}
