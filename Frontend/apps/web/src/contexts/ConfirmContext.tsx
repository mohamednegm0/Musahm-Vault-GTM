import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertTriangle, Info, Trash2, CheckCircle2 } from 'lucide-react';
import '../components/ConfirmDialog.css';

interface ConfirmOptions {
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning' | 'success';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
  close: () => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Don't nullify options immediately to allow fade out animation if we implemented one, 
    // but for now immediate close is fine.
    setTimeout(() => setOptions(null), 200); 
  }, []);

  const handleConfirm = async () => {
    if (!options) return;
    try {
      setIsLoading(true);
      await options.onConfirm();
    } catch (error) {
       console.error("Error in confirm action:", error);
    } finally {
      setIsLoading(false);
      close();
    }
  };

  const handleCancel = () => {
    if (options?.onCancel) options.onCancel();
    close();
  };

  return (
    <ConfirmContext.Provider value={{ confirm, close }}>
      {children}
      {isOpen && options && (
        <div className="confirm-overlay" onClick={(e) => { if(e.target === e.currentTarget) handleCancel() }}>
          <div className="confirm-dialog" role="dialog" aria-modal="true">
            <div className="confirm-header">
              <div className={`confirm-icon ${options.type || 'info'}`}>
                 {options.type === 'danger' ? <Trash2 size={24} /> : 
                  options.type === 'warning' ? <AlertTriangle size={24} /> :
                  options.type === 'success' ? <CheckCircle2 size={24} /> :
                  <Info size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="confirm-title">{options.title}</h3>
              </div>
            </div>
            
            <p className="confirm-description">
              {options.message}
            </p>

            <div className="confirm-actions">
              <button 
                className="confirm-btn cancel" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button 
                className={`confirm-btn confirm ${options.type === 'success' ? 'success' : options.type || 'primary'}`} 
                onClick={handleConfirm}
                disabled={isLoading}
              >
                 {isLoading ? '...' : (options.confirmText || 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
