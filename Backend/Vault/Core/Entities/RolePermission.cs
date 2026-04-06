using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

/// <summary>
/// Junction table linking Roles to Permissions (Many-to-Many relationship)
/// </summary>
[BsonIgnoreExtraElements]
public class RolePermission : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("role_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string RoleId { get; set; } = string.Empty;

    [BsonElement("permission_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PermissionId { get; set; } = string.Empty;

    [BsonElement("assigned_at")]
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}
