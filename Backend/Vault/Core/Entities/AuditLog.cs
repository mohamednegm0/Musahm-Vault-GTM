using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class AuditLog : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("tenant_id")]
    public string? TenantId { get; set; }

    [BsonElement("actor_user_id")]
    public string? ActorUserId { get; set; }

    [BsonElement("action")]
    public string Action { get; set; } = string.Empty;

    [BsonElement("entity_type")]
    public string EntityType { get; set; } = string.Empty;

    [BsonElement("entity_id")]
    public string? EntityId { get; set; }

    [BsonElement("details")]
    public string? Details { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }
}
