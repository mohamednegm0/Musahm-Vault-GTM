using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Core.Interfaces;

namespace Core.Entities;

[BsonIgnoreExtraElements]
public class WorkflowTriggerDefinition : IEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("code")]
    public string Code { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("display_name_en")]
    public string? DisplayNameEn { get; set; }

    [BsonElement("display_name_ar")]
    public string? DisplayNameAr { get; set; }
}
