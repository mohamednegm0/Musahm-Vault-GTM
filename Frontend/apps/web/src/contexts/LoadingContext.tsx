import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Static controller for use in non-React files (like apiClient)
export const loadingController = {
    _updateCallback: (count: number) => { },
    _count: 0,

    increment: function () {
        this._count++;
        this._updateCallback(this._count);
    },

    decrement: function () {
        this._count = Math.max(0, this._count - 1);
        this._updateCallback(this._count);
    }
};

interface LoadingContextType {
    isLoading: boolean;
    requestCount: number;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        loadingController._updateCallback = (count: number) => {
            setRequestCount(count);
        };
    }, []);

    const isLoading = requestCount > 0;

    return (
        <LoadingContext.Provider value={{
            isLoading,
            requestCount
        }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
