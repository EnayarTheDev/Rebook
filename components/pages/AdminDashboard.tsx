'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Settings, Crown, Shield, User, Ban, UserCheck, UserX, ShieldCheck, ShieldOff, Trash2, Check, X, AlertTriangle, BookOpen, Users, ArrowLeftRight, RotateCcw } from 'lucide-react';
import Toast, { useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

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

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmDanger: boolean;
  onConfirm: () => void;
}

export default function AdminDashboard({ userRole, user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('approvals');
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmer',
    confirmDanger: false,
    onConfirm: () => {},
  });

  const isOwner = userRole === 'owner';
  const isAdminOrOwner = userRole === 'admin' || userRole === 'owner';

  const openModal = (title: string, message: string, confirmLabel: string, confirmDanger: boolean, onConfirm: () => void) => {
    setModal({ isOpen: true, title, message, confirmLabel, confirmDanger, onConfirm });
  };

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    const supabase = createClient();
    setIsLoading(true);
    try {
      const { data: approvalsData } = await supabase.from('approval_requests').select('*').order('created_at', { ascending: false });
      setApprovals(approvalsData || []);
      const { data: booksData } = await supabase.from('books').select('*').order('created_at', { ascending: false });
      if (booksData && booksData.length > 0) {
        const userIds = [...new Set(booksData.map((b: any) => b.user_id))];
        const { data: profilesForBooks } = await supabase.from('profiles').select('id, email').in('id', userIds);
        const profileMap: Record<string, any> = {};
        profilesForBooks?.forEach((p: any) => { profileMap[p.id] = p; });
        setBooks(booksData.map((b: any) => ({ ...b, owner_email: profileMap[b.user_id]?.email || 'Inconnu' })));
      } else { setBooks([]); }
      const usersRes = await fetch('/api/admin/get-users');
      if (usersRes.ok) {
        const usersJson = await usersRes.json();
        setUsers((usersJson.users || []).map((u: any) => ({ ...u, is_banned: u.is_banned ?? false, is_revoked: u.is_revoked ?? false })));
      } else { setUsers([]); }
    } catch (err) { console.error('Erreur chargement données admin:', err); }
    finally { setIsLoading(false); }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    closeModal();
    try {
      const res = await fetch('/api/admin/approve-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approvalId: id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'approved' } : a));
      addToast('Utilisateur approuvé avec succès', 'success');
    } catch (err: any) { addToast('Erreur : ' + err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    closeModal();
    const supabase = createClient();
    try {
      await supabase.from('approval_requests').update({ status: 'rejected' }).eq('id', id);
      setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
      addToast('Demande rejetée', 'info');
    } catch (err: any) { addToast('Erreur : ' + err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleRemoveBook = async (bookId: string) => {
    setActionLoading(bookId);
    closeModal();
    const supabase = createClient();
    try {
      const { error } = await supabase.from('books').delete().eq('id', bookId);
      if (error) throw error;
      setBooks(books.filter(b => b.id !== bookId));
      addToast('Livre supprimé', 'success');
    } catch (err: any) { addToast('Erreur : ' + err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleRestoreBook = async (bookId: string) => {
    setActionLoading(bookId + '-restore');
    const supabase = createClient();
    try {
      const { error } = await supabase.from('books').update({ is_available: true }).eq('id', bookId);
      if (error) throw error;
      setBooks(books.map(b => b.id === bookId ? { ...b, is_available: true } : b));
      addToast('Livre restauré avec succès', 'success');
    } catch (err: any) { addToast('Erreur : ' + err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleBanUser = async (userId: string, currentlyBanned: boolean) => {
    setActionLoading(userId);
    closeModal();
    try {
      const res = await fetch('/api/admin/ban-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, isBanned: !currentlyBanned }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(users.map(u => u.id === userId ? { ...u, is_banned: !currentlyBanned } : u));
      addToast(currentlyBanned ? 'Utilisateur débanni' : 'Utilisateur banni', 'success');
    } catch (err: any) { addToast('Erreur : ' + err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleKickUser = async (userId: string, userEmail: string) => {
    setActionLoading(userId);
    closeModal();
    try {
      const res = await fetch('/api/admin/kick-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      addToast(`Accès de ${userEmail} révoqué`, 'success');
      await loadAllData();
    } catch (err: any) { addToast('Erreur : ' + err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleSetRole = async (userId: string, newRole: 'admin' | 'user') => {
    if (!isOwner) return;
    setActionLoading(userId);
    closeModal();
    try {
      const res = await fetch('/api/admin/set-role', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role: newRole }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      addToast(newRole === 'admin' ? 'Utilisateur promu admin' : 'Rôle admin retiré', 'success');
    } catch (err: any) { addToast('Erreur : ' + err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const roleBadge = (role: string) => {
    const configs: Record<string, { bg: string; color: string; border: string; icon: React.ReactNode; label: string }> = {
      owner: { bg: '#f0faf4', color: '#1a6b3a', border: '#1a6b3a', icon: <Crown size={12} strokeWidth={2.5} />, label: 'Propriétaire' },
      admin: { bg: '#d4edda', color: '#2d8a4e', border: '#2d8a4e', icon: <Shield size={12} strokeWidth={2.5} />, label: 'Admin' },
      user: { bg: '#e5e0d8', color: '#2d2d2d', border: '#2d2d2d', icon: <User size={12} strokeWidth={2.5} />, label: 'Utilisateur' },
    };
    const c = configs[role] || configs.user;
    return (
      <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', padding: '2px 10px', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', background: c.bg, color: c.color, border: `1px solid ${c.border}`, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {c.icon} {c.label}
      </span>
    );
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'approvals', label: `Demandes (${approvals.length})` },
    { key: 'books', label: `Livres (${books.length})` },
    { key: 'users', label: `Utilisateurs (${users.length})` },
  ];

  const totalBooks = books.length;
  const swappedBooks = books.filter(b => !b.is_available).length;
  const totalUsers = users.length;
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;

  if (isLoading) return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: '100px', background: 'linear-gradient(90deg, #e5e0d8 25%, #f0ece4 50%, #e5e0d8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px' }} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        confirmDanger={modal.confirmDanger}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={32} strokeWidth={2} color="#2d8a4e" />
          <div>
            <h1 style={{ fontFamily: 'Kalam, cursive', fontSize: '2.5rem', margin: 0, transform: 'rotate(-1deg)', display: 'inline-block' }}>Dashboard Admin</h1>
            <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555', fontSize: '1rem', margin: 0 }}>{isOwner ? 'Propriétaire — accès complet' : 'Admin — gestion des utilisateurs et contenus'}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { icon: <BookOpen size={24} strokeWidth={2} color="#2d8a4e" />, label: 'Total livres', value: totalBooks, bg: '#f0faf4' },
            { icon: <ArrowLeftRight size={24} strokeWidth={2} color="#2d5da1" />, label: 'Échanges faits', value: swappedBooks, bg: '#e8f0fe' },
            { icon: <Users size={24} strokeWidth={2} color="#2d8a4e" />, label: 'Utilisateurs', value: totalUsers, bg: '#f0faf4' },
            { icon: <AlertTriangle size={24} strokeWidth={2} color="#cc3333" />, label: 'En attente', value: pendingApprovals, bg: '#fde8e8' },
          ].map((stat, i) => (
            <div key={i} style={{ background: stat.bg, border: '2px solid #2d2d2d', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: '4px 4px 0px 0px #2d2d2d', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: '#ffffff', border: '2px solid #2d2d2d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '2px 2px 0px 0px #2d2d2d' }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', margin: 0, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: '#555', margin: 0 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', padding: '8px 20px', background: activeTab === tab.key ? '#2d2d2d' : '#ffffff', color: activeTab === tab.key ? '#ffffff' : '#2d2d2d', border: '2px solid #2d2d2d', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: activeTab === tab.key ? '2px 2px 0px 0px #2d8a4e' : '4px 4px 0px 0px #2d2d2d', cursor: 'pointer', transition: 'all 0.1s ease' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* APPROVALS */}
        {activeTab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {approvals.length === 0 ? (
              <div className="card-yellow" style={{ textAlign: 'center', padding: '48px' }}><p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.3rem' }}>Aucune demande</p></div>
            ) : approvals.map((req, i) => (
              <div key={req.id} style={{ background: '#ffffff', border: '2px solid #2d2d2d', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: '4px 4px 0px 0px #2d2d2d', padding: '20px 24px', transform: `rotate(${i % 2 === 0 ? '-0.3deg' : '0.3deg'})` }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }} className="admin-grid">
                  <div>
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#888', marginBottom: '2px' }}>NOM</p>
                    <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', margin: 0 }}>{req.first_name} {req.last_name}</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#888', marginBottom: '2px' }}>EMAIL</p>
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', margin: 0 }}>{req.email}</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#888', marginBottom: '2px' }}>STATUT</p>
                    <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', padding: '3px 12px', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', background: req.status === 'pending' ? '#f0faf4' : req.status === 'approved' ? '#d4edda' : '#fde8e8', border: '1px solid #2d2d2d' }}>
                      {req.status === 'pending' ? 'En attente' : req.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </span>
                  </div>
                </div>
                {req.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-primary" onClick={() => openModal('Approuver la demande', `Approuver l'accès pour ${req.first_name} ${req.last_name} (${req.email}) ?`, 'Approuver', false, () => handleApprove(req.id))} disabled={actionLoading === req.id} style={{ flex: 1, opacity: actionLoading === req.id ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Check size={16} strokeWidth={2.5} /> {actionLoading === req.id ? '...' : 'Approuver'}
                    </button>
                    <button className="btn-danger" onClick={() => openModal('Rejeter la demande', `Rejeter la demande de ${req.first_name} ${req.last_name} ?`, 'Rejeter', true, () => handleReject(req.id))} disabled={actionLoading === req.id} style={{ flex: 1, opacity: actionLoading === req.id ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <X size={16} strokeWidth={2.5} /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BOOKS */}
        {activeTab === 'books' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {books.length === 0 ? (
              <div className="card-yellow" style={{ textAlign: 'center', padding: '48px' }}><p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.3rem' }}>Aucun livre listé</p></div>
            ) : books.map((book, i) => (
              <div key={book.id} style={{ background: '#ffffff', border: '2px solid #2d2d2d', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: '4px 4px 0px 0px #2d2d2d', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', transform: `rotate(${i % 2 === 0 ? '-0.2deg' : '0.2deg'})`, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.2rem', marginBottom: '4px' }}>{book.title}</h3>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', color: '#555', margin: 0 }}>Propriétaire : {book.owner_email}</p>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#888', margin: 0 }}>
                    Ajouté le {new Date(book.created_at).toLocaleDateString('fr-FR')} —{' '}
                    <span style={{ color: book.is_available ? '#2d8a4e' : '#cc3333', fontWeight: 700 }}>
                      {book.is_available ? 'Disponible' : 'Échangé'}
                    </span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {!book.is_available && (
                    <button
                      onClick={() => handleRestoreBook(book.id)}
                      disabled={actionLoading === book.id + '-restore'}
                      style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', padding: '8px 16px', background: '#f0faf4', color: '#2d8a4e', border: '2px solid #2d8a4e', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '3px 3px 0px 0px #2d8a4e', cursor: 'pointer', transition: 'all 0.1s ease', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', opacity: actionLoading === book.id + '-restore' ? 0.6 : 1 }}
                    >
                      <RotateCcw size={14} strokeWidth={2.5} /> Restaurer
                    </button>
                  )}
                  <button className="btn-danger" onClick={() => openModal('Supprimer le livre', `Supprimer "${book.title}" définitivement ?`, 'Supprimer', true, () => handleRemoveBook(book.id))} disabled={actionLoading === book.id} style={{ fontSize: '0.9rem', padding: '8px 16px', whiteSpace: 'nowrap', opacity: actionLoading === book.id ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trash2 size={14} strokeWidth={2.5} /> {actionLoading === book.id ? '...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {users.length === 0 ? (
              <div className="card-yellow" style={{ textAlign: 'center', padding: '48px' }}><p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.3rem' }}>Vous êtes le seul utilisateur</p></div>
            ) : users.map((u, i) => (
              <div key={u.id} style={{ background: u.is_banned ? '#fff0f0' : '#ffffff', border: `2px solid ${u.is_banned ? '#cc3333' : '#2d2d2d'}`, borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: `4px 4px 0px 0px ${u.is_banned ? '#cc3333' : '#2d2d2d'}`, padding: '20px 24px', transform: `rotate(${i % 2 === 0 ? '-0.2deg' : '0.2deg'})` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', margin: 0 }}>{(u.first_name || u.last_name) ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : u.email}</p>
                      {roleBadge(u.role)}
                      {u.is_banned && (
                        <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', background: '#fde8e8', color: '#cc3333', border: '1px solid #cc3333', padding: '2px 8px', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Ban size={11} strokeWidth={2.5} /> Banni
                        </span>
                      )}
                      {u.is_revoked && !u.is_banned && (
                        <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', background: '#fff3cd', color: '#856404', border: '1px solid #856404', padding: '2px 8px', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={11} strokeWidth={2.5} /> Révoqué
                        </span>
                      )}
                    </div>
                    {(u.first_name || u.last_name) && <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', color: '#555', margin: '0 0 2px' }}>{u.email}</p>}
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#888', margin: 0 }}>Membre depuis {new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {isAdminOrOwner && u.role !== 'owner' && (
                      <button className="btn-secondary" onClick={() => openModal('Expulser l\'utilisateur', `Révoquer l'accès de ${u.email} ? Il sera déconnecté.`, 'Expulser', true, () => handleKickUser(u.id, u.email))} disabled={actionLoading === u.id} style={{ fontSize: '0.85rem', padding: '6px 12px', opacity: actionLoading === u.id ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserX size={14} strokeWidth={2.5} /> Expulser
                      </button>
                    )}
                    {isAdminOrOwner && u.role !== 'owner' && (
                      <button onClick={() => openModal(u.is_banned ? 'Débannir l\'utilisateur' : 'Bannir l\'utilisateur', `${u.is_banned ? 'Débannir' : 'Bannir'} ${u.email} ?`, u.is_banned ? 'Débannir' : 'Bannir', !u.is_banned, () => handleBanUser(u.id, u.is_banned ?? false))} disabled={actionLoading === u.id} style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', padding: '6px 12px', background: u.is_banned ? '#d4edda' : '#fde8e8', color: u.is_banned ? '#1a6b3a' : '#cc3333', border: `2px solid ${u.is_banned ? '#1a6b3a' : '#cc3333'}`, borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: `3px 3px 0px 0px ${u.is_banned ? '#1a6b3a' : '#cc3333'}`, cursor: 'pointer', transition: 'all 0.1s ease', opacity: actionLoading === u.id ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {u.is_banned ? <><UserCheck size={14} strokeWidth={2.5} /> Débannir</> : <><Ban size={14} strokeWidth={2.5} /> Bannir</>}
                      </button>
                    )}
                    {isOwner && u.role === 'user' && (
                      <button className="btn-primary" onClick={() => openModal('Rendre admin', `Promouvoir ${u.email} en admin ?`, 'Rendre admin', false, () => handleSetRole(u.id, 'admin'))} disabled={actionLoading === u.id} style={{ fontSize: '0.85rem', padding: '6px 12px', opacity: actionLoading === u.id ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={14} strokeWidth={2.5} /> Rendre admin
                      </button>
                    )}
                    {isOwner && u.role === 'admin' && (
                      <button className="btn-secondary" onClick={() => openModal('Retirer admin', `Retirer le rôle admin de ${u.email} ?`, 'Retirer', true, () => handleSetRole(u.id, 'user'))} disabled={actionLoading === u.id} style={{ fontSize: '0.85rem', padding: '6px 12px', opacity: actionLoading === u.id ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldOff size={14} strokeWidth={2.5} /> Retirer admin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}