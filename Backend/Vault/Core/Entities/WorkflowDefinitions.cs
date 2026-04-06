using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;
using Core.Enums;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class WorkflowStep
{
    [BsonElement("step_id")]
    public string StepId { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("type")]
    public WorkflowStepType Type { get; set; } // Action, Logic, etc.

    // Dependency Graph: This step cannot start until these Step IDs are 'Completed'
    [BsonElement("depends_on")]
    public List<string> DependsOn { get; set; } = [];

    // Edge Configuration: Key is the Source Step ID (or 'start' for the start node edge)
    [BsonElement("edge_configs")]
    public Dictionary<string, WorkflowEdgeConfig> EdgeConfigs { get; set; } = new();

    // Configuration for Human Actions (Approve, Review, etc.)
    [BsonElement("action_config")]
    public WorkflowActionConfig? ActionConfig { get; set; }

    // Position for the Visual Builder
    [BsonElement("ui_metadata")]
    [JsonIgnore]
    public BsonDocument? UiMetadata { get; set; }

    [BsonIgnore]
    [JsonPropertyName("ui_metadata")]
    public object? UiMetadataPublic 
    {
        get => UiMetadata != null ? BsonTypeMapper.MapToDotNetValue(UiMetadata) : null;
        set 
        {
             if (value is JsonElement element)
             {
                 try 
                 {
                     UiMetadata = BsonDocument.Parse(element.GetRawText());
                 }
                 catch 
                 { 
                     // Fallback, maybe logging needed but keeping flow safe
                     UiMetadata = new BsonDocument();
                 }
             }
        }
    }
}

[BsonIgnoreExtraElements]
public class WorkflowEdgeConfig
{
    [BsonElement("label")]
    public string Label { get; set; } = string.Empty;

    // For Start -> Next Edge
    [BsonElement("trigger")]
    public WorkflowTrigger? Trigger { get; set; }

    // For Task -> Task Edge
    [BsonElement("forms")]
    public WorkflowTransitionForms? Forms { get; set; }
}

[BsonIgnoreExtraElements]
public class WorkflowTransitionForms
{
    [BsonElement("before")]
    public List<FormFieldConfig> Before { get; set; } = new();

    [BsonElement("during")]
    public List<FormFieldConfig> During { get; set; } = new();

    [BsonElement("after")]
    public List<FormFieldConfig> After { get; set; } = new();
}

[BsonIgnoreExtraElements]
public class FormFieldConfig
{
    [BsonElement("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [BsonElement("type")]
    public string Type { get; set; } = "text";
    
    [BsonElement("label")]
    public string Label { get; set; } = string.Empty;
    
    [BsonElement("required")]
    public bool Required { get; set; }
    
    [BsonElement("options")]
    public List<string>? Options { get; set; }
}

[BsonIgnoreExtraElements]
public class WorkflowActionConfig
{
    [BsonElement("action_type")]
    public WorkflowActionType ActionType { get; set; }

    [BsonElement("action_code")]
    public string? ActionCode { get; set; }

    [BsonElement("assignee_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? AssigneeId { get; set; }

    [BsonElement("assignee_ids")]
    [BsonRepresentation(BsonType.ObjectId)]
    public List<string>? AssigneeIds { get; set; } = new();

    [BsonElement("assignee_role")]
    public string? AssigneeRole { get; set; } // e.g. "Admin", "CFO" — display name only

    [BsonElement("assignee_role_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? AssigneeRoleId { get; set; } // The actual ObjectId of the role

    [BsonElement("assignee_roles")]
    public List<string>? AssigneeRoles { get; set; } = new();

    [BsonElement("instructions")]
    public string? Instructions { get; set; }

    // For "Fill" actions - lists of keys to fill?
    [BsonElement("required_fields")]
    public List<string>? RequiredFields { get; set; }

    [BsonIgnore]
    public string? AssigneeName { get; set; }

    [BsonIgnore]
    public List<string>? AssigneeNames { get; set; }
}

[BsonIgnoreExtraElements]
public class WorkflowTrigger
{
    [BsonElement("type")]
    public WorkflowTriggerType Type { get; set; }

    [BsonElement("trigger_code")]
    public string? TriggerCode { get; set; }

    [BsonElement("value")]
    public string Value { get; set; } = string.Empty; // FolderId, ".pdf", etc.

    [BsonElement("group_id")]
    public string? GroupId { get; set; }
    
    // Specific logic for confidence checks could be here or global
}

[BsonIgnoreExtraElements]
public class WorkflowHistoryItem
{
    [BsonElement("step_id")]
    public string StepId { get; set; } = string.Empty;
    
    [BsonElement("action")]
    public string Action { get; set; } = string.Empty; // "Approved", "Rejected", "Started"
    
    [BsonElement("actor_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ActorId { get; set; }
    
    [BsonElement("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [BsonElement("comment")]
    public string? Comment { get; set; }
}

public class RuntimeWorkflowStep : WorkflowStep
{
    [BsonElement("status")]
    public int Status { get; set; } = StepStatus.Pending;

    [BsonElement("assigned_task_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? AssignedTaskId { get; set; }

    [BsonElement("started_at")]
    public DateTime? StartedAt { get; set; }

    [BsonElement("completed_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CompletedBy { get; set; }

    [BsonElement("completed_at")]
    public DateTime? CompletedAt { get; set; }

    [BsonElement("output_data")]
    [JsonIgnore]
    public BsonDocument? OutputData { get; set; } // User inputs from 'Fill' actions

    [BsonIgnore]
    [JsonPropertyName("output_data")]
    public object? OutputDataPublic => OutputData != null ? BsonTypeMapper.MapToDotNetValue(OutputData) : null;

    [BsonIgnore]
    public string? CompletedByName { get; set; }
}
