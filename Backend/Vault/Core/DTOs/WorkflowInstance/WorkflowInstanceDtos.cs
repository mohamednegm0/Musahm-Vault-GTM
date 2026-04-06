using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;
using Core.Enums;

namespace Core.DTOs.WorkflowInstance;

public class CreateWorkflowInstanceDto : IValidatableObject
{
    public string? WorkflowId { get; set; }
    public string? WorkspaceId { get; set; }
    public Dictionary<string, object>? Context { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(WorkflowId))
        {
            var msg = localizationService != null ? localizationService.Get("Val_SelectionRequired") : "Workflow is required";
            yield return new ValidationResult(msg, new[] { nameof(WorkflowId) });
        }

        if (string.IsNullOrEmpty(WorkspaceId))
        {
            var msg = localizationService != null ? localizationService.Get("Val_SelectionRequired") : "Workspace is required";
            yield return new ValidationResult(msg, new[] { nameof(WorkspaceId) });
        }
    }
}

public class UpdateWorkflowInstanceDto : IValidatableObject
{
    public WorkflowStatus Status { get; set; }
    public Dictionary<string, object>? Context { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Status validation if needed
        yield break;
    }
}
