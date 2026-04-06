using MongoDB.Bson;

namespace Core.DTOs.Task;

public class CompleteTaskDto
{
    public string Outcome { get; set; } = "Completed"; // e.g., "Approved", "Rejected"
    public Dictionary<string, object>? Data { get; set; } // e.g., Form fields
}
