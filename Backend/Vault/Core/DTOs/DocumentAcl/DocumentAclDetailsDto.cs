using MongoDB.Bson.Serialization.Attributes;

namespace Core.DTOs.DocumentAcl;

public class DocumentAclDetailsDto : Core.Entities.DocumentAcl
{
    [BsonIgnore]
    public string? Name { get; set; }
    [BsonIgnore]
    public string? Type { get; set; }
    
    [BsonIgnore]
    public string? CreatedByName { get; set; }
}
