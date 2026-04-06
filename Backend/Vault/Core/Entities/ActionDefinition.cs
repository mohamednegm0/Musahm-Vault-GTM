using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class ActionDefinition : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("code")]
    public string Code { get; set; } = string.Empty; // e.g. "approve", "preview"

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty; // e.g. "Approve Document"

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("display_name_ar")]
    public string? DisplayNameAr { get; set; }

    [BsonElement("display_name_en")]
    public string? DisplayNameEn { get; set; }

    [BsonElement("is_system")]
    public bool IsSystem { get; set; } = false; // To distinguish built-in vs custom
}
