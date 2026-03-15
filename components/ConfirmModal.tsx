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

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmDanger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(45, 45, 45, 0.5)',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fdfbf7',
          border: '2px solid #2d2d2d',
          borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px',
          boxShadow: '6px 6px 0px 0px #2d2d2d',
          padding: '32px',
          maxWidth: '440px',
          width: '100%',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <X size={20} strokeWidth={2.5} color="#888" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', background: confirmDanger ? '#fde8e8' : '#f0faf4', border: `2px solid ${confirmDanger ? '#cc3333' : '#2d8a4e'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `2px 2px 0px 0px ${confirmDanger ? '#cc3333' : '#2d8a4e'}` }}>
            <AlertTriangle size={22} strokeWidth={2} color={confirmDanger ? '#cc3333' : '#2d8a4e'} />
          </div>
          <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.5rem', margin: 0 }}>{title}</h3>
        </div>

        <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', color: '#555', marginBottom: '24px', lineHeight: 1.5 }}>{message}</p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onConfirm}
            className={confirmDanger ? 'btn-danger' : 'btn-primary'}
            style={{ flex: 1 }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}