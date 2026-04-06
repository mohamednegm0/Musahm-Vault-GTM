using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

/// <summary>
/// Links a user to a company (tenant), storing both Vault internal IDs 
/// and GRC external IDs for cross-reference.
/// </summary>
public class CompanyUserMap : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("grc_user_id")]
    public int GrcUserId { get; set; }

    [BsonElement("tenant_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string TenantId { get; set; } = string.Empty;

    [BsonElement("grc_company_id")]
    public int GrcCompanyId { get; set; }
}
