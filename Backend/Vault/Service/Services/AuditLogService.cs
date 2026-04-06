using Core.DTOs;
using Core.DTOs.AuditLog;
using static Core.Constants.ConstAppConfiguration;

namespace Service;
public class AuditLogService : IAuditLogService
{
    private readonly IUnitOfWork _unitOfWork;
    public AuditLogService(IUnitOfWork unitOfWork) { _unitOfWork = unitOfWork; }

    public async Task<ResponseResult<IEnumerable<AuditLogDetailsDto>>> GetAllAsync(string? tenantId = null) 
    {
        var allLogs = await _unitOfWork.AuditLogs.GetAllAsync();
        var logs = string.IsNullOrEmpty(tenantId)
            ? allLogs
            : allLogs.Where(l => l.TenantId == tenantId);
        var sortedLogs = logs.OrderByDescending(l => l.CreatedAt);
        var enrichedLogs = await EnrichLogs(sortedLogs);
        return new ResponseResult<IEnumerable<AuditLogDetailsDto>>(enrichedLogs, ApiStatusCode.OK); 
    }

    public async Task<ResponseResult<AuditLogDetailsDto>> GetByIdAsync(string id) 
    {
        var log = await _unitOfWork.AuditLogs.GetByIdAsync(id);
        if (log == null) return new ResponseResult<AuditLogDetailsDto>("Audit log not found", ApiStatusCode.NotFound);
        
        var enriched = await EnrichLogs(new[] { log });
        return new ResponseResult<AuditLogDetailsDto>(enriched.First(), ApiStatusCode.OK);
    }

