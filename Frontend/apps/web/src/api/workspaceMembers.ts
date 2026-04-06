import apiClient from './apiClient';

export interface WorkspaceMember {
  id?: string;
  userId: string;
  workspaceId: string;
  role: string;
  joinedAt?: Date;
  status?: string;
  // Additional fields from details if needed
  nameAr?: string;
  nameEn?: string;
  type?: string;
}

export interface WorkspaceMemberDetails {
  id: string; // Member ID
  name?: string;
  nameAr: string;
  nameEn: string;
  type: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  role: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface InviteRequest {
  workspaceId: string;
  grcUserId: number; // Changed from email to grcUserId as per request
  grcUserType: string;
  role: string;
}

export const getWorkspaceMembers = async (): Promise<WorkspaceMember[]> => {
  const response = await apiClient.get<WorkspaceMember[]>('/api/workspacemembers');
  return response.data;
};

// 4. List of user that have invite: GET /api/WorkspaceMembers/details/{workspaceId}
export const getWorkspaceMemberDetails = async (workspaceId: string): Promise<WorkspaceMemberDetails[]> => {
  const response = await apiClient.get<any>(`/api/WorkspaceMembers/details/${workspaceId}`);
  // Handle wrapped response (common in this project)
  if (response.data && Array.isArray(response.data.returnData)) {
    return response.data.returnData;
  }
  // Handle direct array response
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // Fallback to empty array to avoid crashes
  console.warn("getWorkspaceMemberDetails: Unexpected response format", response.data);
  return [];
};

export const getWorkspaceMemberById = async (id: string): Promise<WorkspaceMember> => {
  const response = await apiClient.get<WorkspaceMember>(`/api/workspacemembers/${id}`);
  return response.data;
};

// 1. Invite user: POST /api/WorkspaceMembers
export const inviteMember = async (request: InviteRequest): Promise<any> => {
  const response = await apiClient.post('/api/WorkspaceMembers', request);
  return response.data;
};

// 2. Update type of user: PUT /api/WorkspaceMembers/{id}
export const updateMemberRole = async (id: string, role: string): Promise<any> => {
  const response = await apiClient.put(`/api/WorkspaceMembers/${id}`, { role });
  return response.data;
};

// 3. Delete member: DELETE /api/WorkspaceMembers/{id}
export const deleteMember = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/WorkspaceMembers/${id}`);
};
