
export const mapErrorToKey = (error: any): string => {
    if (error.message === 'Network Error') return 'networkError';

    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // Check if backend returned a specific error code/message we can map
        if (data?.errorMessage) return data.errorMessage; // Return backend message as is (or map if needed)
        if (data?.message) return data.message;

        if (status === 401) return 'unauthorized';
        if (status === 403) return 'forbidden';
        if (status === 404) return 'notFound';
        if (status >= 500) return 'serverError';
    }

    if (error.code === 'ECONNABORTED') return 'requestTimeout';

    return error.message || 'unknownError';
};
