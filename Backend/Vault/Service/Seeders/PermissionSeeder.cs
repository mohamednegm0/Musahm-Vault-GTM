using Core.Constants;
using Core.Entities;
using Core.Repository;

namespace Service.Seeders;

public class PermissionSeeder
{
    private readonly IUnitOfWork _unitOfWork;

    public PermissionSeeder(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SeedAsync()
    {
        var existingPermissions = await _unitOfWork.Permissions.GetAllAsync();
        var existingPermissionCodes = new HashSet<string>(existingPermissions.Select(p => p.Code));

        var permissions = new List<Permission>();

        // Documents Module
        permissions.AddRange(new[]
        {
            CreatePermission("Permissions.Documents.View", "Documents", "View", "عرض المستندات", "View Documents"),
            CreatePermission("Permissions.Documents.Create", "Documents", "Create", "إنشاء المستندات", "Create Documents"),
            CreatePermission("Permissions.Documents.Edit", "Documents", "Edit", "تعديل المستندات", "Edit Documents"),
            CreatePermission("Permissions.Documents.Delete", "Documents", "Delete", "حذف المستندات", "Delete Documents"),
            CreatePermission("Permissions.Documents.Download", "Documents", "Download", "تحميل المستندات", "Download Documents"),
            CreatePermission("Permissions.Documents.Share", "Documents", "Share", "مشاركة المستندات", "Share Documents"),
            CreatePermission("Permissions.Documents.CheckInOut", "Documents", "CheckInOut", "Check-IN/OUT المستندات", "Check-IN/OUT Documents"),
            CreatePermission("Permissions.Documents.Restore", "Documents", "Restore", "استعادة المستندات", "Restore Documents"),
            CreatePermission("Permissions.Documents.PermanentDelete", "Documents", "PermanentDelete", "حذف نهائي للمستندات", "Permanently Delete Documents"),
            CreatePermission("Permissions.Documents.Move", "Documents", "Move", "نقل المستندات", "Move Documents"),
            CreatePermission("Permissions.Documents.Rename", "Documents", "Rename", "إعادة تسمية المستندات", "Rename Documents"),
            CreatePermission("Permissions.Documents.ViewStats", "Documents", "ViewStats", "عرض إحصائيات المستندات", "View Document Stats"),
            CreatePermission("Permissions.Documents.ManageVersions", "Documents", "ManageVersions", "إدارة إصدارات المستندات", "Manage Document Versions"),
            CreatePermission("Permissions.Documents.ManageACL", "Documents", "ManageACL", "إدارة صلاحيات المستندات", "Manage Document ACL"),
        });

        // Workspaces Module
        permissions.AddRange(new[]
        {
            CreatePermission("Permissions.Workspaces.View", "Workspaces", "View", "عرض مساحات العمل", "View Workspaces"),
            CreatePermission("Permissions.Workspaces.Create", "Workspaces", "Create", "إنشاء مساحات العمل", "Create Workspaces"),
            CreatePermission("Permissions.Workspaces.Edit", "Workspaces", "Edit", "تعديل مساحات العمل", "Edit Workspaces"),
            CreatePermission("Permissions.Workspaces.Delete", "Workspaces", "Delete", "حذف مساحات العمل", "Delete Workspaces"),
            CreatePermission("Permissions.Workspaces.ManageSettings", "Workspaces", "ManageSettings", "إدارة إعدادات مساحات العمل", "Manage Workspace Settings"),
            CreatePermission("Permissions.Workspaces.ManageMembers", "Workspaces", "ManageMembers", "إدارة أعضاء مساحات العمل", "Manage Workspace Members"),
            CreatePermission("Permissions.Workspaces.MoveOutside", "Workspaces", "MoveOutside", "نقل خارج مساحة العمل", "Move Outside Workspace"),
            CreatePermission("Permissions.Workspaces.Export", "Workspaces", "Export", "تصدير مساحات العمل", "Export Workspaces"),
        });

        // WorkspaceMembers Module
        permissions.AddRange(new[]
        {
            CreatePermission("Permissions.WorkspaceMembers.View", "WorkspaceMembers", "View", "عرض الأعضاء", "View Members"),
            CreatePermission("Permissions.WorkspaceMembers.Add", "WorkspaceMembers", "Add", "إضافة أعضاء", "Add Members"),
            CreatePermission("Permissions.WorkspaceMembers.Remove", "WorkspaceMembers", "Remove", "إزالة أعضاء", "Remove Members"),
            CreatePermission("Permissions.WorkspaceMembers.ManagePermissions", "WorkspaceMembers", "ManagePermissions", "إدارة صلاحيات الأعضاء", "Manage Member Permissions"),
        });

        // Comments Module
        permissions.AddRange(new[]
        {
            CreatePermission("Permissions.Comments.View", "Comments", "View", "عرض التعليقات", "View Comments"),
            CreatePermission("Permissions.Comments.Create", "Comments", "Create", "إنشاء تعليقات", "Create Comments"),
            CreatePermission("Permissions.Comments.Edit", "Comments", "Edit", "تعديل التعليقات", "Edit Comments"),
            CreatePermission("Permissions.Comments.Delete", "Comments", "Delete", "حذف التعليقات", "Delete Comments"),
        });

        // Tasks Module
        permissions.AddRange(new[]
        {
            CreatePermission("Permissions.Tasks.View", "Tasks", "View", "عرض المهام", "View Tasks"),
            CreatePermission("Permissions.Tasks.Create", "Tasks", "Create", "إنشاء مهام", "Create Tasks"),
            CreatePermission("Permissions.Tasks.Edit", "Tasks", "Edit", "تعديل المهام", "Edit Tasks"),
            CreatePermission("Permissions.Tasks.Delete", "Tasks", "Delete", "حذف المهام", "Delete Tasks"),
            CreatePermission("Permissions.Tasks.Assign", "Tasks", "Assign", "تعيين المهام", "Assign Tasks"),
            CreatePermission("Permissions.Tasks.Complete", "Tasks", "Complete", "إتمام المهام", "Complete Tasks"),
        });

        // Workflows Module
        permissions.AddRange(new[]
        {
            CreatePermission("Permissions.Workflows.View", "Workflows", "View", "عرض سير العمل", "View Workflows"),
            CreatePermission("Permissions.Workflows.Create", "Workflows", "Create", "إنشاء سير عمل", "Create Workflows"),
            CreatePermission("Permissions.Workflows.Edit", "Workflows", "Edit", "تعديل سير العمل", "Edit Workflows"),
            CreatePermission("Permissions.Workflows.Delete", "Workflows", "Delete", "حذف سير العمل", "Delete Workflows"),
            CreatePermission("Permissions.Workflows.Execute", "Workflows", "Execute", "تنفيذ سير العمل", "Execute Workflows"),
            CreatePermission("Permissions.Workflows.ManageInstances", "Workflows", "ManageInstances", "إدارة حالات سير العمل", "Manage Workflow Instances"),
        });

        // Activities, AuditLogs, etc.
        permissions.AddRange(new[]
        {
            CreatePermission("Permissions.Activities.View", "Activities", "View", "عرض الأنشطة", "View Activities"),
            CreatePermission("Permissions.Activities.Create", "Activities", "Create", "إنشاء أنشطة", "Create Activities"),
            CreatePermission("Permissions.Activities.Delete", "Activities", "Delete", "حذف الأنشطة", "Delete Activities"),
            CreatePermission("Permissions.AuditLogs.View", "AuditLogs", "View", "عرض سجلات التدقيق", "View Audit Logs"),
            CreatePermission("Permissions.AuditLogs.Export", "AuditLogs", "Export", "تصدير سجلات التدقيق", "Export Audit Logs"),
        });

        // System Administration
        permissions.AddRange(new[]
        {
            CreatePermission("Permissions.Users.View", "Users", "View", "عرض المستخدمين", "View Users"),
            CreatePermission("Permissions.Users.Create", "Users", "Create", "إنشاء مستخدمين", "Create Users"),
            CreatePermission("Permissions.Users.Edit", "Users", "Edit", "تعديل المستخدمين", "Edit Users"),
            CreatePermission("Permissions.Users.Delete", "Users", "Delete", "حذف المستخدمين", "Delete Users"),
            CreatePermission("Permissions.Users.ManageRoles", "Users", "ManageRoles", "إدارة أدوار المستخدمين", "Manage User Roles"),
            CreatePermission("Permissions.Roles.View", "Roles", "View", "عرض الأدوار", "View Roles"),
            CreatePermission("Permissions.Roles.Create", "Roles", "Create", "إنشاء أدوار", "Create Roles"),
            CreatePermission("Permissions.Roles.Edit", "Roles", "Edit", "تعديل الأدوار", "Edit Roles"),
            CreatePermission("Permissions.Roles.Delete", "Roles", "Delete", "حذف الأدوار", "Delete Roles"),
            CreatePermission("Permissions.Roles.ManagePermissions", "Roles", "ManagePermissions", "إدارة صلاحيات الأدوار", "Manage Role Permissions"),
            CreatePermission("Permissions.System.ViewSettings", "System", "ViewSettings", "عرض إعدادات النظام", "View System Settings"),
            CreatePermission("Permissions.System.ManageSettings", "System", "ManageSettings", "إدارة إعدادات النظام", "Manage System Settings"),
            CreatePermission("Permissions.System.FullAccess", "System", "FullAccess", "الوصول الكامل للنظام", "Full System Access"),
        });

        int addedCount = 0;
        foreach (var permission in permissions)
        {
            if (!existingPermissionCodes.Contains(permission.Code))
            {
                await _unitOfWork.Permissions.AddAsync(permission);
                addedCount++;
            }
        }

        if (addedCount > 0)
        {
             Console.WriteLine($"Successfully seeded {addedCount} new permissions.");
        }
        else
        {
             Console.WriteLine("All permissions already seeded.");
        }
    }

    private Permission CreatePermission(string code, string module, string action, string nameAr, string nameEn)
    {
        return new Permission
        {
            Code = code,
            Module = module,
            Action = action,
            NameAr = nameAr,
            NameEn = nameEn,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }
}
