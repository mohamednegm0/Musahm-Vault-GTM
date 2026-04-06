import apiClient from './apiClient';

export interface RoleDto {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    descriptionAr?: string;
    descriptionEn?: string;
}

export const getAllRoles = async (): Promise<RoleDto[]> => {
    const response = await apiClient.get<any>('/api/Roles');
    return response.data?.returnData || [];
};
