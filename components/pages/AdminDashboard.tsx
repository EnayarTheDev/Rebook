'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ApprovalRequest {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Book {
  id: string;
  title: string;
  user_id: string;
  owner_email: string;
  is_available: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_banned: boolean | null;
  is_revoked: boolean;
  created_at: string;
}

interface AdminDashboardProps {
  userRole: string | null;
  user: any;
}

type Tab = 'approvals' | 'books' | 'users';

export default function AdminDashboard({ userRole, user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('approvals');
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isOwner = userRole === 'owner';
  const isAdminOrOwner = userRole === 'admin' || userRole === 'owner';

  // Load ALL data once on mount so tab labels show correct counts immediately
  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    const supabase = createClient();
    setIsLoading(true);
    try {
      // Approvals
      const { data: approvalsData } = await supabase
        .from('approval_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setApprovals(approvalsData || []);

      // Books + owner emails
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (booksData && booksData.length > 0) {
        const userIds = [...new Set(booksData.map((b: any) => b.user_id))];
        const { data: profilesForBooks } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);
        const profileMap: Record<string, any> = {};
        profilesForBooks?.forEach((p: any) => { profileMap[p.id] = p; });
        setBooks(booksData.map((b: any) => ({
          ...b,
          owner_email: profileMap[b.user_id]?.email || 'Inconnu'
        })));
      } else {
        setBooks([]);
      }

      // Fetch users via API route (uses service role to bypass RLS)
      const usersRes = await fetch('/api/admin/get-users');
      if (usersRes.ok) {
        const usersJson = await usersRes.json();
        setUsers((usersJson.users || []).map((u: any) => ({
          ...u,
          is_banned: u.is_banned ?? false,
          is_revoked: u.is_revoked ?? false,
        })));
      } else {
        console.error('Erreur chargement utilisateurs');
        setUsers([]);
      }

    } catch (err) {
      console.error('Erreur chargement données admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── APPROVALS ──────────────────────────────────────────────────────────────

  const handleApprove = async (id: string, email: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    } catch (err) {
      alert('Erreur : ' + err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    const supabase = createClient();
    try {
      await supabase.from('approval_requests').update({ status: 'rejected' }).eq('id', id);
      setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    } catch (err) {
      alert('Erreur : ' + err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── BOOKS ──────────────────────────────────────────────────────────────────

  const handleRemoveBook = async (bookId: string) => {
    if (!confirm('Supprimer ce livre définitivement ?')) return;
    setActionLoading(bookId);
    const supabase = createClient();
    try {
      const { error } = await supabase.from('books').delete().eq('id', bookId);
      if (error) throw error;
      setBooks(books.filter(b => b.id !== bookId));
    } catch (err) {
      alert('Erreur : ' + err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── USERS ──────────────────────────────────────────────────────────────────

  const handleBanUser = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'débannir' : 'bannir';
    if (!confirm(`Voulez-vous ${action} cet utilisateur ?`)) return;
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBanned: !currentlyBanned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(users.map(u => u.id === userId ? { ...u, is_banned: !currentlyBanned } : u));
    } catch (err) {
      alert('Erreur : ' + err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleKickUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Révoquer l'accès de ${userEmail} ? Ils seront déconnectés et ne pourront plus se reconnecter jusqu'à approbation.`)) return;
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/kick-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(`Accès de ${userEmail} révoqué.`);
      await loadAllData();
    } catch (err) {
      alert('Erreur : ' + err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetRole = async (userId: string, newRole: 'admin' | 'user') => {
    if (!isOwner) return;
    const label = newRole === 'admin' ? 'promouvoir en admin' : 'rétrograder en utilisateur';
    if (!confirm(`Voulez-vous ${label} cet utilisateur ?`)) return;
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Erreur : ' + err);
    } finally {
      setActionLoading(null);
    }
  };

  const roleBadge = (role: string) => {
    if (role === 'owner') return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Propriétaire</span>;
    if (role === 'admin') return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Admin</span>;
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Utilisateur</span>;
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'approvals', label: `Demandes (${approvals.length})` },
    { key: 'books', label: `Livres (${books.length})` },
    { key: 'users', label: `Utilisateurs (${users.length})` },
  ];

  if (isLoading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Tableau de bord Admin</h1>
        <p className="text-sm text-gray-500">
          {isOwner ? 'Propriétaire — accès complet' : 'Admin — gestion des utilisateurs et contenus'}
        </p>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 font-semibold transition-colors ${
              activeTab === tab.key
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {approvals.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">Aucune demande</p>
            </div>
          ) : approvals.map(req => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Nom</p>
                  <p className="font-semibold text-gray-900">{req.first_name} {req.last_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{req.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                    : req.status === 'approved' ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status === 'pending' ? 'En attente' : req.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                  </span>
                </div>
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleApprove(req.id, req.email)}
                    disabled={actionLoading === req.id}
                    className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === req.id ? '...' : 'Approuver'}
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoading === req.id}
                    className="flex-1 bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* BOOKS */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          {books.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">Aucun livre listé</p>
            </div>
          ) : books.map(book => (
            <div key={book.id} className="bg-white border border-gray-200 rounded-xl p-6 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{book.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">Propriétaire : {book.owner_email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ajouté le {new Date(book.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => handleRemoveBook(book.id)}
                disabled={actionLoading === book.id}
                className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm"
              >
                {actionLoading === book.id ? '...' : 'Supprimer'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">Vous êtes le seul utilisateur pour l'instant.</p>
              <p className="text-xs text-gray-400 mt-1">Les autres utilisateurs apparaîtront ici après leur inscription.</p>
            </div>
          ) : users.map(u => (
            <div
              key={u.id}
              className={`bg-white border rounded-xl p-5 ${u.is_banned ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-gray-900">
                      {(u.first_name || u.last_name)
                        ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()
                        : u.email}
                    </p>
                    {roleBadge(u.role)}
                    {u.is_banned && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Banni</span>
                    )}
                    {u.is_revoked && !u.is_banned && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Révoqué</span>
                    )}
                  </div>
                  {(u.first_name || u.last_name) && (
                    <p className="text-sm text-gray-500">{u.email}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    Membre depuis {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {isAdminOrOwner && u.role !== 'owner' && (
                    <button
                      onClick={() => handleKickUser(u.id, u.email)}
                      disabled={actionLoading === u.id}
                      className="text-sm font-bold py-1.5 px-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      Expulser
                    </button>
                  )}
                  {isAdminOrOwner && u.role !== 'owner' && (
                    <button
                      onClick={() => handleBanUser(u.id, u.is_banned ?? false)}
                      disabled={actionLoading === u.id}
                      className={`text-sm font-bold py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50 ${
                        u.is_banned
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {u.is_banned ? 'Débannir' : 'Bannir'}
                    </button>
                  )}
                  {isOwner && u.role === 'user' && (
                    <button
                      onClick={() => handleSetRole(u.id, 'admin')}
                      disabled={actionLoading === u.id}
                      className="text-sm font-bold py-1.5 px-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      Rendre admin
                    </button>
                  )}
                  {isOwner && u.role === 'admin' && (
                    <button
                      onClick={() => handleSetRole(u.id, 'user')}
                      disabled={actionLoading === u.id}
                      className="text-sm font-bold py-1.5 px-3 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors disabled:opacity-50"
                    >
                      Retirer admin
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
