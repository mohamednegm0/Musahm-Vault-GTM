import apiClient from './apiClient';

export interface DocumentTypeDto {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}


export interface CreateDocumentTypeDto {
  nameAr: string;
  nameEn: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export const getAllDocumentTypes = async (): Promise<DocumentTypeDto[]> => {
  const response = await apiClient.get<DocumentTypeDto[]>('/api/DocumentTypes');
  return response.data || [];
};

export const createDocumentType = async (dto: CreateDocumentTypeDto): Promise<DocumentTypeDto> => {
  const response = await apiClient.post<DocumentTypeDto>('/api/DocumentTypes', { ...dto, isActive: true });
  return response.data;
};
