import apiClient from './apiClient';

export interface DocumentExtraction {
  id?: string;
  documentId: string;
  documentType: string;
  confidence: number;
  extractedFields?: Record<string, any>;
  status: 'Pending' | 'Approved' | 'Rejected';
  extractedAt?: Date;
  approvedAt?: Date;
  reviewedBy?: string;
}

export const getDocumentExtractions = async (): Promise<DocumentExtraction[]> => {
  const response = await apiClient.get<DocumentExtraction[]>('/api/documentextractions');
  return response.data;
};

export const getDocumentExtractionById = async (id: string): Promise<DocumentExtraction> => {
  const response = await apiClient.get<DocumentExtraction>(`/api/documentextractions/${id}`);
  return response.data;
};

export const createDocumentExtraction = async (extraction: DocumentExtraction): Promise<DocumentExtraction> => {
  const response = await apiClient.post<DocumentExtraction>('/api/documentextractions', extraction);
  return response.data;
};

export const updateDocumentExtraction = async (id: string, extraction: DocumentExtraction): Promise<DocumentExtraction> => {
  const response = await apiClient.put<DocumentExtraction>(`/api/documentextractions/${id}`, extraction);
  return response.data;
};

export const deleteDocumentExtraction = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/documentextractions/${id}`);
};

export const getPendingExtractions = async (): Promise<DocumentExtraction[]> => {
  const response = await apiClient.get<DocumentExtraction[]>('/api/documentextractions/pending');
  return response.data;
};

export const approveExtraction = async (id: string): Promise<void> => {
  await apiClient.put(`/api/documentextractions/${id}/approve`);
};

export const rejectExtraction = async (id: string): Promise<void> => {
  await apiClient.put(`/api/documentextractions/${id}/reject`);
};
