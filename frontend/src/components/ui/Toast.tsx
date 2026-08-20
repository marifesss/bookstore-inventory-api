import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'warning';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

type ShowToast = (kind: ToastKind, message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

const AUTO_DISMISS_MS = 4000;

const accent: Record<ToastKind, string> = {
  success: 'border-l-forest',
  error: 'border-l-danger',
  warning: 'border-l-amber',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback<ShowToast>((kind, message) => {
    const id = Date.now() + Math.random();

    setToasts((current) => [...current, { id, kind, message }]);
    window.setTimeout(
      () => setToasts((current) => current.filter((toast) => toast.id !== id)),
      AUTO_DISMISS_MS,
    );
  }, []);

  // useMemo keeps the context value stable so consumers do not re-render on
  // every toast that appears.
  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`toast-enter pointer-events-auto w-[340px] rounded-card border-l-[3px] bg-surface p-4 shadow-modal ${accent[toast.kind]}`}
          >
            <p className="text-ink">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const show = useContext(ToastContext);

  if (show === null) {
    throw new Error('useToast must be used inside a ToastProvider');
  }

  return show;
}
