using Core.Entities;
using MongoDB.Driver;
namespace Core.Repository;
public interface IUnitOfWork : IDisposable
{
    #region Base Repositories
    IBaseRepository<Workspace> Workspaces { get; }
    IBaseRepository<Document> Documents { get; }
    IBaseRepository<Activity> Activities { get; }
    IBaseRepository<AgentActionLog> AgentActionLogs { get; }
    IBaseRepository<AuditLog> AuditLogs { get; }
    IBaseRepository<DocumentAcl> DocumentAcls { get; }
    IBaseRepository<DocumentExtraction> DocumentExtractions { get; }
    IBaseRepository<DocumentVersion> DocumentVersions { get; }
    IBaseRepository<Invitation> Invitations { get; }
    IBaseRepository<Obligation> Obligations { get; }
    IBaseRepository<TaskEntity> Tasks { get; }
    IBaseRepository<WorkflowInstance> WorkflowInstances { get; }
    IBaseRepository<WorkspaceMember> WorkspaceMembers { get; }
    IBaseRepository<Workflow> Workflows { get; }
    IBaseRepository<ActionDefinition> Actions { get; }
    IBaseRepository<CompanyMap> CompanyMaps { get; }
    IBaseRepository<CompanyUserMap> CompanyUserMaps { get; }
    IBaseRepository<UserMap> UserMaps { get; }
    IBaseRepository<DocumentType> DocumentTypes { get; }
    IBaseRepository<WorkflowTriggerDefinition> Triggers { get; }
    IBaseRepository<WorkflowEventDefinition> WorkflowEvents { get; }
    IBaseRepository<WorkflowAssignment> WorkflowAssignments { get; }
    
    // Permission System Repositories
    IBaseRepository<Role> Roles { get; }
    IBaseRepository<Entities.Permission> Permissions { get; }
    IBaseRepository<RolePermission> RolePermissions { get; }
    IBaseRepository<UserRole> UserRoles { get; }
    
    IMongoDatabase Database { get; }
    #endregion

    int Complete();
    int Rollback();
    int Migrate();
}