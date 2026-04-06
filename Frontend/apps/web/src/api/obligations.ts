import apiClient from './apiClient';

export interface Obligation {
  id?: string;
  title: string;
  description?: string;
  dueDate: Date;
  status?: string;
  documentId?: string;
  workspaceId?: string;
  clauses?: string[];
  createdAt?: Date;
}

export const getObligations = async (): Promise<Obligation[]> => {
  const response = await apiClient.get<Obligation[]>('/api/obligations');
  return response.data;
};

export const getObligationById = async (id: string): Promise<Obligation> => {
  const response = await apiClient.get<Obligation>(`/api/obligations/${id}`);
  return response.data;
};

export const createObligation = async (obligation: Obligation): Promise<Obligation> => {
  const response = await apiClient.post<Obligation>('/api/obligations', obligation);
  return response.data;
};

export const updateObligation = async (id: string, obligation: Obligation): Promise<Obligation> => {
  const response = await apiClient.put<Obligation>(`/api/obligations/${id}`, obligation);
  return response.data;
};

export const deleteObligation = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/obligations/${id}`);
};

export const getUpcomingObligations = async (days: number = 7): Promise<Obligation[]> => {
  const response = await apiClient.get<Obligation[]>('/api/obligations/upcoming', {
    params: { days },
  });
  return response.data;
};
