import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const bgColors = {
          success: 'bg-emerald-600 text-white shadow-emerald-900/10',
          info: 'bg-slate-900 text-white shadow-slate-900/10',
          warning: 'bg-amber-600 text-white shadow-amber-900/10',
          error: 'bg-rose-600 text-white shadow-rose-900/10',
        };

        const icons = {
          success: 'check_circle',
          info: 'info',
          warning: 'warning',
          error: 'error',
        };

        const toastType = toast.tipo || toast.type || 'info';
        const toastTitle = toast.titulo || toast.title || '';
        const toastDesc = toast.descripcion || toast.description;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border border-white/10 transition-all transform animate-in slide-in-from-bottom-2 ${bgColors[toastType]}`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
              {icons[toastType]}
            </span>
            <div className="flex-1 text-sm">
              <p className="font-semibold leading-snug">{toastTitle}</p>
              {toastDesc && (
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toastDesc}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 hover:opacity-75 transition-opacity"
              aria-label="Cerrar notificación"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
