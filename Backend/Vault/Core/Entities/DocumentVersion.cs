using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

using System.Text.Json.Serialization;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class DocumentVersion : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [BsonElement("tenant_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("tenant_id")]
    [JsonIgnore]
    public string? TenantId { get; set; }

    [BsonElement("document_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("document_id")]
    public string? DocumentId { get; set; }

    [BsonElement("version")]
    [JsonPropertyName("version")]
    public int Version { get; set; }

    [BsonElement("file_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("file_id")]
    public string? FileId { get; set; }

    [BsonElement("file_name")]
    [JsonPropertyName("file_name")]
    public string FileName { get; set; } = string.Empty;

    [BsonElement("file_size")]
    [JsonPropertyName("file_size")]
    public long FileSize { get; set; }

    [BsonElement("content_type")]
    [JsonPropertyName("content_type")]
    public string ContentType { get; set; } = string.Empty;

    [BsonElement("file_content")]
    [JsonPropertyName("file_content")]
    public byte[]? FileContent { get; set; }

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("created_by")]
    public string? CreatedBy { get; set; }

    [BsonElement("created_at")]
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("legal_hold")]
    [JsonPropertyName("legal_hold")]
    public bool LegalHold { get; set; }

}
