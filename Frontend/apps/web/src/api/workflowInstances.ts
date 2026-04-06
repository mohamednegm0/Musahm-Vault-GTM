import apiClient from './apiClient';

export interface WorkflowInstance {
  id?: string;
  workflowId: string;
  workflowName?: string;
  documentId?: string;
  documentTitle?: string;
  status: 'Draft' | 'InProgress' | 'Completed' | 'Failed' | number | string;
  currentStep?: number;
  progress?: number;
  steps?: Array<{
    stepId: string;
    title: string;
    status: string | number;
    completedAt?: Date;
    startedAt?: Date;
    completedByName?: string;
    actionConfig?: {
      assigneeName?: string;
      assigneeId?: string;
      assigneeRole?: string;
    };
  }>;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdBy?: string;
  context?: any;
}

export const getWorkflowInstances = async (): Promise<WorkflowInstance[]> => {
  const response = await apiClient.get<any>('/api/workflowinstances');
  return response.data.returnData || [];
};

export const getInstancesByWorkflow = async (workflowId: string): Promise<WorkflowInstance[]> => {
  const response = await apiClient.get<any>(`/api/workflowinstances/workflow/${workflowId}`);
  return response.data.returnData || [];
};

export const getInstancesByTarget = async (targetId: string): Promise<WorkflowInstance[]> => {
  const response = await apiClient.get<any>(`/api/workflowinstances/target/${targetId}`);
  return response.data.returnData || [];
};

export const getWorkflowInstanceById = async (id: string): Promise<WorkflowInstance> => {
  const response = await apiClient.get<any>(`/api/workflowinstances/${id}`);
  return response.data.returnData;
};

export const createWorkflowInstance = async (instance: WorkflowInstance): Promise<WorkflowInstance> => {
  const response = await apiClient.post<any>('/api/workflowinstances', instance);
  return response.data.returnData;
};

export const updateWorkflowInstance = async (id: string, instance: WorkflowInstance): Promise<WorkflowInstance> => {
  const response = await apiClient.put<any>(`/api/workflowinstances/${id}`, instance);
  return response.data.returnData;
};

export const deleteWorkflowInstance = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/workflowinstances/${id}`);
};
