import apiClient from '../api/apiClient';

export async function setWorkspaceQuickAccess(id: string, isQuickAccess: boolean): Promise<void> {
  await apiClient.put(`/api/Workspaces/${id}/quick-access`, { isQuickAccess });
}

export async function setDocumentQuickAccess(id: string, isQuickAccess: boolean): Promise<void> {
  await apiClient.put(`/api/Documents/${id}/quick-access`, { isQuickAccess });
}
