using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;

namespace Core.DTOs.DocumentVersion;

public class CreateDocumentVersionDto : IValidatableObject
{
    [JsonPropertyName("document_id")]
    public string? DocumentId { get; set; }

    [JsonPropertyName("tenant_id")]
    public string? TenantId { get; set; }

    [JsonPropertyName("file_name")]
    public string FileName { get; set; } = string.Empty;

    [JsonPropertyName("storage_path")]
    public string StoragePath { get; set; } = string.Empty;

    [JsonPropertyName("version")]
    public int Version { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(DocumentId))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Document ID is required";
            yield return new ValidationResult(msg, new[] { nameof(DocumentId) });
        }

        if (string.IsNullOrEmpty(FileName))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "File Name is required";
            yield return new ValidationResult(msg, new[] { nameof(FileName) });
        }
    }
}
