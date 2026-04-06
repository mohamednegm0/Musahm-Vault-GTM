using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

/// <summary>
/// Role entity representing user roles in the system
/// Examples: Viewer, Commenter, Editor, Organizer, Admin
/// </summary>
[BsonIgnoreExtraElements]
public class Role : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    /// <summary>
    /// Unique code identifier for the role (e.g., "viewer", "editor", "admin")
    /// </summary>
    [BsonElement("code")]
    public string Code { get; set; } = string.Empty;

    [BsonElement("name_ar")]
    public string NameAr { get; set; } = string.Empty;

    [BsonElement("name_en")]
    public string NameEn { get; set; } = string.Empty;

    [BsonElement("description_ar")]
    public string? DescriptionAr { get; set; }

    [BsonElement("description_en")]
    public string? DescriptionEn { get; set; }

    /// <summary>
    /// Hierarchical level: 1=Viewer, 2=Commenter, 3=Editor, 4=Organizer, 5=Admin
    /// </summary>
    [BsonElement("level")]
    public int Level { get; set; }

    [BsonElement("is_active")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// System roles cannot be deleted or modified
    /// </summary>
    [BsonElement("is_system_role")]
    public bool IsSystemRole { get; set; } = true;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}
