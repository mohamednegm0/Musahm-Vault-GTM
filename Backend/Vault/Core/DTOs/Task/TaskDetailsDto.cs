using Core.Entities;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.DTOs.Task;

public class TaskDetailsDto : TaskEntity
{
    [BsonIgnore]
    public string? CreatedByName { get; set; }
    
    [BsonIgnore]
    public string? AssignedToName { get; set; }

    [BsonIgnore]
    public string? WorkflowName { get; set; }

    [BsonIgnore]
    public string? TriggerType { get; set; }

    [BsonIgnore]
    public string? RelatedItemName { get; set; }

    [BsonIgnore]
    public string? RelatedItemType { get; set; }
}
