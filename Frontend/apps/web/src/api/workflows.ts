import apiClient from './apiClient';

// Enum Definitions matching Backend
export enum WorkflowStepType {
  Start = 0,
  Action = 1,
  Logic = 2,
  End = 3
}

export enum WorkflowActionType {
  None = 0,
  Approve = 1,
  Fill = 2,
  Edit = 3,
  Review = 4
  // Note: Backend may now use ActionCode for specific dynamic actions
}

export enum WorkflowTriggerType {
  Manual = 0,
  FolderEvent = 1,
  FileFormat = 2,
  Person = 3,
  Workspace = 4,
  Document = 5,
  DocumentType = 6
}

// Interfaces
export interface ActionDefinition {
  id: string;
  code: string;
  name: string;
  description?: string;
  displayNameAr?: string;
  displayNameEn?: string;
  isSystem: boolean;
}

export interface WorkflowTriggerDefinition {
  id: string;
  code: string;
  name: string;
  description?: string;
  displayNameAr?: string;
  displayNameEn?: string;
}

export interface WorkflowActionConfig {
  actionType: WorkflowActionType;
  actionCode?: string;
  assigneeId?: string;
  assigneeRole?: string;     // Role display name (e.g. "Admin")
  assigneeRoleId?: string;   // Role ObjectId — used by backend for assignment
  instructions?: string;
  requiredFields?: string[];
}

export interface FormFieldConfig {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

export interface WorkflowTransitionForms {
  during: FormFieldConfig[];
  after: FormFieldConfig[];
}

export interface WorkflowEdgeConfig {
  label: string;
  triggers?: WorkflowTrigger[];
  forms?: WorkflowTransitionForms;
  eventCode?: string;
}

export interface WorkflowStep {
  stepId: string;
  title: string;
  type: WorkflowStepType;
  dependsOn: string[];
  edgeConfigs?: Record<string, WorkflowEdgeConfig>;
  actionConfig?: WorkflowActionConfig;
  uiMetadata?: any; // Position x,y for builder
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  triggerCode?: string;
  value: string;
  groupId?: string;
}

export interface Workflow {
  id?: string;
  name: string;
  description?: string;
  workspaceId?: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  minConfidenceScore: number;
  isActive: boolean;
  status?: string; // 'Draft', 'Active', 'Archived'
  createdAt?: string;
  updatedAt?: string;
  activeInstancesCount?: number;
  completedInstancesCount?: number;
  assignedFoldersCount?: number;
  assignedDocumentsCount?: number;
  reviewers?: string[];
  approvers?: string[];
  assignees?: string[];
}

export const getWorkflows = async (): Promise<Workflow[]> => {
  const response = await apiClient.get<any>('/api/workflows');
  return response.data.returnData || [];
};

export const getWorkflowById = async (id: string): Promise<Workflow> => {
  const response = await apiClient.get<any>(`/api/workflows/${id}`);
  return response.data.returnData;
};

export const createWorkflow = async (workflow: Workflow): Promise<Workflow> => {
  const response = await apiClient.post<any>('/api/workflows', workflow);
  return response.data.returnData;
};

export const updateWorkflow = async (id: string, workflow: Workflow): Promise<Workflow> => {
  const response = await apiClient.put<any>(`/api/workflows/${id}`, workflow);
  return response.data.returnData;
};

export const deleteWorkflow = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/workflows/${id}`);
};

export const toggleWorkflowActiveStatus = async (id: string, isActive: boolean, activateAssignments: boolean = false): Promise<any> => {
  const response = await apiClient.put<any>(`/api/workflows/${id}/toggle-active?isActive=${isActive}&activateAssignments=${activateAssignments}`);
  return response.data;
};

export const getWorkflowActions = async (): Promise<ActionDefinition[]> => {
    const response = await apiClient.get<any>('/api/workflows/actions');
    return response.data.returnData || [];
};

export const getTriggerDefinitions = async (): Promise<WorkflowTriggerDefinition[]> => {
    const response = await apiClient.get<any>('/api/workflows/triggers');
    return response.data.returnData || [];
};

export interface WorkflowEventDefinition {
    id: string;
    code: string;
    name: string;
    description?: string;
    displayNameAr?: string;
    displayNameEn?: string;
}

export const getEvents = async (): Promise<WorkflowEventDefinition[]> => {
    const response = await apiClient.get<any>('/api/workflows/events');
    return response.data.returnData || [];
};
