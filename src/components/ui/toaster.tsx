import React, { useState, createContext, useContext } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose?: () => void;
}

interface ToastContextType {
  toast: ToastProps | null;
  showToast: (toast: ToastProps) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: null,
  showToast: () => {},
  hideToast: () => {}
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (newToast: ToastProps) => {
    setToast(newToast);
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      {toast && <Toast {...toast} onClose={hideToast} />}
    </ToastContext.Provider>
  );
};

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  onClose 
}) => {
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 flex items-center p-4 text-white rounded-lg shadow-lg ${typeStyles[type]}`}
    >
      <span className="mr-4">{message}</span>
      {onClose && (
        <button 
          onClick={onClose} 
          className="hover:bg-white/20 rounded-full p-1"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};
