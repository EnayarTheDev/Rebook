'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Check, X, PenLine, ArrowLeftRight, Trash2, Eye, EyeOff } from 'lucide-react';
import Toast, { useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

interface Book {
  id: string;
  title: string;
  subject: string;
  condition: string;
  is_available: boolean;
  cover_url: string | null;
  created_at: string;
}

interface SwapOffer {
  id: string;
  requested_book_title: string;
  requester_name: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

interface ProfilePageProps {
  user: any;
  setCurrentPage: (page: string) => void;
}

export default function ProfilePage({ user, setCurrentPage }: ProfilePageProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [swaps, setSwaps] = useState<SwapOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'books' | 'swaps' | 'settings'>('books');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', confirmLabel: 'Confirmer', confirmDanger: false, onConfirm: () => {} });

  const openModal = (title: string, message: string, confirmLabel: string, confirmDanger: boolean, onConfirm: () => void) => {
    setModal({ isOpen: true, title, message, confirmLabel, confirmDanger, onConfirm });
  };
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      setIsLoading(true);
      try {
        const [booksRes, swapsRes, profileRes] = await Promise.all([
          supabase.from('books').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('swap_offers').select('*').eq('book_owner_id', user.id).order('created_at', { ascending: false }),
          supabase.from('profiles').select('show_email').eq('id', user.id).single(),
        ]);
        setBooks(booksRes.data || []);
        setSwaps(swapsRes.data || []);
        setShowEmail(profileRes.data?.show_email ?? false);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    load();
  }, [user.id]);

  const handleToggleEmail = async () => {
    setSavingEmail(true);
    const supabase = createClient();
    try {
      const newVal = !showEmail;
      const { error } = await supabase
        .from('profiles')
        .update({ show_email: newVal })
        .eq('id', user.id);
      if (error) throw error;
      setShowEmail(newVal);
      addToast(newVal ? 'Email visible sur vos livres' : 'Email masqué sur vos livres', 'success');
    } catch (err: any) {
      addToast('Erreur : ' + err.message, 'error');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
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

  const conditionLabel: Record<string, string> = { excellent: 'Excellent', good: 'Bon', fair: 'Correct' };

  if (isLoading) return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: '80px', background: 'linear-gradient(90deg, #e5e0d8 25%, #f0ece4 50%, #e5e0d8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', marginBottom: '16px' }} />
      ))}
    </div>
  );

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal isOpen={modal.isOpen} title={modal.title} message={modal.message} confirmLabel={modal.confirmLabel} confirmDanger={modal.confirmDanger} onConfirm={modal.onConfirm} onCancel={closeModal} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Profile header */}
        <div className="card" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '64px', height: '64px', background: '#f0faf4', border: '2px solid #2d8a4e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '3px 3px 0px 0px #2d8a4e' }}>
            <span style={{ fontFamily: 'Kalam, cursive', fontSize: '1.8rem', color: '#2d8a4e' }}>
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', margin: 0 }}>
              {user.user_metadata?.first_name || user.email?.split('@')[0]}
            </h1>
            <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555', margin: 0 }}>{user.email}</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', color: '#2d8a4e' }}>
                <strong>{books.length}</strong> livre{books.length > 1 ? 's' : ''} proposé{books.length > 1 ? 's' : ''}
              </span>
              <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', color: '#2d8a4e' }}>
                <strong>{swaps.filter(s => s.status === 'accepted').length}</strong> échange{swaps.filter(s => s.status === 'accepted').length > 1 ? 's' : ''} réalisé{swaps.filter(s => s.status === 'accepted').length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { key: 'books', label: `Mes livres (${books.length})` },
            { key: 'swaps', label: `Échanges reçus (${swaps.length})` },
            { key: 'settings', label: 'Paramètres' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', padding: '8px 20px', background: activeTab === tab.key ? '#2d2d2d' : '#ffffff', color: activeTab === tab.key ? '#ffffff' : '#2d2d2d', border: '2px solid #2d2d2d', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: activeTab === tab.key ? '2px 2px 0px 0px #2d8a4e' : '4px 4px 0px 0px #2d2d2d', cursor: 'pointer', transition: 'all 0.1s ease' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Books tab */}
        {activeTab === 'books' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button className="btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setCurrentPage('offer')}>
              <PenLine size={16} strokeWidth={2.5} /> Proposer un nouveau livre
            </button>
            {books.length === 0 ? (
              <div className="card-yellow" style={{ textAlign: 'center', padding: '48px' }}>
                <BookOpen size={48} strokeWidth={1.5} color="#2d8a4e" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.3rem', marginBottom: '8px' }}>Vous n'avez pas encore de livres</p>
                <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555' }}>Proposez votre premier livre pour commencer !</p>
              </div>
            ) : books.map((book, i) => (
              <div key={book.id} style={{ background: '#ffffff', border: '2px solid #2d2d2d', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: '4px 4px 0px 0px #2d2d2d', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', transform: `rotate(${i % 2 === 0 ? '-0.2deg' : '0.2deg'})`, flexWrap: 'wrap' }}>
                <div style={{ width: '52px', height: '52px', background: '#f0faf4', border: '2px solid #2d2d2d', borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px', overflow: 'hidden', flexShrink: 0 }}>
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} strokeWidth={2} color="#2d8a4e" />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', margin: 0, marginBottom: '4px' }}>{book.title}</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', background: '#f0faf4', border: '1px solid #2d2d2d', borderRadius: '4px', padding: '1px 8px' }}>{book.subject}</span>
                    <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', background: '#e5e0d8', border: '1px solid #2d2d2d', borderRadius: '4px', padding: '1px 8px' }}>{conditionLabel[book.condition] || book.condition}</span>
                    <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: book.is_available ? '#2d8a4e' : '#cc3333' }}>
                      {book.is_available ? <><Check size={12} strokeWidth={2.5} /> Disponible</> : <><X size={12} strokeWidth={2.5} /> Échangé</>}
                    </span>
                  </div>
                </div>
                <button className="btn-danger" onClick={() => openModal('Supprimer le livre', `Supprimer "${book.title}" définitivement ?`, 'Supprimer', true, () => handleDeleteBook(book.id))} disabled={actionLoading === book.id} style={{ fontSize: '0.85rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: actionLoading === book.id ? 0.6 : 1 }}>
                  <Trash2 size={14} strokeWidth={2.5} /> Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Swaps tab */}
        {activeTab === 'swaps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {swaps.length === 0 ? (
              <div className="card-yellow" style={{ textAlign: 'center', padding: '48px' }}>
                <ArrowLeftRight size={48} strokeWidth={1.5} color="#2d8a4e" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.3rem', marginBottom: '8px' }}>Aucun échange reçu</p>
                <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555' }}>Les demandes d'échange pour vos livres apparaîtront ici.</p>
              </div>
            ) : swaps.map((swap, i) => (
              <div key={swap.id} style={{ background: '#ffffff', border: '2px solid #2d2d2d', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: '4px 4px 0px 0px #2d2d2d', padding: '16px 20px', transform: `rotate(${i % 2 === 0 ? '-0.2deg' : '0.2deg'})` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', margin: 0, marginBottom: '4px' }}>{swap.requester_name} — <span style={{ color: '#2d8a4e' }}>{swap.requested_book_title}</span></p>
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: '#888', margin: 0 }}>{new Date(swap.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span style={{
                    fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', padding: '4px 12px',
                    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                    background: swap.status === 'accepted' ? '#d4edda' : swap.status === 'declined' ? '#e5e0d8' : '#f0faf4',
                    color: swap.status === 'accepted' ? '#1a6b3a' : swap.status === 'declined' ? '#555' : '#2d2d2d',
                    border: '1px solid #2d2d2d',
                  }}>
                    {swap.status === 'accepted' ? 'Accepté' : swap.status === 'declined' ? 'Refusé' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ position: 'relative' }}>
              <div className="tape" />
              <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.5rem', marginBottom: '8px', marginTop: '8px' }}>Confidentialité</h3>
              <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555', marginBottom: '24px', fontSize: '0.95rem' }}>
                Contrôlez les informations visibles par les autres utilisateurs sur vos livres.
              </p>

              {/* Email visibility toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '16px', background: '#fdfbf7', border: '2px solid #e5e0d8', borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {showEmail
                      ? <Eye size={18} strokeWidth={2} color="#2d8a4e" />
                      : <EyeOff size={18} strokeWidth={2} color="#888" />
                    }
                    <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', margin: 0 }}>Afficher mon email</p>
                    <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', background: showEmail ? '#d4edda' : '#e5e0d8', color: showEmail ? '#1a6b3a' : '#555', border: `1px solid ${showEmail ? '#1a6b3a' : '#aaa'}` }}>
                      {showEmail ? 'Activé' : 'Désactivé'}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', color: '#555', margin: 0 }}>
                    {showEmail
                      ? 'Votre email est visible par les utilisateurs connectés sur vos fiches de livres.'
                      : 'Votre email est masqué. Les autres utilisateurs ne peuvent pas vous contacter directement.'
                    }
                  </p>
                </div>
                <button
                  onClick={handleToggleEmail}
                  disabled={savingEmail}
                  style={{
                    fontFamily: 'Patrick Hand, cursive',
                    fontSize: '0.95rem',
                    padding: '8px 20px',
                    background: showEmail ? '#fde8e8' : '#f0faf4',
                    color: showEmail ? '#cc3333' : '#2d8a4e',
                    border: `2px solid ${showEmail ? '#cc3333' : '#2d8a4e'}`,
                    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                    boxShadow: `3px 3px 0px 0px ${showEmail ? '#cc3333' : '#2d8a4e'}`,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    opacity: savingEmail ? 0.6 : 1,
                    flexShrink: 0,
                  }}
                >
                  {savingEmail ? '...' : showEmail ? 'Masquer' : 'Afficher'}
                </button>
              </div>

              <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f0faf4', border: '1px dashed #2d8a4e', borderRadius: '6px' }}>
                <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: '#2d8a4e', margin: 0 }}>
                   Même si votre email est masqué, le propriétaire d'un livre peut toujours vous contacter via le système de notification interne lors d'un échange.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}