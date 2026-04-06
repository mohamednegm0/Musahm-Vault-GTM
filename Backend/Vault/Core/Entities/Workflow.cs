using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class Workflow : IEntity
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

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("steps")]
    public List<WorkflowStep> Steps { get; set; } = new();

    [BsonElement("triggers")]
    public List<WorkflowTrigger> Triggers { get; set; } = new();

    [BsonElement("min_confidence_score")]
    public double MinConfidenceScore { get; set; } = 0.8;

    [BsonElement("is_active")]
    public bool IsActive { get; set; } = true;

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? UpdatedBy { get; set; }

    [BsonElement("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}
