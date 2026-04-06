import apiClient from './apiClient';

export interface DocumentAcl {
  id?: string;
  tenantId?: string; // specific fields from response example
  documentId: string;
  userId?: string;
  groupId?: string;
  permission: string; // 'viewer' | 'editor' | 'admin' per prompt example (ignoring strict enum for now to avoid issues if backend differs slightly, but prompt said viewer, editor, admin)
  createdBy?: string;
  createdByName?: string;
  name?: string;
  createdAt?: string;
  grantedAt?: Date;
  grantedBy?: string;
}

export interface CreateDocumentAclRequest {
  documentId: string;
  userId?: string;
  grcUserId?: number;
  grcUserType?: string;
  permission?: string;
}

export const getDocumentAcls = async (documentId?: string): Promise<DocumentAcl[]> => {
  const url = documentId ? `/api/DocumentAcls?document_id=${documentId}` : '/api/documentacls';
  const response = await apiClient.get<any>(url);
  // Handle wrapped response
  if (response.data && Array.isArray(response.data.returnData)) {
    return response.data.returnData;
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
};

export const getDocumentAclById = async (id: string): Promise<DocumentAcl> => {
  const response = await apiClient.get<DocumentAcl>(`/api/documentacls/${id}`);
  return response.data;
};

export const createDocumentAcl = async (acl: CreateDocumentAclRequest): Promise<DocumentAcl> => {
  // Using the specific body schema
  const response = await apiClient.post<DocumentAcl>('/api/DocumentAcls', acl);
  return response.data;
};

export const updateDocumentAcl = async (request: CreateDocumentAclRequest): Promise<DocumentAcl> => {
  const response = await apiClient.put<DocumentAcl>('/api/DocumentAcls', request);
  return response.data;
};

export const deleteDocumentAcl = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/DocumentAcls/${id}`);
};
