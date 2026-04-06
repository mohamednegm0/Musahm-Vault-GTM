import apiClient from './apiClient';

export interface SearchResult {
  id: string;
  title: string;
  content?: string;
  documentType?: string;
  score?: number;
  source?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export interface AskVaultResponse {
  answer: string;
  sources?: SearchResult[];
  confidence?: number;
}

export interface SearchRequest {
  query: string;
}

export const keywordSearch = async (query: string): Promise<SearchResponse> => {
  const response = await apiClient.post<SearchResponse>('/api/search/keyword', { query });
  return response.data;
};

export const semanticSearch = async (query: string): Promise<SearchResponse> => {
  const response = await apiClient.post<SearchResponse>('/api/search/semantic', { query });
  return response.data;
};

export const askVault = async (query: string): Promise<AskVaultResponse> => {
  const response = await apiClient.post<AskVaultResponse>('/api/search/ask', { query });
  return response.data;
};
