import apiClient from './apiClient';

export interface Workspace {
  id?: string;
  name: string;
  description?: string;
  tenantId?: string;
  slug?: string;
  type?: string;
  parentId?: string;
  legalHold?: boolean;
  settings?: {
    privacy?: string;
    allowInvites?: boolean;
    storageLimitMb?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
  isQuickAccess?: boolean;
  childCount?: number;
  documentCount?: number;
}

let workspacesPromise: Promise<Workspace[]> | null = null;
export const invalidateWorkspacesCache = () => { workspacesPromise = null; };

export const getWorkspaces = async (): Promise<Workspace[]> => {
  // Don't make API call if user is not authenticated
  const token = localStorage.getItem('authToken');
  if (!token) {
    return [];
  }

  if (workspacesPromise) {
    return workspacesPromise;
  }

  workspacesPromise = (async () => {
    try {
      const response = await apiClient.get<any>('/api/Workspaces');
      if (response.data && response.data.returnData) {
        return response.data.returnData;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } finally {
      // Clear the promise shortly after it finishes to ensure fresh fetches on later navigations, 
      // while coalescing simultaneous requests on initial load.
      setTimeout(() => {
        workspacesPromise = null;
      }, 2000);
    }
  })();

  return workspacesPromise;
};

export const getWorkspaceById = async (id: string): Promise<Workspace> => {
  const response = await apiClient.get<{ returnData: Workspace }>(`/api/Workspaces/${id}`);
  return response.data.returnData;
};

export const createWorkspace = async (workspace: Workspace): Promise<Workspace> => {
  const response = await apiClient.post<Workspace>('/api/Workspaces', workspace);
  workspacesPromise = null;
  return response.data;
};

export const updateWorkspace = async (id: string, workspace: Workspace): Promise<{
  isSucceeded: boolean;
  apiStatusCode: number;
  errorMessage?: string;
  successMessage?: string;
}> => {
  const response = await apiClient.put<any>(`/api/Workspaces/${id}`, workspace);
  workspacesPromise = null;
  return response.data;
};

export const deleteWorkspace = async (id: string): Promise<{
  isSucceeded: boolean;
  apiStatusCode: number;
  errorMessage?: string;
  successMessage?: string;
}> => {
  const response = await apiClient.delete<any>(`/api/Workspaces/${id}`);
  workspacesPromise = null;
  return response.data;
};

export const deactivateWorkspace = async (id: string): Promise<void> => {
    await apiClient.put(`/api/Workspaces/${id}/deactivate`);
};

export interface WorkspaceMember {
  id: string; // Member ID (not User ID)
  workspaceId: string;
  userId: string;
  role: string;
  nameAr?: string;
  nameEn?: string;
  type?: string;
  email?: string; // Might not be present in DTO if not joined?
  createdAt: Date;
}

export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
  const response = await apiClient.get<WorkspaceMember[]>(`/api/WorkspaceMembers/${workspaceId}`);
  return response.data;
};

export interface WorkspaceChild {
  id: string;
  name: string;
  type?: string;
  parentId?: string;
  size?: number;
  createdAt?: string;
  modifiedAt?: Date;
  stats?: {
    totalMembers: number;
    lastActivity: string;
  };
  isDir?: boolean;
  childCount?: number;
  documentCount?: number;
}

interface ApiResponse<T> {
  isSucceeded: boolean;
  apiStatusCode: number;
  returnData: T;
  successMessage?: string | null;
  errorMessage?: string;
}

export const getWorkspaceChildren = async (workspaceId: string): Promise<WorkspaceChild[]> => {
  const response = await apiClient.get<ApiResponse<WorkspaceChild[]>>(`/api/Workspaces/${workspaceId}/children`);
  return response.data.returnData || [];
};
