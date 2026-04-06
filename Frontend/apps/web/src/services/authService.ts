import apiClient from '../api/apiClient';
import { mapErrorToKey } from '../utils/errorUtils';

// Auth Response Interface
export interface AuthResponse {
  isSucceeded: boolean;
  apiStatusCode: number;
  successMessage: string | null;
  errorMessage: string | null;
  returnData?: any;
  token?: string; // Sometimes returned directly or inside returnData
  email?: string;
  [key: string]: any;
}

// Request Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginRequest {
  companyId: number;
  adminEmail: string;
  adminPassword: string;
}

export interface AdminPartnerLoginRequest {
  identityNumber: string;
  adminEmail: string;
  adminPassword: string;
}

export interface PartnerLoginRequest {
  identityNumber: string;
}

export interface VerifyOTPRequest {
  identityNumber: string;
  otp: string;
  rememberMe: boolean;
  firebaseToken: string;
  deviceName: string;
}

export interface RegisterRequest {
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  companyNameAr: string;
  companyNameEn: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
  code: string;
}

export interface GRCActiveCompany {
  id: number;
  name: string;
}

export interface PartnerCompany {
  rowNumber: number;
  id: number;
  name: string;
  companyTypeName: string;
  logo: string | null;
}

export interface EmployeeCompany {
  rowNumber: number;
  id: number;
  name: string;
  companyTypeName: string;
  logo: string | null;
}

export interface EmployeeCompanyListItem {
  id: number;
  name: string;
}

export interface EmailCheckResult {
  exists: boolean;
  errorMessage?: string;
  userData?: {
    nameAr: string;
    nameEn: string;
    companyName: string;
  };
}

