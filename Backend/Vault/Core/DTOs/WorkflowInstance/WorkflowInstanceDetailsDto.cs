using Core.Entities;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.DTOs.WorkflowInstance;

public class WorkflowInstanceDetailsDto : Core.Entities.WorkflowInstance
{
    [BsonIgnore]
    public string? CreatedByName { get; set; }

    [BsonIgnore]
    public List<string>? CurrentStepNames { get; set; }

    [BsonIgnore]
    public List<string>? CurrentAssignees { get; set; }

    [BsonIgnore]
    public string? TargetTitle { get; set; }

    [BsonIgnore]
    public string? DocumentTitle { get; set; }

    [BsonIgnore]
    public List<string>? ApproverNames { get; set; }

    [BsonIgnore]
    public string? TargetType { get; set; }

    [BsonIgnore]
    public int DocumentCount { get; set; }

    [BsonIgnore]
    public string? DocumentId { get; set; }

    [BsonIgnore]
    public int FolderCount { get; set; }
}
