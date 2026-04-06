using System.Text.Json.Serialization;

namespace Core.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum WorkspaceType
{
    Board,
    Legal,
    Compliance,
    HR,
    Projects
}
