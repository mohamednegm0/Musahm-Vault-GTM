import apiClient from '../api/apiClient';
import { mapErrorToKey } from '../utils/errorUtils';
import { getWorkspaces } from '../api/workspaces';

// Invite member to workspace
export async function inviteWorkspaceMember({ workspaceId, email, role, message }: { workspaceId: string, email: string, role: string, message?: string }) {
  const payload = {
    workspaceId,
    email,
    role,
    message,
  };
  const response = await apiClient.post('/api/WorkspaceMembers', payload);
  return response.data;
}
// Fetch workspace members by workspace ID
export async function getWorkspaceMembers(workspaceId: string) {
  const response = await apiClient.get(`/api/WorkspaceMembers/${workspaceId}`);
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data?.returnData) {
    return response.data.returnData;
  }
  return [];
}


export enum WorkspaceType {
  Board = 'Board',
  Legal = 'Legal',
  Compliance = 'Compliance',
  HR = 'HR',
  Projects = 'Projects'
}

export interface WorkspaceSettings {
  privacy: string;
  allowInvites: boolean;
  storageLimitMb: number;
}

export interface Workspace {
  id?: string;
  tenantId?: string;
  name: string;
  slug?: string;
  description?: string;
  type: WorkspaceType;
  retentionPolicyId?: string;
  legalHold?: boolean;
  settings?: WorkspaceSettings;
  isActive?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export const workspaceService = {
  async getAll(): Promise<Workspace[]> {
    // Redirect to the centralized getWorkspaces which uses caching to prevent duplicate API requests
    return (await getWorkspaces()) as unknown as Workspace[];
  },

  async getById(id: string): Promise<Workspace> {
    const response = await apiClient.get<Workspace>(`/api/Workspaces/${id}`);
    return response.data;
  },

  async create(workspace: Workspace): Promise<Workspace> {
    const response = await apiClient.post<any>('/api/Workspaces', workspace);
    if (response.data && response.data.isSucceeded === false) {
      throw new Error(response.data.errorMessage || 'Failed to create workspace');
    }
    return response.data?.returnData ?? response.data;
  },

  async update(id: string, workspace: Workspace): Promise<void> {
    const response = await apiClient.put<any>(`/api/Workspaces/${id}`, workspace);
    if (response.data && response.data.isSucceeded === false) {
      throw new Error(response.data.errorMessage || 'Failed to update workspace');
    }
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/Workspaces/${id}`);
  },
};
