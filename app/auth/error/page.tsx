'use client';

import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#fdfbf7', backgroundImage: 'radial-gradient(#e5e0d8 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '48px', position: 'relative' }}>
        <div className="tack" style={{ background: '#cc3333' }} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', marginTop: '8px' }}>
          <img
            src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png"
            alt="ReBook"
            style={{ height: '40px', width: 'auto' }}
          />
        </div>
        <div style={{ width: '64px', height: '64px', background: '#fde8e8', border: '2px solid #cc3333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '3px 3px 0px 0px #cc3333' }}>
          <AlertCircle size={32} strokeWidth={2} color="#cc3333" />
        </div>
        <h2 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', color: '#cc3333', marginBottom: '12px' }}>Erreur d'authentification</h2>
        <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.1rem', color: '#555', marginBottom: '24px' }}>Quelque chose s'est mal passé lors de la connexion. Réessayez !</p>
        <a href="/auth/login" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '12px 24px' }}>
          ← Retour à la connexion
        </a>
      </div>
    </div>
  );
}