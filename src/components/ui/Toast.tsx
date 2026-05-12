'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastStore {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: Date.now() + Math.random() }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string, description?: string) =>
    useToastStore.getState().push({ message, description, variant: 'success', duration: 3500 }),
  error: (message: string, description?: string) =>
    useToastStore.getState().push({ message, description, variant: 'error', duration: 5000 }),
  warning: (message: string, description?: string) =>
    useToastStore.getState().push({ message, description, variant: 'warning', duration: 4000 }),
  info: (message: string, description?: string) =>
    useToastStore.getState().push({ message, description, variant: 'info', duration: 3500 }),
};

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastVariant, string> = {
  success: 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50',
  error: 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50',
  warning: 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50',
  info: 'border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50',
};

const ICON_STYLES: Record<ToastVariant, string> = {
  success: 'text-green-600 bg-green-100',
  error: 'text-red-600 bg-red-100',
  warning: 'text-amber-600 bg-amber-100',
  info: 'text-blue-600 bg-blue-100',
};

const PROGRESS_STYLES: Record<ToastVariant, string> = {
  success: 'bg-gradient-to-r from-green-500 to-emerald-500',
  error: 'bg-gradient-to-r from-red-500 to-rose-500',
  warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
  info: 'bg-gradient-to-r from-blue-500 to-sky-500',
};

function ToastItem({ t }: { t: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = ICONS[t.variant];

  useEffect(() => {
    const timer = setTimeout(() => dismiss(t.id), t.duration);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, dismiss]);

  return (
    <div
      className={`relative pointer-events-auto bg-white border ${STYLES[t.variant]} rounded-2xl shadow-2xl shadow-black/5 p-4 pr-10 min-w-[280px] max-w-sm overflow-hidden animate-slide-up`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${ICON_STYLES[t.variant]} flex items-center justify-center flex-shrink-0`}>
          <Icon size={17} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <p className="text-sm font-black text-gray-900 leading-tight">{t.message}</p>
          {t.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{t.description}</p>}
        </div>
      </div>
      <button
        onClick={() => dismiss(t.id)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-white/60"
        aria-label="Dismiss"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 overflow-hidden">
        <div
          className={`h-full ${PROGRESS_STYLES[t.variant]}`}
          style={{ animation: `toastProgress ${t.duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none sm:max-w-sm">
        {toasts.map((t) => <ToastItem key={t.id} t={t} />)}
      </div>
      <style jsx global>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
}
