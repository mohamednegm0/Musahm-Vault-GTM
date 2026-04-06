import apiClient from './apiClient';

export interface ApiResponse<T> {
    isSucceeded: boolean;
    apiStatusCode: number;
    successMessage: string | null;
    errorMessage: string | null;
    returnData: T;
    extraReturnData: any;
    extra2ReturnData: any;
}

export interface Role {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    level: number;
    isActive: boolean;
    isSystemRole: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateRoleRequest {
    code: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    level: number;
}

export interface Permission {
    id: string;
    code: string;
    module: string;
    action: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    isActive: boolean;
    createdAt: string;
}

export const roleService = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<Role[]>>('/api/Roles');
        return response.data;
    },
    create: async (data: CreateRoleRequest) => {
        const response = await apiClient.post<ApiResponse<Role>>('/api/Roles', data);
        return response.data;
    },
    getByCode: async (code: string) => {
        const response = await apiClient.get<ApiResponse<Role>>(`/api/Roles/code/${code}`);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<string>>(`/api/Roles/${id}`);
        return response.data;
    },
    getPermissions: async (roleId: string) => {
        const response = await apiClient.get<ApiResponse<Permission[]>>(`/api/Roles/${roleId}/permissions`);
        return response.data;
    },
    assignPermissions: async (roleId: string, permissionIds: string[]) => {
        const response = await apiClient.post<ApiResponse<string>>(`/api/Roles/${roleId}/permissions`, { permissionIds });
        return response.data;
    }
};

export const permissionService = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<Permission[]>>('/api/Permissions');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Permission>>(`/api/Permissions/${id}`);
        return response.data;
    },
    getByCode: async (code: string) => {
        const response = await apiClient.get<ApiResponse<Permission>>(`/api/Permissions/code/${code}`);
        return response.data;
    },
    getByModule: async (module: string) => {
        const response = await apiClient.get<ApiResponse<Permission[]>>(`/api/Permissions/module/${module}`);
        return response.data;
    }
};
