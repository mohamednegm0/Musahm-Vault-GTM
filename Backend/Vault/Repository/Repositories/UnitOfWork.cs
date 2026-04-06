using Core.Entities;
using Core.Repository;
using MongoDB.Driver;

namespace Repository.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        #region Properties
        private readonly IMongoDatabase _database;
        #endregion

        public UnitOfWork(IMongoDatabase database)
        {
            _database = database;

            #region Base Repositories
            Documents = new BaseRepository<Document>(_database, "documents");
            Workspaces = new BaseRepository<Workspace>(_database, "workspaces");
            Activities = new BaseRepository<Activity>(_database, "activities");
            AgentActionLogs = new BaseRepository<AgentActionLog>(_database, "agent_action_logs");
            AuditLogs = new BaseRepository<AuditLog>(_database, "audit_logs");
            DocumentAcls = new BaseRepository<DocumentAcl>(_database, "document_acl");
            DocumentExtractions = new BaseRepository<DocumentExtraction>(_database, "document_extractions");
            DocumentVersions = new BaseRepository<DocumentVersion>(_database, "document_versions");
            Invitations = new BaseRepository<Invitation>(_database, "invitations");
            Obligations = new BaseRepository<Obligation>(_database, "obligations");
            Tasks = new BaseRepository<TaskEntity>(_database, "tasks");
            WorkflowInstances = new BaseRepository<WorkflowInstance>(_database, "workflow_instances");
            WorkspaceMembers = new BaseRepository<WorkspaceMember>(_database, "workspace_members");
            Workflows = new BaseRepository<Workflow>(_database, "workflows");
            Actions = new BaseRepository<ActionDefinition>(_database, "actions");
            CompanyMaps = new BaseRepository<CompanyMap>(_database, "company_maps");
            CompanyUserMaps = new BaseRepository<CompanyUserMap>(_database, "company_user_maps");
            UserMaps = new BaseRepository<UserMap>(_database, "user_maps");
            DocumentTypes = new BaseRepository<DocumentType>(_database, "document_types");
            Triggers = new BaseRepository<WorkflowTriggerDefinition>(_database, "triggers");
            WorkflowEvents = new BaseRepository<WorkflowEventDefinition>(_database, "workflow_events");
            WorkflowAssignments = new BaseRepository<WorkflowAssignment>(_database, "workflow_assignments");            
            // Permission System Repositories
            Roles = new BaseRepository<Role>(_database, "roles");
            Permissions = new BaseRepository<Core.Entities.Permission>(_database, "permissions");
            RolePermissions = new BaseRepository<RolePermission>(_database, "role_permissions");
            UserRoles = new BaseRepository<UserRole>(_database, "user_roles");
            #endregion  
        }

        #region Base Repositories
        public IBaseRepository<Document> Documents { get; private set; } 
        public IBaseRepository<Workspace> Workspaces { get; private set; }
        public IBaseRepository<Activity> Activities { get; private set; }
        public IBaseRepository<AgentActionLog> AgentActionLogs { get; private set; }
        public IBaseRepository<AuditLog> AuditLogs { get; private set; }
        public IBaseRepository<DocumentAcl> DocumentAcls { get; private set; }
        public IBaseRepository<DocumentExtraction> DocumentExtractions { get; private set; }
        public IBaseRepository<DocumentVersion> DocumentVersions { get; private set; }
        public IBaseRepository<Invitation> Invitations { get; private set; }
        public IBaseRepository<Obligation> Obligations { get; private set; }
        public IBaseRepository<TaskEntity> Tasks { get; private set; }
        public IBaseRepository<WorkflowInstance> WorkflowInstances { get; private set; }
        public IBaseRepository<WorkspaceMember> WorkspaceMembers { get; private set; }
        public IBaseRepository<Workflow> Workflows { get; private set; }
        public IBaseRepository<ActionDefinition> Actions { get; private set; }
        public IBaseRepository<CompanyMap> CompanyMaps { get; private set; }
        public IBaseRepository<CompanyUserMap> CompanyUserMaps { get; private set; }
        public IBaseRepository<UserMap> UserMaps { get; private set; }
        public IBaseRepository<DocumentType> DocumentTypes { get; private set; }
        public IBaseRepository<WorkflowTriggerDefinition> Triggers { get; private set; }
        public IBaseRepository<WorkflowEventDefinition> WorkflowEvents { get; private set; }
        public IBaseRepository<WorkflowAssignment> WorkflowAssignments { get; private set; }
        
        // Permission System Repositories
        public IBaseRepository<Role> Roles { get; private set; }
        public IBaseRepository<Core.Entities.Permission> Permissions { get; private set; }
        public IBaseRepository<RolePermission> RolePermissions { get; private set; }
        public IBaseRepository<UserRole> UserRoles { get; private set; }
        
        public IMongoDatabase Database => _database;
        #endregion


        #region Methods
        public int Complete()
        {
            // MongoDB driver handles writes immediately in this implementation.
            // If transactions are needed, we would use IClientSessionHandle here.
            return 1;
        }
        public int Rollback()
        {
            return 0;
        }
        public void Dispose()
        {
            // No specific disposal needed for MongoDbContext as implemented
        }
        
        public int Migrate()
        {
            return 0;
        }
        #endregion
    }
}
