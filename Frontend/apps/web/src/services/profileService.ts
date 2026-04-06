import apiClient from '../api/apiClient';
import { AuthResponse } from './authService';
import { mapErrorToKey } from '../utils/errorUtils';

export interface ProfileData {
    name: string;
    companyName: string;
    email: string;
    mobileNumber?: string;
    accountType?: string;
}

export interface UpdateProfileRequest {
    fullNameAr: string;
    fullNameEn: string;
    email: string;
    companyNameAr: string;
    companyNameEn: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const profileService = {
    async getProfile(): Promise<AuthResponse & { returnData: ProfileData }> {
        try {
            const response = await apiClient.get<AuthResponse & { returnData: ProfileData }>('/api/Profiles');
            return response.data;
        } catch (error: any) {
            return {
                isSucceeded: false,
                apiStatusCode: error.response?.status || 500,
                successMessage: null,
                errorMessage: mapErrorToKey(error),
                returnData: null as any,
                extraReturnData: null,
                extra2ReturnData: null
            };
        }
    },

    async updateProfile(data: UpdateProfileRequest): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<AuthResponse>('/api/Profiles/update', data);
            return response.data;
        } catch (error: any) {
            const errorData = error.response?.data;
            let errorMessage = mapErrorToKey(error);

            if (errorData?.errors) {
                const validationErrors = Object.values(errorData.errors).flat();
                if (validationErrors.length > 0) {
                    errorMessage = String(validationErrors[0]);
                }
            }

            return {
                isSucceeded: false,
                apiStatusCode: error.response?.status || 500,
                successMessage: null,
                errorMessage: errorMessage,
                returnData: null
            };
        }
    },

    async changePassword(data: ChangePasswordRequest): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<AuthResponse>('/api/Profiles/change-password', data);
            return response.data;
        } catch (error: any) {
            const errorData = error.response?.data;
            let errorMessage = mapErrorToKey(error);

            if (errorData?.errors) {
                const validationErrors = Object.values(errorData.errors).flat();
                if (validationErrors.length > 0) {
                    errorMessage = String(validationErrors[0]);
                }
            }

            return {
                isSucceeded: false,
                apiStatusCode: error.response?.status || 500,
                successMessage: null,
                errorMessage: errorMessage,
                returnData: null
            };
        }
    }
};
