namespace Core.Enums;

public enum WorkflowStatus
{
    Draft,
    Active,
    Suspended,
    Completed,
    Terminated
}

public enum WorkflowStepType
{
    Start,
    Action,
    Logic, // e.g., Automated check or specialized system task
    End
}

public enum WorkflowActionType
{
    None,
    Approve, // Approve/Reject decision
    Fill,    // Input metadata
    Edit,    // Upload new version
    Review   // Verify and complete
}

public static class StepStatus
{
    public const int Pending = 0;
    public const int Ready = 1;      // Dependencies met, waiting for execution/assignment
    public const int InProgress = 2; // User is working on it
    public const int Completed = 3;
    public const int Rejected = 4;   // For approval steps
    public const int Skipped = 5;
}

public enum WorkflowTriggerType
{
    Manual,
    FolderEvent, // File added/moved to folder
    FileFormat,  // Based on extension/mime
    Person,      // Uploaded by specific user/role
    Workspace,   // specific workspace
    Document,     // specific document event
    DocumentType,  // Logical classification (Contract, Invoice, etc.)
    Event          // Generic event trigger
}
