using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class DocumentExtraction : IEntity
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

    [BsonElement("document_type")]
    public string DocumentType { get; set; } = string.Empty;

    [BsonElement("confidence")]
    public double Confidence { get; set; }

    [BsonElement("fields")]
    public BsonDocument? Fields { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "Pending";

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }
}
