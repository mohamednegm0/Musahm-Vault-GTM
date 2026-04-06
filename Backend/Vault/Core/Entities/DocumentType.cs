using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

using Core.Interfaces;

namespace Core.Entities;

public class DocumentType : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("tenant_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TenantId { get; set; }

    [BsonElement("code")]
    public string Code { get; set; } = string.Empty;

    [BsonElement("name_ar")]
    public string NameAr { get; set; } = string.Empty;

    [BsonElement("name_en")]
    public string NameEn { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("icon")]
    public string? Icon { get; set; }

    [BsonElement("is_active")]
    public bool IsActive { get; set; } = true;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
