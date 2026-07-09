import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { RiCheckLine, RiErrorWarningLine, RiInformationLine, RiCloseLine } from 'react-icons/ri';

const ToastContext = createContext(null);

const icons = { success: RiCheckLine, error: RiErrorWarningLine, info: RiInformationLine };
const styles = {
  success: 'bg-green-900/90 border-green-500/50 text-green-100',
  error: 'bg-red-900/90 border-red-500/50 text-red-100',
  info: 'bg-surface-3 border-surface-4 text-white',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 flex flex-col items-center gap-2 z-50 px-4 pointer-events-none">
        {toasts.map(({ id, message, type }) => {
          const Icon = icons[type];
          return (
            <div
              key={id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl max-w-sm w-full pointer-events-auto',
                styles[type]
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-sm flex-1">{message}</span>
              <button onClick={() => dismiss(id)} className="shrink-0 opacity-60 hover:opacity-100">
                <RiCloseLine size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
