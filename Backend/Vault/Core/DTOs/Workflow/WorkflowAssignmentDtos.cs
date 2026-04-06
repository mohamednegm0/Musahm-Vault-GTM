using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Core.DTOs.Workflow;

public class CreateWorkflowAssignmentDto
{
    [JsonPropertyName("workflow_id")]
    [Required]
    public string WorkflowId { get; set; } = string.Empty;

    [JsonPropertyName("target_id")]
    [Required]
    public string TargetId { get; set; } = string.Empty;

    [JsonPropertyName("target_type")]
    [Required]
    public string TargetType { get; set; } = string.Empty; // Workspace, Folder, Document

    [JsonPropertyName("document_type_ids")]
    public List<string> DocumentTypeIds { get; set; } = new();

    [JsonPropertyName("role_ids")]
    public List<string> RoleIds { get; set; } = new();

    [JsonPropertyName("exception_user_ids")]
    public List<string> ExceptionUserIds { get; set; } = new();

    [JsonPropertyName("is_active")]
    public bool IsActive { get; set; } = true;
}

public class UpdateWorkflowAssignmentDto
{
    [JsonPropertyName("workflow_id")]
    public string? WorkflowId { get; set; }

    [JsonPropertyName("document_type_ids")]
    public List<string>? DocumentTypeIds { get; set; }

    [JsonPropertyName("role_ids")]
    public List<string>? RoleIds { get; set; }

    [JsonPropertyName("exception_user_ids")]
    public List<string>? ExceptionUserIds { get; set; }

    [JsonPropertyName("is_active")]
    public bool? IsActive { get; set; }
}

public class WorkflowAssignmentDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("workflow_id")]
    public string WorkflowId { get; set; } = string.Empty;
    
    [JsonPropertyName("target_id")]
    public string TargetId { get; set; } = string.Empty;

    [JsonPropertyName("target_type")]
    public string TargetType { get; set; } = string.Empty;

    [JsonPropertyName("document_type_ids")]
    public List<string> DocumentTypeIds { get; set; } = new();

    [JsonPropertyName("role_ids")]
    public List<string> RoleIds { get; set; } = new();

    [JsonPropertyName("exception_user_ids")]
    public List<string> ExceptionUserIds { get; set; } = new();
    
    [JsonPropertyName("is_active")]
    public bool IsActive { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("target_name")]
    public string? TargetName { get; set; }
}
