using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class Workspace : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("tenant_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TenantId { get; set; }

    [BsonElement("parent_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ParentId { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("slug")]
    public string Slug { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("type")]
    public string Type { get; set; } = string.Empty;

    [BsonElement("retention_policy_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? RetentionPolicyId { get; set; }

    [BsonElement("legal_hold")]
    public bool LegalHold { get; set; }

    [BsonElement("settings")]
    public WorkspaceSettings? Settings { get; set; }

    [BsonElement("stats")]
    public WorkspaceStats Stats { get; set; } = new WorkspaceStats();

    [BsonElement("is_active")]
    public bool IsActive { get; set; }

    [BsonElement("is_archived")]
    public bool IsArchived { get; set; }

    [BsonElement("is_quick_access")]
    public bool IsQuickAccess { get; set; }

    [BsonElement("created_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updated_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? UpdatedBy { get; set; }

    [BsonElement("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [BsonElement("is_deleted")]
    public bool IsDeleted { get; set; }

    [BsonElement("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [BsonElement("deleted_by")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? DeletedBy { get; set; }
}

public class WorkspaceSettings
{
    [BsonElement("privacy")]
    public string Privacy { get; set; } = string.Empty;

    [BsonElement("allow_invites")]
    public bool AllowInvites { get; set; }

    [BsonElement("storage_limit_mb")]
    public int StorageLimitMb { get; set; }
}

public class WorkspaceStats
{
    [BsonElement("total_members")]
    public int TotalMembers { get; set; }

    [BsonElement("last_activity")]
    public DateTime LastActivity { get; set; } = DateTime.UtcNow;
}