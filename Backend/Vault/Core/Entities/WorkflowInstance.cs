using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;
using Core.Interfaces;
using Core.Enums;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class WorkflowInstance : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("tenant_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TenantId { get; set; }

    [BsonElement("workspace_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? WorkspaceId { get; set; }

    [BsonElement("workflow_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? WorkflowId { get; set; }

    [BsonElement("workflow_name")]
    public string WorkflowName { get; set; } = string.Empty;

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public WorkflowStatus Status { get; set; } = WorkflowStatus.Active;

    [BsonElement("current_step_ids")]
    public List<string> CurrentStepIds { get; set; } = new();

    // Snapshot of the steps with their runtime status
    [BsonElement("steps")]
    public List<RuntimeWorkflowStep> Steps { get; set; } = new();

    [BsonElement("history")]
    public List<WorkflowHistoryItem> History { get; set; } = new();

    [BsonElement("context")]
    [JsonIgnore]
    public BsonDocument? Context { get; set; }

    [BsonIgnore]
    [JsonPropertyName("context")]
    public object? ContextPublic => Context != null ? BsonTypeMapper.MapToDotNetValue(Context) : null;

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }
}
