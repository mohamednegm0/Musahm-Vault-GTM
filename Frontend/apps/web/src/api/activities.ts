import apiClient from './apiClient';

export interface Activity {
  id?: string;
  action: string;
  details: string;
  userId?: string;
  userName?: string;
  workspaceId?: string;
  workspaceName?: string;
  tenantId?: string;
  createdAt?: string;

  // Legacy support for older frontend code if needed
  title?: string;
  description?: string;
  status?: string;
}

export const getActivities = async (): Promise<Activity[]> => {
  const response = await apiClient.get<any>('/api/activities');
  return response.data.returnData || [];
};

export const getActivityById = async (id: string): Promise<Activity> => {
  const response = await apiClient.get<any>(`/api/activities/${id}`);
  return response.data.returnData;
};

export const createActivity = async (activity: Activity): Promise<Activity> => {
  const response = await apiClient.post<any>('/api/activities', activity);
  return response.data.returnData;
};

export const updateActivity = async (id: string, activity: Activity): Promise<Activity> => {
  const response = await apiClient.put<any>(`/api/activities/${id}`, activity);
  return response.data.returnData;
};

export const deleteActivity = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/activities/${id}`);
};
