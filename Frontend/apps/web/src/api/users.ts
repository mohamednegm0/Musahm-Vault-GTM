import apiClient from './apiClient';

export interface UserRole {
    roleId: string;
    roleName: string;
}



export interface UserBase {
    id: string;
    companyId: number;
    nameAr: string;
    nameEn: string;
    email: string;
    mobileCountryCode: number;
    mobileNumber: string;
    isMain: boolean;
    isActive: boolean;
    identityNumber: string;
    isAbsherDefaultOtp: boolean;
    isTwoFactorAuthentication: boolean;
    authorizationLetterPath: string;
    roles: UserRole[];
}

export interface UserListItem extends UserBase {
}

export interface CreateUserRequest {
    companyId: number;
    nameAr: string;
    nameEn: string;
    email: string;
    mobileCountryCode: number;
    mobileNumber: string;
    isActive: boolean;
    roleIds: string[];
    identityNumber?: string;
}

export interface UpdateUserRequest {
    id: string;
    nameAr: string;
    nameEn: string;
    email: string;
    mobileCountryCode: number;
    mobileNumber: string;
    isActive: boolean;
    roleIds: string[];
    identityNumber?: string;
}

export interface Country {
    id: number;
    countryNameEn: string;
    countryNameAr: string;
    countryCode: number;
    timeZone: string;
}

export interface ApiResponse<T> {
    isSucceeded: boolean;
    apiStatusCode: number;
    successMessage: string | null;
    errorMessage: string | null;
    returnData: T;
    extraReturnData: any;
    extra2ReturnData: any;
}

export interface EmployeeCompany {
    rowNumber: number;
    id: number;
    name: string;
    companyTypeName: string;
    logo: string | null;
}

export interface RegisterCompanyRequest {
    fullNameAr: string;
    fullNameEn: string;
    email: string;
    companyNameAr: string;
    companyNameEn: string;
    password?: string;
    confirmPassword?: string;
}

export const userService = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<UserListItem[]>>('/api/Users');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<UserListItem>>(`/api/Users/${id}`);
        return response.data;
    },

    create: async (user: CreateUserRequest) => {
        const response = await apiClient.post<ApiResponse<boolean>>('/api/Users/CreateUser', user);
        return response.data;
    },

    update: async (user: UpdateUserRequest) => {
        const response = await apiClient.put<ApiResponse<{ value: string }>>('/api/Users/UpdateUser', user);
        return response.data;
    },

    getCountryCodes: async () => {
        const response = await apiClient.get<ApiResponse<Country[]>>('/api/Auth/Countries');
        return response.data;
    },

    activeByEmail: async (email: string) => {
        const response = await apiClient.get<ApiResponse<any>>(`/api/Auth/ActiveByEmail?email=${encodeURIComponent(email)}`, {
            skipGlobalLoader: true
        } as any);
        return response.data;
    },

    getEmployeeCompanies: async (employeeId: string) => {
        const response = await apiClient.get<ApiResponse<EmployeeCompany[]>>(`/api/Users/EmployeeCompanies/${employeeId}`);
        return response.data;
    },

    registerCompany: async (data: RegisterCompanyRequest) => {
        const response = await apiClient.post<ApiResponse<boolean>>('/api/Auth/register', data);
        return response.data;
    }
};


