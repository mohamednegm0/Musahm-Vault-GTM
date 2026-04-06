import apiClient from './apiClient';

export interface AuditLog {
  id?: string;
  actorUserId: string;
  actorUserName?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  details?: string;
  createdAt: string;
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await apiClient.get<any>('/api/auditlogs');
  return response.data.returnData || [];
};

export const getAuditLogById = async (id: string): Promise<AuditLog> => {
  const response = await apiClient.get<AuditLog>(`/api/auditlogs/${id}`);
  return response.data;
};

export const createAuditLog = async (log: AuditLog): Promise<AuditLog> => {
  const response = await apiClient.post<AuditLog>('/api/auditlogs', log);
  return response.data;
};

export const updateAuditLog = async (id: string, log: AuditLog): Promise<AuditLog> => {
  const response = await apiClient.put<AuditLog>(`/api/auditlogs/${id}`, log);
  return response.data;
};

export const deleteAuditLog = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/auditlogs/${id}`);
};
