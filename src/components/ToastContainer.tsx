import React from 'react';
import { useShop } from '../context/ShopContext.js';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-xl border text-sm transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-300 ${
              isSuccess
                ? 'bg-slate-900 text-white border-pink-500/30'
                : isError
                ? 'bg-red-950 text-white border-red-500/40'
                : 'bg-slate-900 text-slate-100 border-purple-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {isInfo && <Info className="w-5 h-5 text-purple-400 shrink-0" />}
              <span className="font-medium text-slate-100">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 ml-2 transition-colors"
              aria-label="Close toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
