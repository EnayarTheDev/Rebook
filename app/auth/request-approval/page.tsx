'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RequestApprovalPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: approvalError } = await supabase.from('approval_requests').insert([{
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        status: 'pending',
      }]);

      if (approvalError) {
        if (approvalError.code === '23505') {
          setError('Une demande avec cet email existe déjà. Si vous avez déjà été approuvé, connectez-vous directement.');
        } else {
          setError(approvalError.message || 'Une erreur est survenue. Veuillez réessayer.');
        }
        return;
      }
      setSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Demande envoyée !</h1>
          <p className="text-gray-600 mb-6">Votre demande a été soumise avec succès. Une fois approuvé par un administrateur, vous pourrez vous connecter directement avec votre email et mot de passe.</p>
          <p className="text-sm text-gray-500 mb-6">Ce processus prend généralement 1 à 2 jours ouvrables.</p>
          <Link href="/auth/login" className="inline-block bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rejoindre Re:Book</h1>
        <p className="text-gray-600 mb-6">Demandez l'accès pour échanger des livres avec d'autres lecteurs</p>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
              <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" placeholder="Jean" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
              <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" placeholder="Dupont" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" placeholder="vous@email.com" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" placeholder="Au moins 6 caractères" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe *</label>
            <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" placeholder="Répétez votre mot de passe" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Envoi en cours...' : 'Demander l\'accès'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Déjà approuvé ?{' '}
          <Link href="/auth/login" className="text-green-600 hover:underline font-semibold">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}