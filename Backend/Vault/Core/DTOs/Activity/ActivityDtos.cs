using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Core.Interfaces.Service;

namespace Core.DTOs.Activity;

public class CreateActivityDto : IValidatableObject
{
    [JsonPropertyName("workspaceId")]
    public string? WorkspaceId { get; set; }
    
    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;
    
    [JsonPropertyName("details")]
    public string Details { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Action))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Action is required";
            yield return new ValidationResult(msg, new[] { nameof(Action) });
        }
    }
}

public class ActivityDetailsDto
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }
    
    [JsonPropertyName("tenantId")]
    public string? TenantId { get; set; }
    
    [JsonPropertyName("workspaceId")]
    public string? WorkspaceId { get; set; }
    
    [JsonPropertyName("workspaceName")]
    public string? WorkspaceName { get; set; }
    
    [JsonPropertyName("documentId")]
    public string? DocumentId { get; set; }
    
    [JsonPropertyName("documentName")]
    public string? DocumentName { get; set; }
    
    [JsonPropertyName("userId")]
    public string? UserId { get; set; }
    
    [JsonPropertyName("userName")]
    public string? UserName { get; set; }
    
    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;
    
    [JsonPropertyName("details")]
    public string Details { get; set; } = string.Empty;
    
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }
}
