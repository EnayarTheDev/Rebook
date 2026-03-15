'use client';

import { useState } from 'react';
import { UserPlus, Check, AlertCircle, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';

type Step = 'form' | 'verify' | 'success';

export default function RequestApprovalPage() {
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    grade: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Save formData to sessionStorage in case of page reload
      sessionStorage.setItem('rebook_pending_form', JSON.stringify(formData));
      setStep('verify');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi du code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Recover formData from sessionStorage if state was lost
    let currentFormData = formData;
    const saved = sessionStorage.getItem('rebook_pending_form');
    if (saved) {
      currentFormData = JSON.parse(saved);
    }

    try {
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentFormData.email, token: otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.message);

      const res = await fetch('/api/auth/request-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentFormData.email,
          firstName: currentFormData.firstName,
          lastName: currentFormData.lastName,
          grade: currentFormData.grade,
          password: currentFormData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      sessionStorage.removeItem('rebook_pending_form');
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const errorBox = error && (
    <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#fde8e8', border: '2px solid #cc3333', borderRadius: '6px 3px 8px 3px / 3px 8px 3px 6px', boxShadow: '2px 2px 0px 0px #cc3333', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <AlertCircle size={16} strokeWidth={2.5} color="#cc3333" />
      <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#cc3333', margin: 0 }}>{error}</p>
    </div>
  );

  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png" alt="ReBook" style={{ height: '48px', width: 'auto' }} />
          </div>
          <div className="card-yellow" style={{ position: 'relative', textAlign: 'center', padding: '48px 32px' }}>
            <div className="tack" />
            <div style={{ width: '64px', height: '64px', background: '#d4edda', border: '2px solid #2d8a4e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '3px 3px 0px 0px #2d8a4e' }}>
              <Check size={32} strokeWidth={2.5} color="#2d8a4e" />
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Demande envoyée !</h2>
            <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.1rem', color: '#555', marginBottom: '8px' }}>
              Votre email a été vérifié.
            </p>
            <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', color: '#777', marginBottom: '28px' }}>
              Un administrateur va examiner votre demande. Vous recevrez un email dès que c'est approuvé !
            </p>
            <a href="/auth/login" style={{ fontFamily: 'Patrick Hand, cursive', color: '#2d8a4e', textDecoration: 'underline wavy #2d8a4e 2px' }}>← Retour à la connexion</a>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png" alt="ReBook" style={{ height: '48px', width: 'auto' }} />
          </div>
          <div className="card" style={{ position: 'relative' }}>
            <div className="tape" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', marginTop: '8px' }}>
              <ShieldCheck size={24} strokeWidth={2} color="#2d8a4e" />
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Vérifiez votre email</h2>
            </div>
            <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555', marginBottom: '24px' }}>
              Un code a été envoyé à <strong>{formData.email || JSON.parse(sessionStorage.getItem('rebook_pending_form') || '{}').email}</strong>. Entrez-le ci-dessous pour confirmer.
            </p>
            {errorBox}
            <form onSubmit={handleVerifyAndSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>Code de vérification</label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-wobbly"
                  placeholder="········"
                  style={{ fontSize: '1.5rem', letterSpacing: '0.3em', textAlign: 'center' }}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ fontSize: '1.1rem', padding: '12px', marginTop: '8px', opacity: isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShieldCheck size={18} strokeWidth={2.5} />
                {isLoading ? 'Vérification...' : 'Confirmer et envoyer la demande'}
              </button>
            </form>
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #2d2d2d', textAlign: 'center' }}>
              <button
                onClick={() => { setStep('form'); setError(''); setOtp(''); sessionStorage.removeItem('rebook_pending_form'); }}
                style={{ fontFamily: 'Patrick Hand, cursive', color: '#2d8a4e', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline wavy #2d8a4e 2px' }}
              >
                ← Modifier mes informations
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png" alt="ReBook" style={{ height: '48px', width: 'auto' }} />
        </div>
        <div className="card" style={{ position: 'relative' }}>
          <div className="tape" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', marginTop: '8px' }}>
            <UserPlus size={24} strokeWidth={2} color="#2d8a4e" />
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Demander l'accès</h2>
          </div>
          <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555', marginBottom: '24px' }}>Remplissez ce formulaire et un admin vous approuvera bientôt !</p>
          {errorBox}
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <Mail size={18} strokeWidth={2.5} />
              {isLoading ? 'Envoi du code...' : 'Vérifier mon email →'}
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