    private async Task<IEnumerable<AuditLogDetailsDto>> EnrichLogs(IEnumerable<AuditLog> logs)
    {
        var logList = logs.ToList();

        // ── Users ──────────────────────────────────────────────────────────────
        var userIds = logList
            .Where(l => !string.IsNullOrEmpty(l.ActorUserId))
            .Select(l => l.ActorUserId!)
            .Distinct().ToList();
        var userDict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "000000000000000000000000", "System" },
            { "SYSTEM", "System" },
            { "EXTERNAL", "External User" }
        };
        // Only query MongoDB for valid ObjectIds (24 hex chars) to avoid FormatException
        var validUserIds = userIds.Where(IsValidObjectId).ToList();
        var users = validUserIds.Any()
            ? await _unitOfWork.UserMaps.FindAsync(u => u.Id != null && validUserIds.Contains(u.Id))
            : new List<UserMap>();
        foreach (var u in users)
        {
            if (u.Id != null && !userDict.ContainsKey(u.Id))
            {
                userDict[u.Id] = u.GrcNameAr ?? u.GrcNameEn ?? "Unknown User";
            }
        }

        // ── Entity names per type ──────────────────────────────────────────────
        var typeGroups = logList
            .Where(l => !string.IsNullOrEmpty(l.EntityType) && !string.IsNullOrEmpty(l.EntityId))
            .GroupBy(l => l.EntityType.ToLower().Replace("_", ""))
            .ToDictionary(g => g.Key, g => g.Select(l => l.EntityId!).Distinct().ToList());

        var entityNames = new Dictionary<string, string>(); // entityId -> name

        foreach (var (type, ids) in typeGroups)
        {
            switch (type)
            {
                case "workspace":
                    var ws = await _unitOfWork.Workspaces.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in ws) entityNames[e.Id!] = e.Name ?? e.Id!;
                    break;
                case "document":
                    var docs = await _unitOfWork.Documents.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in docs) entityNames[e.Id!] = e.Title ?? e.Id!;
                    break;
                case "workflow":
                    var wfs = await _unitOfWork.Workflows.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in wfs) entityNames[e.Id!] = e.Name ?? e.Id!;
                    break;
                case "workflowinstance":
                    var wfis = await _unitOfWork.WorkflowInstances.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in wfis) entityNames[e.Id!] = e.WorkflowName ?? e.Id!;
                    break;
                case "task":
                    var tasks = await _unitOfWork.Tasks.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in tasks) entityNames[e.Id!] = e.Title ?? e.Id!;
                    break;
                case "obligation":
                    var obs = await _unitOfWork.Obligations.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in obs) entityNames[e.Id!] = e.Title ?? e.Id!;
                    break;
                case "trigger":
                    var trigs = await _unitOfWork.Triggers.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in trigs) entityNames[e.Id!] = e.Name ?? e.Id!;
                    break;
                case "invitation":
                    var invs = await _unitOfWork.Invitations.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in invs) entityNames[e.Id!] = e.Email ?? e.Id!;
                    break;
                case "role":
                    var roles = await _unitOfWork.Roles.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in roles) entityNames[e.Id!] = e.NameAr ?? e.NameEn ?? e.Id!;
                    break;
                case "permission":
                    var perms = await _unitOfWork.Permissions.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in perms) entityNames[e.Id!] = e.NameAr ?? e.NameEn ?? e.Id!;
                    break;
                case "documenttype":
                    var dts = await _unitOfWork.DocumentTypes.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    foreach (var e in dts) entityNames[e.Id!] = e.NameAr ?? e.NameEn ?? e.Id!;
                    break;
                case "workflowassignment":
                    var assignments = await _unitOfWork.WorkflowAssignments.FindAsync(e => e.Id != null && ids.Contains(e.Id));
                    var workflowIds = assignments.Select(a => a.WorkflowId).Where(w => !string.IsNullOrEmpty(w)).Distinct().ToList();
                    var assignmentsWorkflows = await _unitOfWork.Workflows.FindAsync(w => w.Id != null && workflowIds.Contains(w.Id));
                    var workflowDict = assignmentsWorkflows.Where(w => w.Id != null).ToDictionary(w => w.Id!, w => w.Name ?? "Unknown");
                    foreach (var a in assignments)
                    {
                        var wName = workflowDict.TryGetValue(a.WorkflowId, out var name) ? name : "Workflow";
                        entityNames[a.Id!] = $"{wName}";
                    }
                    break;
            }
        }

        return logList.Select(l => new AuditLogDetailsDto
        {
            Id = l.Id,
            ActorUserId = l.ActorUserId,
            ActorUserName = l.ActorUserId != null && userDict.TryGetValue(l.ActorUserId, out var uName)
                ? uName : "Unknown User",
            Action = HumanizeAction(l.Action),
            EntityType = l.EntityType,
            EntityId = l.EntityId,
            EntityName = l.EntityId != null && entityNames.TryGetValue(l.EntityId, out var eName)
                ? eName : null,
            Details = l.Details,
            CreatedAt = l.CreatedAt
        });
    }

    private string HumanizeAction(string action)
    {
        if (string.IsNullOrEmpty(action)) return action;

        // Common mappings to normalize legacy data and special cases
        var mappings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "CreateWorkflow", "Create Workflow" },
            { "UpdateWorkflow", "Update Workflow" },
            { "DeleteWorkflow", "Delete Workflow" },
            { "ActivateWorkflow", "Activate Workflow" },
            { "DeactivateWorkflow", "Deactivate Workflow" },
            { "CreateTask", "Create Task" },
            { "UpdateTask", "Update Task" },
            { "DeleteTask", "Delete Task" },
            { "CreateWorkspace", "Create Workspace" },
            { "UpdateWorkspace", "Update Workspace" },
            { "DeleteWorkspace", "Delete Workspace" },
            { "UploadDocument", "Upload Document" },
            { "UpdateDocument", "Update Document" },
            { "DeleteDocument", "Delete Document" },
            { "CREATE_WORKSPACE", "Create Workspace" },
            { "SIGN_DOCUMENT", "Sign Document" },
            { "APPROVE_MOM", "Approve MOM" }
        };

        if (mappings.TryGetValue(action, out var humanized)) return humanized;

        // If it looks like PascalCase without spaces/underscores, split it
        if (!action.Contains(' ') && !action.Contains('_'))
        {
            return System.Text.RegularExpressions.Regex.Replace(action, "([a-z])([A-Z])", "$1 $2");
        }
        
        // Handle underscores (e.g., "SOME_ACTION" -> "Some Action")
        if (action.Contains('_') && !action.Contains(' '))
        {
            var parts = action.Split('_', StringSplitOptions.RemoveEmptyEntries);
            return string.Join(" ", parts.Select(p => 
                char.ToUpper(p[0]) + p.Substring(1).ToLower()));
        }

        return action;
    }
    
    public async Task LogAsync(string actorUserId, string tenantId, string action, string entityType, string? entityId, string? details = null)
    {
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            ActorUserId = actorUserId,
            TenantId = tenantId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            CreatedAt = DateTime.UtcNow
        });
    }

    public async Task<ResponseResult<AuditLog>> CreateAsync(AuditLog entity) 
    {
        await _unitOfWork.AuditLogs.AddAsync(entity);
        return new ResponseResult<AuditLog>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<AuditLog>> UpdateAsync(string id, AuditLog entity) 
    {
        await _unitOfWork.AuditLogs.UpdateAsync(id, entity);
        return new ResponseResult<AuditLog>(entity, ApiStatusCode.OK);
    }
    
    public async Task<ResponseResult<object>> DeleteAsync(string id) 
    {
        var log = await _unitOfWork.AuditLogs.GetByIdAsync(id);
        if (log == null) return new ResponseResult<object>("Audit log not found", ApiStatusCode.NotFound);
        await _unitOfWork.AuditLogs.DeleteAsync(id);
        return new ResponseResult<object>(null, ApiStatusCode.OK, "Deleted Successfully");
    }

    private static bool IsValidObjectId(string? id)
    {
        if (string.IsNullOrEmpty(id)) return false;
        return id.Length == 24 && id.All(c => (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F'));
    }
}