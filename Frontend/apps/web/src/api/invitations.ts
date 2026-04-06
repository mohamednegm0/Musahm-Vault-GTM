import apiClient from './apiClient';

export interface Invitation {
  id: string;
  tenantId?: string;
  documentId: string;
  workspaceId?: string;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  fileContent?: string;
  email: string;
  role?: string;
  status: 'pending' | 'Accepted' | 'Declined';
  token?: string;
  expiresAt?: string;
  createdBy?: string;
  createdAt?: string;

  // Keeping these for compatibility if used elsewhere, but marked optional
  respondedAt?: Date;
  invitedBy?: string;
}

export interface ShareDocumentResponse {
  isSucceeded: boolean;
  apiStatusCode: number;
  successMessage?: string | null;
  errorMessage?: string;
  returnData: {
    documentId: string;
    documentName: string;
    fileSize: number;
    contentType: string;
    invitations: Invitation[];
  };
}

export interface ShareDocumentRequest {
  documentId: string;
  emails: string[];
  expiryDate?: string;
}

// 1. Get all users shared with a document
export const getDocumentInvitations = async (documentId: string): Promise<Invitation[]> => {
  const response = await apiClient.get<any>(`/api/Invitations/document/${documentId}`);
  // Check if it's the wrapper structure
  if (response.data && Array.isArray(response.data.returnData)) {
    return response.data.returnData;
  }
  // Fallback if it is direct array (legacy) or other structure
  return Array.isArray(response.data) ? response.data : [];
};

// 2. Share document with emails
export const shareDocument = async (data: ShareDocumentRequest): Promise<ShareDocumentResponse> => {
  const response = await apiClient.post<ShareDocumentResponse>('/api/Invitations', data);
  return response.data;
};

// 3. Accept invitation
export const acceptInvitation = async (id: string): Promise<void> => {
  await apiClient.post(`/api/Invitations/${id}/accept`);
};

// 3. Decline invitation
export const declineInvitation = async (id: string): Promise<void> => {
  await apiClient.post(`/api/Invitations/${id}/decline`);
};

export const deleteInvitation = async (id: string): Promise<void> => {
  const response = await apiClient.delete<any>(`/api/Invitations/${id}`);
  if (response.data && response.data.apiStatusCode && response.data.apiStatusCode !== 200) {
    throw new Error(response.data.errorMessage || 'Failed to delete invitation');
  }
};

// Consolidated or legacy functions below if needed by other components, otherwise replaced/removed.
// Keeping strictly what was asked + minimal compat if needed. 
// The user request was very specific about the endpoints.

// Legacy support (if workspaceMembers.ts or others use these, we might need to keep them or refactor them)
// For now, I'll keep generic get/create if they were used for workspace invitations, 
// BUT the request seems to imply this file is now focused on document invitations or the user wants to OVERRIDE.
// Given "invitations.ts", it might be shared.
// However, looking at the file I read, it had `workspaceId` and generic invitations.
// I will keep the old functions but implement the new ones alongside to avoid breaking Workspace features if they use this file.
// The user said "use GET ... to get all user", implying replacement or specific usage for document.

export const getInvitations = async (): Promise<Invitation[]> => {
  const response = await apiClient.get<any>('/api/invitations');
  if (response.data && Array.isArray(response.data.returnData)) {
    return response.data.returnData;
  }
  return Array.isArray(response.data) ? response.data : [];
};

export const createInvitation = async (invitation: Partial<Invitation>): Promise<Invitation> => {
  const response = await apiClient.post<any>('/api/invitations', invitation);
  return response.data?.returnData ?? response.data;
};

export const getPendingInvitations = async (): Promise<Invitation[]> => {
  const response = await apiClient.get<any>('/api/invitations/pending');
  if (response.data && Array.isArray(response.data.returnData)) {
    return response.data.returnData;
  }
  return Array.isArray(response.data) ? response.data : [];
};

// API Response Interface
export interface ApiResponse<T = any> {
  isSucceeded: boolean;
  apiStatusCode: number;
  successMessage?: string | null;
  errorMessage?: string | null;
  returnData?: T | null;
  extraReturnData?: string | null;
  extra2ReturnData?: string | null;
}

// Generate OTP for invitation
export const generateOTP = async (invitationId: string, email: string): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>('/api/Invitations/generate-otp', {
    invitationId,
    email
  });
  return response.data;
};

// Verify OTP for invitation
export const verifyOTP = async (invitationId: string, email: string, otp: string): Promise<any> => {
  const response = await apiClient.post('/api/Invitations/verify-otp', {
    invitationId,
    email,
    otp
  }, {
    responseType: 'blob' // Important: Expect binary data
  });
  return response; // Return full response to access headers
};
