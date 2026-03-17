'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  useEffect(() => {
    const saved = localStorage.getItem('rebook-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg)', backgroundImage: 'radial-gradient(var(--dot-color) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '48px', position: 'relative' }}>
        <div className="tack" style={{ background: 'var(--danger)' }} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', marginTop: '8px' }}>
          <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png" alt="ReBook" style={{ height: '40px', width: 'auto' }} />
        </div>
        <div style={{ width: '64px', height: '64px', background: 'rgba(204,51,51,0.1)', border: '2px solid var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '3px 3px 0px 0px var(--danger)' }}>
          <AlertCircle size={32} strokeWidth={2} color="var(--danger)" />
        </div>
        <h2 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', color: 'var(--danger)', marginBottom: '12px' }}>Erreur d'authentification</h2>
        <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.1rem', color: 'var(--subtle)', marginBottom: '24px' }}>Quelque chose s'est mal passé lors de la connexion. Réessayez !</p>
        <a href="/auth/login" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '12px 24px' }}>
          ← Retour à la connexion
        </a>
      </div>
    </div>
  );
}