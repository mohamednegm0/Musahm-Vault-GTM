import apiClient from './apiClient';
import { invalidateWorkspacesCache } from './workspaces';
import { invalidateDocumentsCache } from './documents';

export interface RecycleBinItem {
  id: string;
  name: string;
  itemType: string;
  deletedBy?: string;
  deletedByName?: string;
  deletedAt?: string;
  parentId?: string;
}

export const getDeletedItems = async (): Promise<RecycleBinItem[]> => {
  const response = await apiClient.get<any>('/api/recycle-bin');
  return response.data.returnData || [];
};

export const restoreItem = async (itemType: string, id: string): Promise<any> => {
  const response = await apiClient.post<any>(`/api/recycle-bin/restore/${itemType}/${id}`);
  invalidateWorkspacesCache();
  invalidateDocumentsCache();
  return response.data;
};

export const hardDeleteItem = async (itemType: string, id: string): Promise<any> => {
  const response = await apiClient.delete<any>(`/api/recycle-bin/hard-delete/${itemType}/${id}`);
  return response.data;
};

export const emptyRecycleBin = async (): Promise<any> => {
  const response = await apiClient.delete<any>('/api/recycle-bin/empty');
  return response.data;
};
