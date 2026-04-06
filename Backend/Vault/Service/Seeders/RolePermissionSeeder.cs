using Core.Constants;
using Core.Entities;
using Core.Repository;

namespace Service.Seeders;

public class RolePermissionSeeder
{
    private readonly IUnitOfWork _unitOfWork;

    public RolePermissionSeeder(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SeedAsync()
    {
        var existingRolePermissions = await _unitOfWork.RolePermissions.GetAllAsync();
        // Create a lookup for existing role-permission pairs: "RoleId|PermissionId"
        var existingPairs = new HashSet<string>(existingRolePermissions.Select(rp => $"{rp.RoleId}|{rp.PermissionId}"));

        var roles = await _unitOfWork.Roles.GetAllAsync();
        var permissions = await _unitOfWork.Permissions.GetAllAsync();
        var permissionDict = permissions.ToDictionary(p => p.Code, p => p.Id);

        // Viewer Permissions
        var viewerRole = roles.FirstOrDefault(r => r.Code == ConstRoles.Viewer);
        if (viewerRole?.Id != null)
        {
            await AssignPermissionsToRole(viewerRole.Id, permissionDict, existingPairs, new[]
            {
                "Permissions.Documents.View",
                "Permissions.Documents.Download",
                "Permissions.Workspaces.View",
            });
        }

        // Commenter Permissions (Viewer + Comment)
        var commenterRole = roles.FirstOrDefault(r => r.Code == ConstRoles.Commenter);
        if (commenterRole?.Id != null)
        {
            await AssignPermissionsToRole(commenterRole.Id, permissionDict, existingPairs, new[]
            {
                "Permissions.Documents.View",
                "Permissions.Documents.Download",
                "Permissions.Workspaces.View",
                "Permissions.Comments.View",
                "Permissions.Comments.Create",
            });
        }

        // Editor Permissions (Commenter + Create/Edit)
        var editorRole = roles.FirstOrDefault(r => r.Code == ConstRoles.Editor);
        if (editorRole?.Id != null)
        {
            await AssignPermissionsToRole(editorRole.Id, permissionDict, existingPairs, new[]
            {
                "Permissions.Documents.View",
                "Permissions.Documents.Create",
                "Permissions.Documents.Edit",
                "Permissions.Documents.Delete",
                "Permissions.Documents.Download",
                "Permissions.Documents.Share",
                "Permissions.Documents.CheckInOut",
                "Permissions.Documents.Restore",
                "Permissions.Documents.Move",
                "Permissions.Documents.Rename",
                "Permissions.Documents.ViewStats",
                "Permissions.Workspaces.View",
                "Permissions.WorkspaceMembers.View",
                "Permissions.WorkspaceMembers.Add",
                "Permissions.WorkspaceMembers.ManagePermissions",
                "Permissions.Comments.View",
                "Permissions.Comments.Create",
                "Permissions.Comments.Edit",
                "Permissions.Comments.Delete",
                "Permissions.Tasks.View",
                "Permissions.Tasks.Create",
                "Permissions.Tasks.Edit",
                "Permissions.Tasks.Assign",
            });
        }

        // Organizer Permissions (Editor + Manage Folders)
        var organizerRole = roles.FirstOrDefault(r => r.Code == ConstRoles.Organizer);
        if (organizerRole?.Id != null)
        {
            await AssignPermissionsToRole(organizerRole.Id, permissionDict, existingPairs, new[]
            {
                "Permissions.Documents.View",
                "Permissions.Documents.Create",
                "Permissions.Documents.Edit",
                "Permissions.Documents.Delete",
                "Permissions.Documents.Download",
                "Permissions.Documents.Share",
                "Permissions.Documents.CheckInOut",
                "Permissions.Documents.Restore",
                "Permissions.Documents.PermanentDelete",
                "Permissions.Documents.Move",
                "Permissions.Documents.Rename",
                "Permissions.Documents.ViewStats",
                "Permissions.Documents.ManageVersions",
                "Permissions.Workspaces.View",
                "Permissions.Workspaces.Create",
                "Permissions.Workspaces.Edit",
                "Permissions.Workspaces.Delete",
                "Permissions.Workspaces.ManageSettings",
                "Permissions.Workspaces.ManageMembers",
                "Permissions.Workspaces.MoveOutside",
                "Permissions.WorkspaceMembers.View",
                "Permissions.WorkspaceMembers.Add",
                "Permissions.WorkspaceMembers.Remove",
                "Permissions.WorkspaceMembers.ManagePermissions",
                "Permissions.Comments.View",
                "Permissions.Comments.Create",
                "Permissions.Comments.Edit",
                "Permissions.Comments.Delete",
                "Permissions.Tasks.View",
                "Permissions.Tasks.Create",
                "Permissions.Tasks.Edit",
                "Permissions.Tasks.Delete",
                "Permissions.Tasks.Assign",
                "Permissions.Tasks.Complete",
                "Permissions.Activities.View",
                "Permissions.Workflows.View",
                "Permissions.Workflows.Execute",
            });
        }

        // Admin Permissions (All)
        var adminRole = roles.FirstOrDefault(r => r.Code == ConstRoles.Admin);
        if (adminRole?.Id != null)
        {
            var allPermissionCodes = permissions.Select(p => p.Code).ToArray();
            await AssignPermissionsToRole(adminRole.Id, permissionDict, existingPairs, allPermissionCodes);
        }

        Console.WriteLine("Successfully synced role-permission mappings.");
    }

    private async Task AssignPermissionsToRole(string roleId, Dictionary<string, string?> permissionDict, HashSet<string> existingPairs, string[] permissionCodes)
    {
        foreach (var code in permissionCodes)
        {
            if (permissionDict.TryGetValue(code, out var permissionId) && permissionId != null)
            {
                var key = $"{roleId}|{permissionId}";
                if (!existingPairs.Contains(key))
                {
                    var rolePermission = new RolePermission
                    {
                        RoleId = roleId,
                        PermissionId = permissionId,
                        AssignedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.RolePermissions.AddAsync(rolePermission);
                    existingPairs.Add(key); // Mark as added to avoid duplicates in same run if any
                }
            }
        }
    }
}
