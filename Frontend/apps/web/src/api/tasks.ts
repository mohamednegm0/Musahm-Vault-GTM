import apiClient from './apiClient';

export interface TaskEntity {
  id?: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: Date;
  assignedTo?: string;
  assignedToName?: string;
  createdBy?: string;
  createdByName?: string;
  workspaceId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  workflowId?: string;
  workflowStepId?: string;
  relatedEntity?: {
    id: string;
    type: string;
    name?: string;
  };
  triggerType?: string;
  workflowName?: string;
  relatedItemName?: string;
  relatedItemType?: string;
  targetDocumentId?: string;
  actionConfig?: {
    actionType: number;
    requiredFields?: string[];
    instructions?: string;
    assigneeRole?: string;
  };
}

export const getTasks = async (): Promise<TaskEntity[]> => {
  const response = await apiClient.get<any>('/api/tasks');
  return response.data.returnData || [];
};

export const getTaskById = async (id: string): Promise<TaskEntity> => {
  const response = await apiClient.get<any>(`/api/tasks/${id}`);
  return response.data.returnData;
};

export const createTask = async (task: TaskEntity): Promise<TaskEntity> => {
  const response = await apiClient.post<any>('/api/tasks', task);
  return response.data.returnData;
};

export const updateTask = async (id: string, task: TaskEntity): Promise<TaskEntity> => {
  const response = await apiClient.put<any>(`/api/tasks/${id}`, task);
  return response.data.returnData;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/tasks/${id}`);
};

export const getMyTasks = async (): Promise<TaskEntity[]> => {
  const response = await apiClient.get<any>('/api/tasks/my-tasks');
  return response.data.returnData || [];
};

export const completeTask = async (id: string, outcome: string = 'Completed', data?: any): Promise<void> => {
  await apiClient.put(`/api/tasks/${id}/complete`, { outcome, data });
};
