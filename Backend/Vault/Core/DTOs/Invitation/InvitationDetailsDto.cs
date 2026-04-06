using Core.Entities;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.DTOs.Invitation;

public class InvitationDetailsDto : Core.Entities.Invitation
{
    [BsonIgnore]
    public string? CreatedByName { get; set; }
}
