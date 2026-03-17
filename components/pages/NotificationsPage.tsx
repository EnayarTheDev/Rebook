'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Check, X, BookOpen, Inbox } from 'lucide-react';
import Toast, { useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

interface SwapOffer {
  id: string;
  book_id: string;
  requester_id: string;
  requester_name: string;
  requester_email: string;
  requested_book_title: string;
  offered_books: string[];
  offered_book_ids: string[];
  status: 'pending' | 'accepted' | 'declined';
  swap_code?: string;
  created_at: string;
}

interface NotificationsPageProps {
  user: any;
}

export default function NotificationsPage({ user }: NotificationsPageProps) {
  const [incoming, setIncoming] = useState<SwapOffer[]>([]);
  const [outgoing, setOutgoing] = useState<SwapOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const { toasts, addToast, removeToast } = useToast();
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', confirmLabel: 'Confirmer', confirmDanger: false, onConfirm: () => {} });

  const openModal = (title: string, message: string, confirmLabel: string, confirmDanger: boolean, onConfirm: () => void) => {
    setModal({ isOpen: true, title, message, confirmLabel, confirmDanger, onConfirm });
  };
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const loadOffers = async () => {
      const supabase = createClient();
      try {
        const { data: incomingData } = await supabase.from('swap_offers').select('*').eq('book_owner_id', user.id).order('created_at', { ascending: false });
        const { data: outgoingData } = await supabase.from('swap_offers').select('*').eq('requester_id', user.id).order('created_at', { ascending: false });
        setIncoming(incomingData || []);
        setOutgoing(outgoingData || []);
      } catch (err) {
        console.error('Erreur chargement offres:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOffers();
  }, [user.id]);

  const handleAccept = async (offerId: string) => {
    closeModal();
    const supabase = createClient();
    try {
      const swapCode = Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      const { error } = await supabase.from('swap_offers').update({ status: 'accepted', swap_code: swapCode }).eq('id', offerId);
      if (error) throw error;
      const offer = incoming.find(o => o.id === offerId);
      if (offer) {
        await supabase.from('books').update({ is_available: false }).eq('id', offer.book_id);
        if (offer.offered_book_ids?.length > 0) await supabase.from('books').update({ is_available: false }).in('id', offer.offered_book_ids);
        await supabase.from('swap_offers').update({ status: 'declined' }).eq('book_id', offer.book_id).eq('status', 'pending').neq('id', offerId);
      }
      setIncoming(incoming.map(o => o.id === offerId ? { ...o, status: 'accepted', swap_code: swapCode } : o));
      addToast('Échange accepté ! Le code a été généré.', 'success');
    } catch (err: any) { addToast('Erreur : ' + err.message, 'error'); }
  };

  const handleDecline = async (offerId: string) => {
    closeModal();
    const supabase = createClient();
    try {
      const { error } = await supabase.from('swap_offers').update({ status: 'declined' }).eq('id', offerId);
      if (error) throw error;
      setIncoming(incoming.map(o => o.id === offerId ? { ...o, status: 'declined' } : o));
      addToast('Demande refusée', 'info');
    } catch (err: any) { addToast('Erreur : ' + err.message, 'error'); }
  };

  const handleCancel = async (offerId: string) => {
    closeModal();
    const supabase = createClient();
    try {
      const { error } = await supabase.from('swap_offers').delete().eq('id', offerId);
      if (error) throw error;
      setOutgoing(outgoing.filter(o => o.id !== offerId));
      addToast('Demande annulée', 'info');
    } catch (err: any) { addToast('Erreur : ' + err.message, 'error'); }
  };

  const statusStyle = (status: string) => {
    if (status === 'pending') return { background: 'var(--yellow)', color: 'var(--fg)', border: '1px solid var(--border)' };
    if (status === 'accepted') return { background: 'rgba(45,138,78,0.15)', color: 'var(--accent)', border: '1px solid var(--accent)' };
    return { background: 'var(--muted)', color: 'var(--subtle)', border: '1px solid var(--border)' };
  };
  const statusLabel = (status: string) => status === 'pending' ? 'En attente' : status === 'accepted' ? 'Acceptée' : 'Refusée';

  if (isLoading) return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ height: '48px', background: 'linear-gradient(90deg, var(--muted) 25%, var(--bg) 50%, var(--muted) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '8px', width: '200px', marginBottom: '32px' }} />
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: 'var(--card-bg)', border: '2px solid var(--muted)', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[60, 40, 80].map((w, j) => (
            <div key={j} style={{ height: '16px', background: 'linear-gradient(90deg, var(--muted) 25%, var(--bg) 50%, var(--muted) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '4px', width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );

  const pendingIncoming = incoming.filter(o => o.status === 'pending').length;

  const renderOffer = (offer: SwapOffer, i: number, isIncoming: boolean) => (
    <div key={offer.id} style={{ background: 'var(--card-bg)', border: '2px solid var(--border)', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: '4px 4px 0px 0px var(--shadow)', padding: '24px', position: 'relative', transform: `rotate(${i % 2 === 0 ? (isIncoming ? '-0.3deg' : '0.3deg') : (isIncoming ? '0.3deg' : '-0.3deg')})` }}>
      {isIncoming && <div className="tack" />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', marginTop: isIncoming ? '8px' : '0', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.2rem', marginBottom: '4px', color: 'var(--fg)' }}>
            {isIncoming ? `${offer.requester_name} veut échanger` : `Demande pour : `}
            {!isIncoming && <span style={{ color: 'var(--accent)' }}>{offer.requested_book_title}</span>}
          </h3>
          {isIncoming && <p style={{ fontFamily: 'Patrick Hand, cursive', color: 'var(--subtle)' }}>Votre livre : <strong style={{ color: 'var(--fg)' }}>{offer.requested_book_title}</strong></p>}
          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: 'var(--muted-text)' }}>{new Date(offer.created_at).toLocaleDateString('fr-FR')}</p>
        </div>
        <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', padding: '4px 12px', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', ...statusStyle(offer.status) }}>{statusLabel(offer.status)}</span>
      </div>

      <div style={{ padding: '12px', background: 'var(--bg)', border: '1px dashed var(--border)', borderRadius: '6px', marginBottom: '16px' }}>
        <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px', color: 'var(--fg)' }}>{isIncoming ? 'Livres proposés :' : 'Vous avez proposé :'}</p>
        {offer.offered_books?.map((book, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
            <BookOpen size={14} strokeWidth={2} color="var(--accent)" />
            <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', margin: 0, color: 'var(--fg)' }}>{book}</p>
          </div>
        ))}
      </div>

      {offer.status === 'accepted' && offer.swap_code && (
        <div style={{ padding: '16px', background: 'var(--yellow)', border: '2px solid var(--accent)', borderRadius: '8px', boxShadow: '3px 3px 0px 0px var(--accent)', marginBottom: '16px', textAlign: 'center' }}>
          {!isIncoming && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Check size={18} strokeWidth={2.5} color="var(--accent)" />
              <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', color: 'var(--accent)', margin: 0 }}>Échange accepté !</p>
            </div>
          )}
          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--subtle)' }}>Code d'échange :</p>
          <p style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', color: 'var(--accent)', letterSpacing: '4px' }}>{offer.swap_code}</p>
          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: 'var(--subtle)' }}>Présentez ce code au bureau d'administration</p>
        </div>
      )}

      {offer.status === 'declined' && !isIncoming && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <X size={16} strokeWidth={2.5} color="var(--danger)" />
          <p style={{ fontFamily: 'Patrick Hand, cursive', color: 'var(--danger)', fontWeight: 700, margin: 0 }}>Votre demande a été refusée.</p>
        </div>
      )}

      {offer.status === 'pending' && isIncoming && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => openModal("Accepter l'échange", `Accepter l'échange avec ${offer.requester_name} pour "${offer.requested_book_title}" ?`, 'Accepter', false, () => handleAccept(offer.id))}>
            <Check size={16} strokeWidth={2.5} /> Accepter
          </button>
          <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => openModal("Refuser l'échange", `Refuser la demande de ${offer.requester_name} ?`, 'Refuser', true, () => handleDecline(offer.id))}>
            <X size={16} strokeWidth={2.5} /> Refuser
          </button>
        </div>
      )}

      {offer.status === 'pending' && !isIncoming && (
        <button className="btn-danger" onClick={() => openModal('Annuler la demande', `Annuler votre demande pour "${offer.requested_book_title}" ?`, 'Annuler', true, () => handleCancel(offer.id))} style={{ fontSize: '0.9rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <X size={14} strokeWidth={2.5} /> Annuler la demande
        </button>
      )}

      {isIncoming && <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '12px' }}>Contact : {offer.requester_email}</p>}
    </div>
  );

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal isOpen={modal.isOpen} title={modal.title} message={modal.message} confirmLabel={modal.confirmLabel} confirmDanger={modal.confirmDanger} onConfirm={modal.onConfirm} onCancel={closeModal} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <Inbox size={32} strokeWidth={2} color="var(--accent)" />
          <h1 style={{ fontFamily: 'Kalam, cursive', fontSize: '2.5rem', transform: 'rotate(-1deg)', display: 'inline-block', margin: 0, color: 'var(--fg)' }}>Notifications</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { key: 'incoming', label: `Demandes reçues${pendingIncoming > 0 ? ` (${pendingIncoming})` : ''}` },
            { key: 'outgoing', label: `Mes demandes (${outgoing.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', padding: '8px 20px', background: activeTab === tab.key ? 'var(--fg)' : 'var(--card-bg)', color: activeTab === tab.key ? 'var(--bg)' : 'var(--fg)', border: '2px solid var(--border)', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: activeTab === tab.key ? '2px 2px 0px 0px var(--accent)' : '4px 4px 0px 0px var(--shadow)', cursor: 'pointer', transition: 'all 0.1s ease' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'incoming' && (
            incoming.length === 0
              ? <div className="card-yellow" style={{ textAlign: 'center', padding: '48px' }}><p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.3rem', color: 'var(--fg)' }}>Aucune demande reçue</p></div>
              : incoming.map((offer, i) => renderOffer(offer, i, true))
          )}
          {activeTab === 'outgoing' && (
            outgoing.length === 0
              ? <div className="card-yellow" style={{ textAlign: 'center', padding: '48px' }}><p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.3rem', color: 'var(--fg)' }}>Aucune demande envoyée</p></div>
              : outgoing.map((offer, i) => renderOffer(offer, i, false))
          )}
        </div>
      </div>
    </>
  );
}