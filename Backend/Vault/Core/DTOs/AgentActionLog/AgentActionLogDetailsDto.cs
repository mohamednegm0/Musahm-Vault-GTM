using Core.Entities;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.DTOs.AgentActionLog;

public class AgentActionLogDetailsDto : Core.Entities.AgentActionLog
{
    [BsonIgnore]
    public string? CreatedByName { get; set; }
}
