'use client';

import { useState } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return { toasts, addToast, removeToast };
}

export default function Toast({ toasts, removeToast }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px', width: '100%' }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            background: toast.type === 'success' ? 'var(--yellow)' : toast.type === 'error' ? 'rgba(204,51,51,0.12)' : 'var(--card-bg)',
            border: `2px solid ${toast.type === 'success' ? 'var(--accent)' : toast.type === 'error' ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px',
            boxShadow: `4px 4px 0px 0px ${toast.type === 'success' ? 'var(--accent)' : toast.type === 'error' ? 'var(--danger)' : 'var(--shadow)'}`,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideIn 0.2s ease',
          }}
        >
          {toast.type === 'success' && <Check size={18} strokeWidth={2.5} color="var(--accent)" style={{ flexShrink: 0 }} />}
          {toast.type === 'error' && <AlertCircle size={18} strokeWidth={2.5} color="var(--danger)" style={{ flexShrink: 0 }} />}
          {toast.type === 'info' && <Info size={18} strokeWidth={2.5} color="var(--fg)" style={{ flexShrink: 0 }} />}
          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.95rem', margin: 0, flex: 1, color: 'var(--fg)' }}>{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <X size={16} strokeWidth={2.5} color="var(--subtle)" />
          </button>
        </div>
      ))}
    </div>
  );
}