using Core.Entities;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.DTOs.Workflow;

public class WorkflowDetailsDto : Core.Entities.Workflow
{
    [BsonIgnore]
    public string? CreatedByName { get; set; }
    
    [BsonIgnore]
    public string? UpdatedByName { get; set; }

    [BsonIgnore]
    public int ActiveInstancesCount { get; set; }

    [BsonIgnore]
    public int CompletedInstancesCount { get; set; }

    [BsonIgnore]
    public int AssignedFoldersCount { get; set; }

    [BsonIgnore]
    public int AssignedDocumentsCount { get; set; }

    [BsonIgnore]
    public List<string> Reviewers { get; set; } = new List<string>();

    [BsonIgnore]
    public List<string> Approvers { get; set; } = new List<string>();

    [BsonIgnore]
    public List<string> Assignees { get; set; } = new List<string>();
}
