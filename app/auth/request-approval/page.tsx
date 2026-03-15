'use client';

import { useState } from 'react';
import { UserPlus, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function RequestApprovalPage() {
  const [formData, setFormData] = useState({ email: '', firstName: '', lastName: '', grade: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/request-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          grade: formData.grade,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#fdfbf7', backgroundImage: 'radial-gradient(#e5e0d8 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        <div className="card-yellow" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '48px', position: 'relative' }}>
          <div className="tack" />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', marginTop: '8px' }}>
            <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png" alt="ReBook" style={{ height: '40px', width: 'auto' }} />
          </div>
          <div style={{ width: '64px', height: '64px', background: '#d4edda', border: '2px solid #2d8a4e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '3px 3px 0px 0px #2d8a4e' }}>
            <Check size={32} strokeWidth={2.5} color="#2d8a4e" />
          </div>
          <h2 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', marginBottom: '12px' }}>Demande envoyée !</h2>
          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.1rem', color: '#555', marginBottom: '24px' }}>Un administrateur va examiner votre demande. Vous recevrez un accès bientôt !</p>
          <a href="/auth/login" style={{ fontFamily: 'Patrick Hand, cursive', color: '#2d8a4e', textDecoration: 'underline wavy #2d8a4e 2px' }}>← Retour à la connexion</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#fdfbf7', backgroundImage: 'radial-gradient(#e5e0d8 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png" alt="ReBook" style={{ height: '48px', width: 'auto' }} />
        </div>
        <div className="card" style={{ position: 'relative' }}>
          <div className="tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', marginTop: '8px' }}>
            <UserPlus size={24} strokeWidth={2} color="#2d8a4e" />
            <h2 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.8rem', margin: 0 }}>Demander l'accès</h2>
          </div>
          <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555', marginBottom: '24px' }}>Remplissez ce formulaire et un admin vous approuvera bientôt !</p>
          {error && (
            <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#fde8e8', border: '2px solid #cc3333', borderRadius: '6px 3px 8px 3px / 3px 8px 3px 6px', boxShadow: '2px 2px 0px 0px #cc3333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} strokeWidth={2.5} color="#cc3333" />
              <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#cc3333', margin: 0 }}>{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>Prénom *</label>
                <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="input-wobbly" placeholder="Prénom" />
              </div>
              <div>
                <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>Nom *</label>
                <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="input-wobbly" placeholder="Nom" />
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>Email *</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-wobbly" placeholder="ton@email.com" />
            </div>
            <div>
              <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>Classe *</label>
              <input type="text" required value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} className="input-wobbly" placeholder="ex: Terminale B" />
            </div>
            <div>
              <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>Mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="input-wobbly" placeholder="Au moins 6 caractères" style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>Confirmer le mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} required value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} className="input-wobbly" placeholder="Répétez votre mot de passe" style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}>
                  {showConfirm ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary" style={{ fontSize: '1.1rem', padding: '12px', marginTop: '8px', opacity: isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <UserPlus size={18} strokeWidth={2.5} />
              {isLoading ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </form>
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #2d2d2d', textAlign: 'center' }}>
            <a href="/auth/login" style={{ fontFamily: 'Patrick Hand, cursive', color: '#2d8a4e', textDecoration: 'underline wavy #2d8a4e 2px' }}>← Déjà un compte ? Se connecter</a>
          </div>
        </div>
      </div>
    </div>
  );
}