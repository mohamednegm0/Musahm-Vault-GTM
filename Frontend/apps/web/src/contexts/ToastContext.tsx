import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Toast, { ToastType } from '../components/Toast';
import { useLanguage } from './LanguageContext';

interface ToastData {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
    const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const { t } = useLanguage();

    return (
        <ToastContext.Provider value={{ showToast, success, error }}>
            {children}
            <div className="toast-container" style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999 }}>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={t(toast.message)}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
