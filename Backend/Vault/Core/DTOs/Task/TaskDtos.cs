using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;

namespace Core.DTOs.Task;

public class CreateTaskDto : IValidatableObject
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? WorkspaceId { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Title) || Title.Length < 3)
        {
            var msg = localizationService != null ? localizationService.Get("Val_MinLength", 3) : "Title must be at least 3 characters long";
            yield return new ValidationResult(msg, new[] { nameof(Title) });
        }

        if (string.IsNullOrEmpty(Status))
        {
            var msg = localizationService != null ? localizationService.Get("Val_SelectionRequired") : "Status is required";
            yield return new ValidationResult(msg, new[] { nameof(Status) });
        }
    }
}

public class UpdateTaskDto : IValidatableObject
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Title) || Title.Length < 3)
        {
            var msg = localizationService != null ? localizationService.Get("Val_MinLength", 3) : "Title must be at least 3 characters long";
            yield return new ValidationResult(msg, new[] { nameof(Title) });
        }
    }
}
