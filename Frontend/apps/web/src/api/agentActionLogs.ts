import apiClient from './apiClient';

export interface AgentActionLog {
  id?: string;
  agentId: string;
  action: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Executed';
  description?: string;
  triggeredBy?: string;
  approvedBy?: string;
  sources?: string[];
  createdAt?: Date;
  executedAt?: Date;
}

export const getAgentActionLogs = async (): Promise<AgentActionLog[]> => {
  const response = await apiClient.get<AgentActionLog[]>('/api/agentactionlogs');
  return response.data;
};

export const getAgentActionLogById = async (id: string): Promise<AgentActionLog> => {
  const response = await apiClient.get<AgentActionLog>(`/api/agentactionlogs/${id}`);
  return response.data;
};

export const createAgentActionLog = async (log: AgentActionLog): Promise<AgentActionLog> => {
  const response = await apiClient.post<AgentActionLog>('/api/agentactionlogs', log);
  return response.data;
};

export const updateAgentActionLog = async (id: string, log: AgentActionLog): Promise<AgentActionLog> => {
  const response = await apiClient.put<AgentActionLog>(`/api/agentactionlogs/${id}`, log);
  return response.data;
};

export const deleteAgentActionLog = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/agentactionlogs/${id}`);
};

export const getPendingAgentActions = async (): Promise<AgentActionLog[]> => {
  const response = await apiClient.get<AgentActionLog[]>('/api/agentactionlogs/pending');
  return response.data;
};

export const approveAgentAction = async (id: string): Promise<void> => {
  await apiClient.post(`/api/agentactionlogs/${id}/approve`);
};

export const rejectAgentAction = async (id: string): Promise<void> => {
  await apiClient.post(`/api/agentactionlogs/${id}/reject`);
};
