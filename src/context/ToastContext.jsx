import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container floating at bottom right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${
              t.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-slate-800 shadow-[0_12px_30px_-8px_rgba(16,185,129,0.2)]'
                : t.type === 'error'
                ? 'bg-white/95 border-rose-200 text-slate-800 shadow-[0_12px_30px_-8px_rgba(244,63,94,0.2)]'
                : 'bg-white/95 border-indigo-200 text-slate-800 shadow-[0_12px_30px_-8px_rgba(99,102,241,0.2)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  t.type === 'success'
                    ? 'bg-emerald-50 text-emerald-600'
                    : t.type === 'error'
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                {t.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {t.type === 'error' && <AlertCircle className="w-4 h-4" />}
                {t.type === 'info' && <Info className="w-4 h-4" />}
              </div>
              <p className="text-xs font-semibold leading-tight">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
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
