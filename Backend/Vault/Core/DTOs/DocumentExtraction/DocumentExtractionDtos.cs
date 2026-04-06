using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Core.Interfaces.Service;

namespace Core.DTOs.DocumentExtraction;

public class CreateDocumentExtractionDto : IValidatableObject
{
    public string? DocumentId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public double Confidence { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(DocumentId))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Document ID is required";
            yield return new ValidationResult(msg, new[] { nameof(DocumentId) });
        }

        if (string.IsNullOrEmpty(DocumentType))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Document Type is required";
            yield return new ValidationResult(msg, new[] { nameof(DocumentType) });
        }
    }
}

public class DocumentExtractionDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("tenant_id")]
    public string? TenantId { get; set; }

    [JsonPropertyName("document_id")]
    public string? DocumentId { get; set; }

    [JsonPropertyName("document_type")]
    public string DocumentType { get; set; } = string.Empty;

    [JsonPropertyName("confidence")]
    public double Confidence { get; set; }

    [JsonPropertyName("fields")]
    public object? Fields { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = "Pending";

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("created_by")]
    public string? CreatedBy { get; set; }
    
    [JsonPropertyName("created_by_name")]
    public string? CreatedByName { get; set; }
}
