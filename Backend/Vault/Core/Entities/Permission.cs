using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

/// <summary>
/// Permission entity representing granular permissions
/// Examples: Permissions.Documents.Create, Permissions.Workspaces.Edit
/// </summary>
[BsonIgnoreExtraElements]
public class Permission : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    /// <summary>
    /// Unique permission code (e.g., "Permissions.Documents.View")
    /// </summary>
    [BsonElement("code")]
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Module name (e.g., "Documents", "Workspaces", "Tasks")
    /// </summary>
    [BsonElement("module")]
    public string Module { get; set; } = string.Empty;

    /// <summary>
    /// Action name (e.g., "View", "Create", "Edit", "Delete")
    /// </summary>
    [BsonElement("action")]
    public string Action { get; set; } = string.Empty;

    [BsonElement("name_ar")]
    public string NameAr { get; set; } = string.Empty;

    [BsonElement("name_en")]
    public string NameEn { get; set; } = string.Empty;

    [BsonElement("description_ar")]
    public string? DescriptionAr { get; set; }

    [BsonElement("description_en")]
    public string? DescriptionEn { get; set; }

    [BsonElement("is_active")]
    public bool IsActive { get; set; } = true;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
