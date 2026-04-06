using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class Invitation : IEntity
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
    
    [BsonElement("workspace_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? WorkspaceId { get; set; }
    
    [BsonElement("file_name")]
    public string FileName { get; set; } = string.Empty;

    [BsonElement("file_size")]
    public long FileSize { get; set; }

    [BsonElement("content_type")]
    public string ContentType { get; set; } = string.Empty;

    [BsonElement("file_content")]
    [BsonRepresentation(BsonType.Binary)]
    public byte[]? FileContent { get; set; }

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("role")]
    public string Role { get; set; } = string.Empty;

    [BsonElement("status")]
    public string Status { get; set; } = string.Empty;

    [BsonElement("token")]
    public string Token { get; set; } = string.Empty;

    [BsonElement("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }

    [BsonElement("otp")]
    public string? Otp { get; set; }

    [BsonElement("otp_expires_at")]
    public DateTime? OtpExpiresAt { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }
}
