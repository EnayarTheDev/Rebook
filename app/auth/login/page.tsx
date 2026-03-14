'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      const { data: profile } = await supabase.from('profiles').select('is_banned, role').eq('id', data.user.id).single();
      if (profile?.is_banned) { await supabase.auth.signOut(); throw new Error('Votre compte a été banni.'); }
      const { data: approval } = await supabase.from('approval_requests').select('status').eq('email', email).single();
      if (approval?.status === 'pending') { await supabase.auth.signOut(); throw new Error('Votre accès a été révoqué. Contactez un administrateur.'); }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#fdfbf7', backgroundImage: 'radial-gradient(#e5e0d8 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <img
            src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png"
            alt="ReBook"
            style={{ height: '48px', width: 'auto' }}
          />
        </div>
        <div className="card" style={{ position: 'relative' }}>
          <div className="tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', marginTop: '8px' }}>
            <LogIn size={24} strokeWidth={2} color="#2d8a4e" />
            <h2 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.8rem', margin: 0 }}>Connexion</h2>
          </div>
          {error && (
            <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#fde8e8', border: '2px solid #cc3333', borderRadius: '6px 3px 8px 3px / 3px 8px 3px 6px', boxShadow: '2px 2px 0px 0px #cc3333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} strokeWidth={2.5} color="#cc3333" />
              <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#cc3333', margin: 0 }}>{error}</p>
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-wobbly" placeholder="ton@email.com" />
            </div>
            <div>
              <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>Mot de passe</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input-wobbly" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary" style={{ fontSize: '1.1rem', padding: '12px', marginTop: '8px', opacity: isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <LogIn size={18} strokeWidth={2.5} />
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #2d2d2d', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555', marginBottom: '8px' }}>Pas encore de compte ?</p>
            <a href="/auth/request-approval" style={{ fontFamily: 'Patrick Hand, cursive', color: '#2d8a4e', textDecoration: 'underline wavy #2d8a4e 2px' }}>Demander l'accès →</a>
          </div>
        </div>
      </div>
    </div>
  );
}