export const authService = {
  // Get Partner Companies Count
  async getPartnerCompaniesCount(partnerId: string | number): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>(`/api/Users/PartnerCompaniesCount/${partnerId}`);
      return response.data;
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  _partnerCompaniesPromise: null as Promise<AuthResponse> | null,

  // Get Partner Companies List
  async getPartnerCompaniesList(partnerId: string | number): Promise<AuthResponse> {
    if (this._partnerCompaniesPromise) {
      return this._partnerCompaniesPromise;
    }

    this._partnerCompaniesPromise = (async () => {
      try {
        const response = await apiClient.get<AuthResponse>(`/api/Users/PartnerCompaniesList/${partnerId}`);
        return response.data;
      } catch (error: any) {
        return {
          isSucceeded: false,
          apiStatusCode: error.response?.status || 500,
          successMessage: null,
          errorMessage: mapErrorToKey(error),
          returnData: null
        };
      } finally {
        setTimeout(() => {
          this._partnerCompaniesPromise = null;
        }, 2000);
      }
    })();

    return this._partnerCompaniesPromise;
  },

  // Get Partner Companies
  async getPartnerCompanies(partnerId: string | number): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>(`/api/Users/PartnerCompanies/${partnerId}`);
      return response.data;
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Partner Change Company
  async partnerChangeCompany(companyId: string | number): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>(`/api/Users/PartnerChangeCompany/${companyId}`);
      const resData = response.data;

      // Extract token from returnData as per user spec
      const token = resData.token || resData.returnData?.token || (resData as any).Token || (resData.returnData as any)?.Token;

      return {
        ...resData,
        isSucceeded: resData.isSucceeded || resData.apiStatusCode === 200 || resData.apiStatusCode === 0,
        token: token
      };
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Admin as Employee Change Company
  async adminAsEmployeeChangeCompany(companyId: string | number): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>(`/api/Users/PartnerChangeCompany/${companyId}`);
      const resData = response.data;

      const token = resData.token || resData.returnData?.token || (resData as any).Token || (resData.returnData as any)?.Token;

      return {
        ...resData,
        isSucceeded: resData.isSucceeded || resData.apiStatusCode === 200 || resData.apiStatusCode === 0,
        token: token
      };
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Get Employee Companies Count
  async getEmployeeCompaniesCount(employeeId: string | number): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>(`/api/Users/EmployeeCompaniesCount/${employeeId}`);
      return response.data;
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  _employeeCompaniesPromise: null as Promise<AuthResponse> | null,

  // Get Employee Companies List
  async getEmployeeCompaniesList(employeeId: string | number): Promise<AuthResponse> {
    if (this._employeeCompaniesPromise) {
      return this._employeeCompaniesPromise;
    }

    this._employeeCompaniesPromise = (async () => {
      try {
        const response = await apiClient.get<AuthResponse>(`/api/Users/EmployeeCompaniesList/${employeeId}`);
        console.log('authService - getEmployeeCompaniesList response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('authService - getEmployeeCompaniesList error:', error);
        return {
          isSucceeded: false,
          apiStatusCode: error.response?.status || 500,
          successMessage: null,
          errorMessage: mapErrorToKey(error),
          returnData: null
        };
      } finally {
        // Clear promise after 2 seconds to allow refreshing but prevent rapid calls
        setTimeout(() => {
          this._employeeCompaniesPromise = null;
        }, 2000);
      }
    })();

    return this._employeeCompaniesPromise;
  },

  // Get Employee Companies (with full details for UI)
  async getEmployeeCompanies(employeeId: string | number): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>(`/api/Users/EmployeeCompanies/${employeeId}`);
      return response.data;
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Employee Change Company
  async employeeChangeCompany(companyId: string | number): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>(`/api/Users/EmployeeChangeCompany/${companyId}`);
      const resData = response.data;

      console.log('authService - employeeChangeCompany response:', resData);

      // Extract token from returnData as per user spec
      const token = resData.token || resData.returnData?.token || (resData as any).Token || (resData.returnData as any)?.Token;

      if (token) {
        return {
          ...resData,
          isSucceeded: true,
          token: token
        };
      }
      return resData;
    } catch (error: any) {
      console.error('authService - Employee Change Company error:', error);
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: error.response?.data?.errorMessage || mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Login
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('authService - Sending login request:', { email: data.email, password: '***' });

      const response = await apiClient.post<AuthResponse>('/api/Auth/login', data);
      const resData = response.data;

      console.log('authService - Raw response from Backend:', resData);

      // Attempt to find token in various places (root or returnData)
      const token = resData.token || (resData as any).Token || resData.returnData?.token || resData.returnData?.Token;

      console.log('authService - Extracted token:', { token: !!token, email: data.email, resData });

      if (token) {
        const loginResult = {
          ...resData,
          isSucceeded: true,
          apiStatusCode: 200,
          successMessage: resData.successMessage || 'loginSuccess',
          errorMessage: null,
          token: token,
          email: data.email
        };
        console.log('authService - Returning success:', loginResult);
        return loginResult;
      }

      console.log('authService - No token found, returning raw response');
      return resData;
    } catch (error: any) {
      // Return structured error if request fails
      const errorData = error.response?.data;
      console.error('authService - Login error (status):', error.response?.status);
      console.error('authService - Login error (data):', errorData);
      console.error('authService - Login error (message):', error.message);
      console.error('authService - Full error:', error);
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Admin Login
  async adminLogin(data: AdminLoginRequest): Promise<AuthResponse> {
    try {
      console.log('authService - Sending admin login request:', { email: data.adminEmail, companyId: data.companyId, password: '***' });

      const response = await apiClient.post<AuthResponse>('/api/Auth/adminlogin', data);
      const resData = response.data;

      console.log('authService - Raw response from Backend:', resData);

      // Extract token from returnData as per user spec
      const token = resData.token || resData.returnData?.token || (resData as any).Token || (resData.returnData as any)?.Token;

      console.log('authService - Extracted token:', { token: !!token, email: data.adminEmail, resData });

      if (token) {
        return {
          ...resData,
          isSucceeded: true,
          apiStatusCode: 200,
          successMessage: resData.successMessage || 'loginSuccess',
          errorMessage: null,
          token: token,
          email: data.adminEmail
        };
      }

      return resData;
    } catch (error: any) {
      console.error('authService - Admin Login error:', error.response?.status, error.response?.data);
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: error.response?.data?.errorMessage || mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Admin Partner Login
  async adminPartnerLogin(data: AdminPartnerLoginRequest): Promise<AuthResponse> {
    try {
      console.log('authService - Sending admin partner login request:', { identity: data.identityNumber, email: data.adminEmail, password: '***' });

      const response = await apiClient.post<AuthResponse>('/api/Auth/adminpartnerlogin', data);
      const resData = response.data;

      console.log('authService - Raw response from Backend:', resData);

      // Attempt to find token in various places (root or returnData)
      const token = resData.token || (resData as any).Token || resData.returnData?.token || resData.returnData?.Token;

      console.log('authService - Extracted token:', { token: !!token, email: data.adminEmail, resData });

      if (token) {
        const loginResult = {
          ...resData,
          isSucceeded: true,
          apiStatusCode: 200,
          successMessage: resData.successMessage || 'loginSuccess',
          errorMessage: null,
          token: token,
          email: data.adminEmail
        };
        console.log('authService - Returning success:', loginResult);
        return loginResult;
      }

      console.log('authService - No token found, returning raw response');
      return resData;
    } catch (error: any) {
      // Return structured error if request fails
      const errorData = error.response?.data;
      console.error('authService - Admin Partner Login error (status):', error.response?.status);
      console.error('authService - Admin Partner Login error (data):', errorData);
      console.error('authService - Admin Partner Login error (message):', error.message);
      console.error('authService - Full error:', error);
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Partner Login
  async partnerLogin(data: PartnerLoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/Auth/partnerlogin', data);
      return response.data;
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Verify Partner OTP
  async verifyPartnerOTP(data: VerifyOTPRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/Auth/VerifyOTP', data);
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data;
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: errorData?.errorMessage || mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Check if email already exists
  async checkEmailExists(email: string): Promise<EmailCheckResult> {
    try {
      const response = await apiClient.get<AuthResponse>(
        `/api/Auth/ActiveByEmail?email=${encodeURIComponent(email)}`,
        { skipGlobalLoader: true }   // ← silent check: no full-page loader GIF
      );
      const data = response.data;
      
      if (data.apiStatusCode === 200 && data.returnData) {
        return { 
          exists: true,
          userData: {
            nameAr: data.returnData.nameAr || data.returnData.NameAr || data.returnData.fullNameAr || data.returnData.FullNameAr || '',
            nameEn: data.returnData.nameEn || data.returnData.NameEn || data.returnData.fullNameEn || data.returnData.FullNameEn || '',
            companyName: data.returnData.companyName || data.returnData.CompanyName || ''
          }
        };
      }
      
      return { exists: false };
    } catch (error: any) {
      return { exists: false, errorMessage: mapErrorToKey(error) };
    }
  },

  // Register
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/Auth/register', data);
      return response.data;
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Forgot Password
  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/Auth/forget-password', data);
      return response.data;
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Reset Password
  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/Auth/reset-password', data);
      return response.data;
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Redirect To GRC
  async redirectToGRC(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/Auth/RedirectToGRC', {});
      return response.data;
    } catch (error: any) {
      return {
        isSucceeded: false,
        apiStatusCode: error.response?.status || 500,
        successMessage: null,
        errorMessage: error.response?.data?.errorMessage || mapErrorToKey(error),
        returnData: null
      };
    }
  },

  // Get Active Companies
  async getGRCActiveCompany(): Promise<GRCActiveCompany[]> {
    try {
      const response = await apiClient.get<any>('/api/Auth/GRCActiveCompany');
      console.log('authService - GRCActiveCompany response:', response.data);

      // According to user spec, data is in returnData
      if (response.data && response.data.returnData && Array.isArray(response.data.returnData)) {
        return response.data.returnData;
      }

      // Fallback
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch active companies', error);
      return [];
    }
  }
};
