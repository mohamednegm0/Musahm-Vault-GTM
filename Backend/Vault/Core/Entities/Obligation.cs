using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class Obligation : IEntity
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

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("due_date")]
    public DateTime DueDate { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = string.Empty;

    [BsonElement("assigned_to")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? AssignedTo { get; set; }

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }
}
