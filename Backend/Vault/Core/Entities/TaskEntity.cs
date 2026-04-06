using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class TaskEntity : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("tenant_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TenantId { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("action_config")]
    public WorkflowActionConfig? ActionConfig { get; set; }

    [BsonElement("workspace_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? WorkspaceId { get; set; }

    [BsonElement("related_entity")]
    public RelatedEntity? RelatedEntity { get; set; }

    [BsonElement("assigned_to")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? AssignedTo { get; set; }

    [BsonElement("candidate_users")]
    [BsonRepresentation(BsonType.ObjectId)]
    public List<string> CandidateUsers { get; set; } = new();

    [BsonElement("candidate_roles")]
    public List<string> CandidateRoles { get; set; } = new();

    [BsonElement("due_date")]
    public DateTime DueDate { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = string.Empty;

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("target_document_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TargetDocumentId { get; set; }
}

public class RelatedEntity
{
    [BsonElement("type")]
    public string Type { get; set; } = string.Empty;

    [BsonElement("id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
}
