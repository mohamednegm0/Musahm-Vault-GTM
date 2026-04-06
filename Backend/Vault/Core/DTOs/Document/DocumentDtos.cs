using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;

namespace Core.DTOs.Document;

public class CreateDocumentDto : IValidatableObject
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("workspace_id")]
    public string? WorkspaceId { get; set; }

    [JsonPropertyName("parent_id")]
    public string? ParentId { get; set; }

    [JsonPropertyName("document_type")]
    public string DocumentType { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "Active";



    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = new();

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Title))
        {
            var msg = localizationService != null 
                ? localizationService.Get("Val_Required") 
                : "Title is required";
            yield return new ValidationResult(msg, new[] { nameof(Title) });
        }

        if (string.IsNullOrEmpty(WorkspaceId))
        {
            var msg = localizationService != null 
                ? localizationService.Get("Val_SelectionRequired") 
                : "Workspace is required";
            yield return new ValidationResult(msg, new[] { nameof(WorkspaceId) });
        }
    }
}

public class UpdateDocumentDto : IValidatableObject
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = new();

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Title))
        {
            var msg = localizationService != null 
                ? localizationService.Get("Val_Required") 
                : "Title is required";
            yield return new ValidationResult(msg, new[] { nameof(Title) });
        }
    }
}
