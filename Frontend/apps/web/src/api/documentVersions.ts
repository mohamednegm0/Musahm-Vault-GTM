import apiClient from './apiClient';

export interface DocumentVersion {
    id: string;
    document_id: string;
    version: number;
    file_id: string;
    file_name: string;
    file_size: number;
    content_type: string;
    file_content?: string;
    created_by?: string;
    created_at?: string;
    createdByName?: string;
}

export interface ApiResponse<T> {
    isSucceeded: boolean;
    apiStatusCode: number;
    successMessage: string | null;
    errorMessage: string;
    returnData: T;
    extraReturnData?: any;
    extra2ReturnData?: any;
}

export const getDocumentVersions = async (documentId: string): Promise<DocumentVersion[]> => {
    const response = await apiClient.get<ApiResponse<DocumentVersion[]>>('/api/DocumentVersions', {
        params: { documentId }
    });
    return response.data.returnData;
};

export const getDocumentVersionById = async (id: string): Promise<DocumentVersion> => {
    const response = await apiClient.get<ApiResponse<DocumentVersion>>(`/api/DocumentVersions/${id}`);
    return response.data.returnData;
};

export const deleteDocumentVersion = async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/DocumentVersions/${id}`);
    return response.data;
};

export const downloadDocumentVersion = async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/DocumentVersions/${id}/download`, {
        responseType: 'blob',
    });
    return response.data;
};

export const uploadDocumentVersion = async (documentId: string, file: File): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append('documentId', documentId);
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<void>>('/api/DocumentVersions/uploadDocumentVersion', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
