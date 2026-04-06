using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class DocumentAcl : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("tenant_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TenantId { get; set; }

    [BsonElement("document_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? DocumentId { get; set; }

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? UserId { get; set; }

    [BsonElement("permission")]
    public string Permission { get; set; } = string.Empty;

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }
}
