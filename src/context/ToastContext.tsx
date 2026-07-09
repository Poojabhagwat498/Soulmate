import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'info' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-5 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgColor = 'bg-surface-container-lowest border-primary/20 text-on-surface';
            let Icon = Info;
            let iconColor = 'text-primary';

            if (toast.type === 'success') {
              bgColor = 'bg-secondary-container text-on-secondary-container border-secondary/20';
              Icon = CheckCircle2;
              iconColor = 'text-secondary';
            } else if (toast.type === 'error') {
              bgColor = 'bg-error-container text-on-error-container border-error/20';
              Icon = AlertCircle;
              iconColor = 'text-error';
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`flex items-center gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md pointer-events-auto ${bgColor}`}
              >
                <Icon className={`w-5 h-5 flex-none ${iconColor}`} />
                <span className="font-sans text-sm font-semibold flex-1 leading-tight">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-full hover:bg-black/5 active:scale-95 transition-all text-on-surface-variant/60 hover:text-on-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
