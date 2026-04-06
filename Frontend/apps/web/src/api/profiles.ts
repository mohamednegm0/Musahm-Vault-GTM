import apiClient from './apiClient';

interface ApiResponse<T> {
  isSucceeded: boolean;
  apiStatusCode: number;
  successMessage: string | null;
  errorMessage: string;
  returnData: T;
}

export interface UserProfile {
  id?: string;
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  avatar?: string;
  phone?: string;
  department?: string;
  role?: string;
  company?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/api/profiles');
  return response.data;
};

export const updateProfile = async (profile: UserProfile): Promise<UserProfile> => {
  const response = await apiClient.post<UserProfile>('/api/profiles/update', profile);
  return response.data;
};

// ... existing code ...
export const changePassword = async (request: ChangePasswordRequest): Promise<any> => {
  const response = await apiClient.post('/api/profiles/change-password', request);
  return response.data;
};

export interface ProfileUser {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  type: string;
  vaultUserId?: string;
}

export const getAllProfileUsers = async (search?: string): Promise<ProfileUser[]> => {
  const response = await apiClient.get<any>('/api/Profiles/users', {
    params: search ? { search } : {}
  });
  const data = response.data?.returnData;
  if (data && !Array.isArray(data)) {
    return [data];
  }
  return data || [];
};
