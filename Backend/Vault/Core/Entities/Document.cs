using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class Document : IEntity
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

    [BsonElement("workspace_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("workspace_id")]
    public string? WorkspaceId { get; set; }

    [BsonElement("parent_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("parent_id")]
    public string? ParentId { get; set; }

    [BsonElement("title")]
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("document_type")]
    [JsonPropertyName("document_type")]
    public string DocumentType { get; set; } = string.Empty;

    [BsonElement("status")]
    [JsonPropertyName("status")]
    public string Status { get; set; } = "Active";

    [BsonElement("current_version")]
    [JsonPropertyName("current_version")]
    public int CurrentVersion { get; set; } = 1;

    [BsonElement("owner_user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("owner_user_id")]
    public string? OwnerUserId { get; set; }

    [BsonElement("tags")]
    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = new();

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

    [BsonElement("is_deleted")]
    [JsonPropertyName("is_deleted")]
    public bool IsDeleted { get; set; }

    [BsonElement("deleted_at")]
    [JsonPropertyName("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [BsonElement("deleted_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("deleted_by")]
    public string? DeletedBy { get; set; }
}