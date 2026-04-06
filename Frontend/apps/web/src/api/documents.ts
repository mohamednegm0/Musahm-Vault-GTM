import apiClient from './apiClient';

export interface ApiResponse<T> {
  isSucceeded: boolean;
  apiStatusCode: number;
  successMessage: string | null;
  errorMessage: string;
  returnData: T;
  extraReturnData?: any;
  extra2ReturnData?: any;
}

export interface Document {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  parent_id?: string;
  title: string;
  storage_path?: string;
  original_file_name?: string;
  file_size?: number;
  description?: string;
  document_type?: string;
  status?: string;
  current_version?: number;
  owner_user_id?: string;
  tags?: string[];
  created_by?: string;
  createdByName?: string;
  created_at?: string;
  expiry_date?: string;
  updated_at?: string;
  legal_hold?: boolean;
  isQuickAccess?: boolean;
}

let documentsPromise: Promise<Document[]> | null = null;
export const invalidateDocumentsCache = () => { documentsPromise = null; };

export const getDocuments = async (): Promise<Document[]> => {
  if (documentsPromise) {
    return documentsPromise;
  }

  documentsPromise = (async () => {
    try {
      const response = await apiClient.get<ApiResponse<Document[]>>('/api/documents');
      return response.data.returnData;
    } finally {
      setTimeout(() => {
        documentsPromise = null;
      }, 2000);
    }
  })();

  return documentsPromise;
};

export const getDocumentsByWorkspaceId = async (workspaceId: string): Promise<Document[]> => {
  const response = await apiClient.get<ApiResponse<Document[]>>(`/api/Documents/workspace/${workspaceId}`);
  return response.data.returnData;
};

export const getDocumentById = async (id: string): Promise<Document> => {
  const response = await apiClient.get<ApiResponse<Document>>(`/api/documents/${id}`);
  return response.data.returnData;
};

export const createDocument = async (document: Partial<Document>): Promise<Document> => {
  const response = await apiClient.post<ApiResponse<Document>>('/api/documents', document);
  documentsPromise = null;
  return response.data.returnData;
};

export const updateDocument = async (id: string, document: Partial<Document>): Promise<Document> => {
  const response = await apiClient.put<ApiResponse<Document>>(`/api/documents/${id}`, document);
  documentsPromise = null;
  return response.data.returnData;
};

export const deleteDocument = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/api/documents/${id}`);
  documentsPromise = null;
  return response.data;
};

export const uploadDocument = async (
  file: File,
  workspaceId: string,
  tenantId: string
): Promise<ApiResponse<Document>> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('workspaceId', workspaceId);
  formData.append('tenantId', tenantId);

  const response = await apiClient.post<ApiResponse<Document>>('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  documentsPromise = null;
  return response.data;
};

export interface UploadDocumentMetadata {
  Title: string;
  WorkspaceId: string;
  ParentId?: string;
  DocumentType: string;
  Status: string;
  Tags: string[];
  file: File;
}

export const uploadDocumentWithMetadata = async (data: UploadDocumentMetadata): Promise<ApiResponse<Document>> => {
  const formData = new FormData();
  formData.append('Title', data.Title);
  formData.append('WorkspaceId', data.WorkspaceId);
  if (data.ParentId) {
    formData.append('ParentId', data.ParentId);
  }
  formData.append('DocumentType', data.DocumentType);
  formData.append('Status', data.Status);
  data.Tags.forEach((tag, index) => {
    formData.append(`Tags[${index}]`, tag);
  });
  formData.append('file', data.file);

  // Debugging: Log FormData entries
  console.log('Uploading document with metadata:');
  for (const pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  try {
    const response = await apiClient.post<ApiResponse<Document>>('/api/documents/uploadDocument', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    documentsPromise = null;
    return response.data;
  } catch (err: any) {
    console.error("DEBUG UPLOAD ERROR:", err.response?.data || err.message);
    return {
      isSucceeded: false,
      apiStatusCode: err.response?.status || 500,
      errorMessage: `DEBUG ERROR HTTP ${err.response?.status}: ${JSON.stringify(err.response?.data?.title || err.response?.data || err.message)}`,
      successMessage: null,
      returnData: null as any
    };
  }
};

export const downloadDocument = async (id: string): Promise<Blob> => {
  const response = await apiClient.get(`/api/documents/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const getDocumentPreview = async (id: string): Promise<Blob> => {
  const response = await apiClient.get(`/api/documents/${id}/preview`, {
    responseType: 'blob',
  });
  return response.data;
};
