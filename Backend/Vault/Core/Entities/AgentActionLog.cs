using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class AgentActionLog : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("tenant_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TenantId { get; set; }

    [BsonElement("agent_type")]
    public string AgentType { get; set; } = string.Empty;

    [BsonElement("triggered_by")]
    public string TriggeredBy { get; set; } = string.Empty;

    [BsonElement("proposed_action")]
    public string ProposedAction { get; set; } = string.Empty;

    [BsonElement("approval_status")]
    public string ApprovalStatus { get; set; } = string.Empty;

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }
}
