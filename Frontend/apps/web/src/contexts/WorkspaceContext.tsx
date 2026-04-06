import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { workspaceService } from '../services/workspaceService';
import { Folder } from 'lucide-react';
import { useAuth } from './AuthContext';

// Define the shape of a workspace item in the list
export interface WorkspaceItem {
    id: string;
    nameKey?: string; // For static/translation
    name?: string;
    icon: React.ElementType; // Icon component
    active?: boolean;
    legalHold?: boolean;
}

interface WorkspaceContextType {
    workspaces: WorkspaceItem[];
    loading: boolean;
    refreshWorkspaces: () => Promise<void>;
    addWorkspace: (workspace: WorkspaceItem) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, isInitialized } = useAuth();
    const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWorkspaces = useCallback(async () => {
        if (!isInitialized) return;

        if (!isAuthenticated) {
            setWorkspaces([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await workspaceService.getAll();
            const dynamicItems: WorkspaceItem[] = data.map((ws) => ({
                id: ws.id!,
                name: ws.name,
                icon: Folder,
                legalHold: (ws as any).legalHold || false,
            }));
            setWorkspaces(dynamicItems);
        } catch (err) {
            console.error('Failed to fetch workspaces', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isInitialized]);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    const refreshWorkspaces = async () => {
        await fetchWorkspaces();
    };

    const addWorkspace = (workspace: WorkspaceItem) => {
        setWorkspaces((prev) => [...prev, workspace]);
    };

    return (
        <WorkspaceContext.Provider value={{ workspaces, loading, refreshWorkspaces, addWorkspace }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};
