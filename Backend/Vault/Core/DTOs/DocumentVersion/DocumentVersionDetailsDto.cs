using Core.Entities;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.DTOs.DocumentVersion;

public class DocumentVersionDetailsDto : Core.Entities.DocumentVersion
{
    [BsonIgnore]
    public string? CreatedByName { get; set; }
}
