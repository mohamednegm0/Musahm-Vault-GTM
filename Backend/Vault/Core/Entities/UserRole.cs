using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

/// <summary>
/// Links users to their assigned roles at the company level
/// Each user-role assignment is scoped to a specific company (TenantId)
/// </summary>
[BsonIgnoreExtraElements]
public class UserRole : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    /// <summary>
    /// User identifier (Vault's internal user ID from UserMap)
    /// </summary>
    [BsonElement("user_id")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("role_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string RoleId { get; set; } = string.Empty;

    /// <summary>
    /// Company/Tenant identifier - Required
    /// Links the role assignment to a specific company
    /// </summary>
    [BsonElement("tenant_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string TenantId { get; set; } = string.Empty;

    [BsonElement("assigned_at")]
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("assigned_by")]
    public string? AssignedBy { get; set; }
}
