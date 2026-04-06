using System.ComponentModel.DataAnnotations;
using Core.Interfaces.Service;
using Core.Entities;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.DTOs.WorkspaceMember;

public class CreateWorkspaceMemberDto : IValidatableObject
{
    public string? WorkspaceId { get; set; }
    public int? GrcUserId { get; set; }
    public string? GrcUserType { get; set; }
    public string Role { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(WorkspaceId))
        {
            var msg = localizationService != null ? localizationService.Get("Val_SelectionRequired") : "Workspace is required";
            yield return new ValidationResult(msg, new[] { nameof(WorkspaceId) });
        }

        if (GrcUserId == null || string.IsNullOrEmpty(GrcUserType))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "GrcUser is required";
            yield return new ValidationResult(msg, new[] { nameof(GrcUserId) });
        }

        if (string.IsNullOrEmpty(Role))
        {
            var msg = localizationService != null ? localizationService.Get("Val_SelectionRequired") : "Role is required";
            yield return new ValidationResult(msg, new[] { nameof(Role) });
        }
    }
}

public class UpdateWorkspaceMemberDto : IValidatableObject
{
    public string Role { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Role))
        {
            var msg = localizationService != null ? localizationService.Get("Val_SelectionRequired") : "Role is required";
            yield return new ValidationResult(msg, new[] { nameof(Role) });
        }
    }
}

public class InviteMemberRequestDto : IValidatableObject
{
    public string WorkspaceId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var localizationService = validationContext.GetService(typeof(IJsonLocalizationService)) as IJsonLocalizationService;

        if (string.IsNullOrEmpty(Email))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Required") : "Email is required";
            yield return new ValidationResult(msg, new[] { nameof(Email) });
        }
        else if (!new EmailAddressAttribute().IsValid(Email))
        {
            var msg = localizationService != null ? localizationService.Get("Val_Email") : "Invalid email format";
            yield return new ValidationResult(msg, new[] { nameof(Email) });
        }

        if (string.IsNullOrEmpty(Role))
        {
            var msg = localizationService != null ? localizationService.Get("Val_SelectionRequired") : "Role is required";
            yield return new ValidationResult(msg, new[] { nameof(Role) });
        }

        }
    }


public class WorkspaceMemberDetailsDto : Core.Entities.WorkspaceMember
{
    [BsonIgnore]
    public string? Name { get; set; }
    [BsonIgnore]
    public string? Type { get; set; }
}
