'use client';

import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', confirmDanger = false, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onCancel}>
      <div style={{ background: 'var(--card-bg)', border: '2px solid var(--border)', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: '6px 6px 0px 0px var(--shadow)', padding: '32px', maxWidth: '440px', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onCancel} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--subtle)' }}>
          <X size={20} strokeWidth={2.5} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', background: confirmDanger ? 'rgba(204,51,51,0.12)' : 'var(--yellow)', border: `2px solid ${confirmDanger ? 'var(--danger)' : 'var(--accent)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `2px 2px 0px 0px ${confirmDanger ? 'var(--danger)' : 'var(--accent)'}` }}>
            <AlertTriangle size={22} strokeWidth={2} color={confirmDanger ? 'var(--danger)' : 'var(--accent)'} />
          </div>
          <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.5rem', margin: 0, color: 'var(--fg)' }}>{title}</h3>
        </div>
        <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', color: 'var(--subtle)', marginBottom: '24px', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onConfirm} className={confirmDanger ? 'btn-danger' : 'btn-primary'} style={{ flex: 1 }}>{confirmLabel}</button>
          <button onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>{cancelLabel}</button>
        </div>
      </div>
    </div>
  );
}