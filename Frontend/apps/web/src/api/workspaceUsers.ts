import apiClient from './apiClient';


export interface WorkspaceUser {
  id: number;
  nameAr: string;
  nameEn: string;
  type: string;
}

export const getWorkspaceUsers = async (): Promise<WorkspaceUser[]> => {
  const response = await apiClient.get('/api/Profiles/users');
  // If response.data.returnData exists, use it
  if (response.data && Array.isArray(response.data.returnData)) {
    return response.data.returnData;
  }
  return [];
};
