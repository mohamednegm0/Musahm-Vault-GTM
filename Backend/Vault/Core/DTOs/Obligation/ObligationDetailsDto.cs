using Core.Entities;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.DTOs.Obligation;

public class ObligationDetailsDto : Core.Entities.Obligation
{
    [BsonIgnore]
    public string? CreatedByName { get; set; }
    
    [BsonIgnore]
    public string? AssignedToName { get; set; }
}
