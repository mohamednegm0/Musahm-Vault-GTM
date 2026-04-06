using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class WorkspaceMember : IEntity
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

    [BsonElement("role")]
    public string Role { get; set; } = string.Empty;

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updated_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? UpdatedBy { get; set; }

    [BsonElement("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}
