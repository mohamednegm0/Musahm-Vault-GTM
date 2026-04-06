import apiClient from './apiClient';

export interface WorkflowAssignment {
    id: string;
    workflow_id: string;
    target_id: string;
    target_type: string;
    document_type_ids: string[];
    role_ids: string[];
    exception_user_ids: string[];
    trigger_codes?: string[];
    created_at: string;
    isActive?: boolean;
}

export interface CreateWorkflowAssignmentDto {
    workflow_id: string;
    target_id: string;
    target_type: string;
    document_type_ids: string[];
    role_ids: string[];
    exception_user_ids: string[];
    isActive?: boolean;
}

export interface AssignmentResult {
    success: boolean;
    message?: string;
    data?: WorkflowAssignment;
}

export const createAssignment = async (data: CreateWorkflowAssignmentDto): Promise<AssignmentResult> => {
    try {
        const response = await apiClient.post<any>('/api/WorkflowAssignments', data);
        
        console.log('[createAssignment] Response data:', response.data);
        
        // Check both possible response structures
        const isSucceeded = response.data?.isSucceeded ?? (response.data?.statusCode === 200);
        const statusCode = response.data?.apiStatusCode ?? response.data?.statusCode;
        const errorMsg = response.data?.errorMessage ?? response.data?.message;
        const successMsg = response.data?.successMessage;
        
        // Check if the operation failed
        if (!isSucceeded || (statusCode && statusCode !== 200)) {
            // Backend returned an error (e.g., Conflict=409)
            const message = errorMsg || 'لا يمكن إضافة التعيين / Cannot add assignment';
            return {
                success: false,
                message: message
            };
        }
        
        if (!response.data?.returnData) {
            console.error('[createAssignment] No returnData in response!');
            return {
                success: false,
                message: 'لم يتم إرجاع البيانات من الخادم / No data returned from server'
            };
        }
        
        return {
            success: true,
            data: response.data.returnData,
            message: successMsg
        };
    } catch (err: any) {
        // Network or other errors
        const message = err?.response?.data?.errorMessage || err?.response?.data?.message || err?.message || 'حدث خطأ في الاتصال / Connection error';
        return {
            success: false,
            message: message
        };
    }
};

export const updateAssignment = async (id: string, data: Partial<CreateWorkflowAssignmentDto>): Promise<AssignmentResult> => {
    try {
        const response = await apiClient.put<any>(`/api/WorkflowAssignments/${id}`, data);
        
        console.log('[updateAssignment] Response data:', response.data);
        
        // Check both possible response structures
        const isSucceeded = response.data?.isSucceeded ?? (response.data?.statusCode === 200);
        const statusCode = response.data?.apiStatusCode ?? response.data?.statusCode; // Corrected typo here, was response.data?.statusCode code
        const errorMsg = response.data?.errorMessage ?? response.data?.message;
        const successMsg = response.data?.successMessage;
        
        // Check if the operation failed
        if (!isSucceeded || (statusCode !== undefined && statusCode !== 200)) {
             // Backend returned an error
            const message = errorMsg || 'لا يمكن تحديث التعيين / Cannot update assignment';
             return {
                success: false,
                message: message
            };
        }
        
        if (!response.data?.returnData) {
            console.error('[updateAssignment] No returnData in response!');
            return {
                success: false,
                message: 'لم يتم إرجاع البيانات من الخادم / No data returned from server'
            };
        }
        
        return {
            success: true,
            data: response.data.returnData,
            message: successMsg
        };

    } catch (err: any) {
        // Network or other errors
        const message = err?.response?.data?.errorMessage || err?.response?.data?.message || err?.message || 'حدث خطأ في الاتصال / Connection error';
        return {
            success: false,
            message: message
        };
    }
};

export const getAssignmentsByTarget = async (targetId: string): Promise<WorkflowAssignment[]> => {
    const response = await apiClient.get<any>(`/api/WorkflowAssignments/target/${targetId}`);
    return response.data?.returnData || [];
};

export const getAssignmentsByWorkflow = async (workflowId: string): Promise<WorkflowAssignment[]> => {
    const response = await apiClient.get<any>(`/api/WorkflowAssignments/workflow/${workflowId}`);
    return response.data?.returnData || [];
};

export const getApplicableWorkflow = async (targetId: string, actionCode: string): Promise<any | null> => { // Returns Workflow or null
    const response = await apiClient.get<any>(`/api/WorkflowAssignments/check-applicable?targetId=${targetId}&actionCode=${actionCode}`);
    return response.data?.returnData || null;
};
