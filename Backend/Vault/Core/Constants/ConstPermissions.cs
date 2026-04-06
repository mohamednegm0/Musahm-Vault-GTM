namespace Core.Constants;

public static class ConstPermissions
{
    // ================================================
    // Documents Module
    // ================================================
    public static class Documents
    {
        public const string View = "Permissions.Documents.View";
        public const string Create = "Permissions.Documents.Create";
        public const string Edit = "Permissions.Documents.Edit";
        public const string Delete = "Permissions.Documents.Delete";
        public const string Download = "Permissions.Documents.Download";
        public const string Share = "Permissions.Documents.Share";
        public const string CheckInOut = "Permissions.Documents.CheckInOut";
        public const string Restore = "Permissions.Documents.Restore";
        public const string PermanentDelete = "Permissions.Documents.PermanentDelete";
        public const string Move = "Permissions.Documents.Move";
        public const string Rename = "Permissions.Documents.Rename";
        public const string ViewStats = "Permissions.Documents.ViewStats";
        public const string ManageVersions = "Permissions.Documents.ManageVersions";
        public const string ManageACL = "Permissions.Documents.ManageACL";
    }

    // ================================================
    // Workspaces Module
    // ================================================
    public static class Workspaces
    {
        public const string View = "Permissions.Workspaces.View";
        public const string Create = "Permissions.Workspaces.Create";
        public const string Edit = "Permissions.Workspaces.Edit";
        public const string Delete = "Permissions.Workspaces.Delete";
        public const string ManageSettings = "Permissions.Workspaces.ManageSettings";
        public const string ManageMembers = "Permissions.Workspaces.ManageMembers";
        public const string MoveOutside = "Permissions.Workspaces.MoveOutside";
        public const string Export = "Permissions.Workspaces.Export";
    }

    // ================================================
    // Workspace Members Module
    // ================================================
    public static class WorkspaceMembers
    {
        public const string View = "Permissions.WorkspaceMembers.View";
        public const string Add = "Permissions.WorkspaceMembers.Add";
        public const string Remove = "Permissions.WorkspaceMembers.Remove";
        public const string ManagePermissions = "Permissions.WorkspaceMembers.ManagePermissions";
    }

    // ================================================
    // Comments Module
    // ================================================
    public static class Comments
    {
        public const string View = "Permissions.Comments.View";
        public const string Create = "Permissions.Comments.Create";
        public const string Edit = "Permissions.Comments.Edit";
        public const string Delete = "Permissions.Comments.Delete";
    }

    // ================================================
    // Tasks Module
    // ================================================
    public static class Tasks
    {
        public const string View = "Permissions.Tasks.View";
        public const string Create = "Permissions.Tasks.Create";
        public const string Edit = "Permissions.Tasks.Edit";
        public const string Delete = "Permissions.Tasks.Delete";
        public const string Assign = "Permissions.Tasks.Assign";
        public const string Complete = "Permissions.Tasks.Complete";
    }

    // ================================================
    // Workflows Module
    // ================================================
    public static class Workflows
    {
        public const string View = "Permissions.Workflows.View";
        public const string Create = "Permissions.Workflows.Create";
        public const string Edit = "Permissions.Workflows.Edit";
        public const string Delete = "Permissions.Workflows.Delete";
        public const string Execute = "Permissions.Workflows.Execute";
        public const string ManageInstances = "Permissions.Workflows.ManageInstances";
    }

    // ================================================
    // Activities Module
    // ================================================
    public static class Activities
    {
        public const string View = "Permissions.Activities.View";
        public const string Create = "Permissions.Activities.Create";
        public const string Delete = "Permissions.Activities.Delete";
    }

    // ================================================
    // Audit Logs Module
    // ================================================
    public static class AuditLogs
    {
        public const string View = "Permissions.AuditLogs.View";
        public const string Export = "Permissions.AuditLogs.Export";
    }

    // ================================================
    // Document Types Module
    // ================================================
    public static class DocumentTypes
    {
        public const string View = "Permissions.DocumentTypes.View";
        public const string Create = "Permissions.DocumentTypes.Create";
        public const string Edit = "Permissions.DocumentTypes.Edit";
        public const string Delete = "Permissions.DocumentTypes.Delete";
    }

    // ================================================
    // Invitations Module
    // ================================================
    public static class Invitations
    {
        public const string View = "Permissions.Invitations.View";
        public const string Create = "Permissions.Invitations.Create";
        public const string Edit = "Permissions.Invitations.Edit";
        public const string Delete = "Permissions.Invitations.Delete";
        public const string Accept = "Permissions.Invitations.Accept";
    }

    // ================================================
    // Obligations Module
    // ================================================
    public static class Obligations
    {
        public const string View = "Permissions.Obligations.View";
        public const string Create = "Permissions.Obligations.Create";
        public const string Edit = "Permissions.Obligations.Edit";
        public const string Delete = "Permissions.Obligations.Delete";
    }

    // ================================================
    // Users & Roles Module
    // ================================================
    public static class Users
    {
        public const string View = "Permissions.Users.View";
        public const string Create = "Permissions.Users.Create";
        public const string Edit = "Permissions.Users.Edit";
        public const string Delete = "Permissions.Users.Delete";
        public const string ManageRoles = "Permissions.Users.ManageRoles";
    }

    public static class Roles
    {
        public const string View = "Permissions.Roles.View";
        public const string Create = "Permissions.Roles.Create";
        public const string Edit = "Permissions.Roles.Edit";
        public const string Delete = "Permissions.Roles.Delete";
        public const string ManagePermissions = "Permissions.Roles.ManagePermissions";
    }

    // ================================================
    // System Administration
    // ================================================
    public static class System
    {
        public const string ViewSettings = "Permissions.System.ViewSettings";
        public const string ManageSettings = "Permissions.System.ManageSettings";
        public const string FullAccess = "Permissions.System.FullAccess";
    }
}