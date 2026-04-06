using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class Activity : IEntity
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

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? UserId { get; set; }

    [BsonElement("action")]
    public string Action { get; set; } = string.Empty;

    [BsonElement("details")]
    public string Details { get; set; } = string.Empty;

    [BsonElement("document_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? DocumentId { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }
}
