using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;
using System.Text.Json.Serialization;

namespace Core.Entities;

public class WorkflowAssignment : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [BsonElement("workflow_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("workflow_id")]
    public string WorkflowId { get; set; } = string.Empty;

    [BsonElement("target_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("target_id")]
    public string TargetId { get; set; } = string.Empty;

    [BsonElement("target_type")]
    [JsonPropertyName("target_type")]
    public string TargetType { get; set; } = string.Empty; // Workspace, Folder, Document

    [BsonElement("document_type_ids")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("document_type_ids")]
    public List<string> DocumentTypeIds { get; set; } = new();

    [BsonElement("role_ids")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("role_ids")]
    public List<string> RoleIds { get; set; } = new();

    [BsonElement("exception_user_ids")]
    [JsonPropertyName("exception_user_ids")]
    public List<string> ExceptionUserIds { get; set; } = new();

    [BsonElement("is_active")]
    [JsonPropertyName("is_active")]
    public bool IsActive { get; set; } = true;

    [BsonElement("created_at")]
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    [JsonPropertyName("created_by")]
    public string? CreatedBy { get; set; }

}
