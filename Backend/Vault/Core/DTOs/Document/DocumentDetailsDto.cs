using Core.Entities;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.DTOs.Document;

public class DocumentDetailsDto : Core.Entities.Document
{
    [BsonIgnore]
    public string? CreatedByName { get; set; }
    
    [BsonIgnore]
    public string? OwnerName { get; set; }
}
