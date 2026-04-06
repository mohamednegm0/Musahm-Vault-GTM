using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

public class UserMap : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("grc_user_id")]
    public int GrcUserId { get; set; }

    [BsonElement("grc_user_type")]
    public string GrcUserType { get; set; } = string.Empty;

    [BsonElement("grc_name_ar")]
    public string? GrcNameAr { get; set; }

    [BsonElement("grc_name_en")]
    public string? GrcNameEn { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("mobile_country_code")]
    public int? MobileCountryCode { get; set; }

    [BsonElement("mobile_number")]
    public string? MobileNumber { get; set; }

    [BsonElement("is_active")]
    public bool IsActive { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
