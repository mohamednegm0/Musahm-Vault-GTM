using Core.Entities;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace Core.DTOs.Workspace;

public class WorkspaceDetailsDto : Core.Entities.Workspace
{
    [BsonIgnore]
    public string? CreatedByName { get; set; }
    
    [BsonIgnore]
    public string? UpdatedByName { get; set; }

    [BsonIgnore]
    [JsonPropertyName("documentCount")]
    public int DocumentCount { get; set; }

    [BsonIgnore]
    [JsonPropertyName("childCount")]
    public int ChildCount { get; set; }
}
