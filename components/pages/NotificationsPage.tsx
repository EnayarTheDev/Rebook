'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Check, X, BookOpen, Inbox } from 'lucide-react';

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
    const supabase = createClient();
    try {
      const swapCode = Math.random().toString(36).substr(2, 8).toUpperCase();
      const { error } = await supabase.from('swap_offers').update({ status: 'accepted', swap_code: swapCode }).eq('id', offerId);
      if (error) throw error;
      const offer = incoming.find(o => o.id === offerId);
      if (offer) {
        await supabase.from('books').update({ is_available: false }).eq('id', offer.book_id);
        if (offer.offered_book_ids && offer.offered_book_ids.length > 0) {
          await supabase.from('books').update({ is_available: false }).in('id', offer.offered_book_ids);
        }
        await supabase.from('swap_offers').update({ status: 'declined' }).eq('book_id', offer.book_id).eq('status', 'pending').neq('id', offerId);
      }
      setIncoming(incoming.map(o => o.id === offerId ? { ...o, status: 'accepted', swap_code: swapCode } : o));
    } catch (err) { alert('Erreur : ' + err); }
  };

  const handleDecline = async (offerId: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('swap_offers').update({ status: 'declined' }).eq('id', offerId);
      if (error) throw error;
      setIncoming(incoming.map(o => o.id === offerId ? { ...o, status: 'declined' } : o));
    } catch (err) { alert('Erreur : ' + err); }
  };

  const handleCancel = async (offerId: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('swap_offers').delete().eq('id', offerId);
      if (error) throw error;
      setOutgoing(outgoing.filter(o => o.id !== offerId));
    } catch (err) { alert('Erreur : ' + err); }
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'Kalam, cursive', fontSize: '1.5rem' }}>Chargement...</div>;

  const pendingIncoming = incoming.filter(o => o.status === 'pending').length;

  const statusStyle = (status: string) => {
    if (status === 'pending') return { background: '#f0faf4', color: '#2d2d2d', border: '1px solid #2d2d2d' };
    if (status === 'accepted') return { background: '#d4edda', color: '#1a6b3a', border: '1px solid #1a6b3a' };
    return { background: '#e5e0d8', color: '#2d2d2d', border: '1px solid #2d2d2d' };
  };

  const statusLabel = (status: string) => status === 'pending' ? 'En attente' : status === 'accepted' ? 'Acceptée' : 'Refusée';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Inbox size={32} strokeWidth={2} color="#2d8a4e" />
        <h1 style={{ fontFamily: 'Kalam, cursive', fontSize: '2.5rem', transform: 'rotate(-1deg)', display: 'inline-block', margin: 0 }}>Notifications</h1>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        {[
          { key: 'incoming', label: `Demandes reçues${pendingIncoming > 0 ? ` (${pendingIncoming})` : ''}` },
          { key: 'outgoing', label: `Mes demandes (${outgoing.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', padding: '8px 20px', background: activeTab === tab.key ? '#2d2d2d' : '#ffffff', color: activeTab === tab.key ? '#ffffff' : '#2d2d2d', border: '2px solid #2d2d2d', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: activeTab === tab.key ? '2px 2px 0px 0px #2d8a4e' : '4px 4px 0px 0px #2d2d2d', cursor: 'pointer', transition: 'all 0.1s ease' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'incoming' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {incoming.length === 0 ? (
            <div className="card-yellow" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.3rem' }}>Aucune demande reçue</p>
            </div>
          ) : incoming.map((offer, i) => (
            <div key={offer.id} style={{ background: '#ffffff', border: '2px solid #2d2d2d', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: '4px 4px 0px 0px #2d2d2d', padding: '24px', position: 'relative', transform: `rotate(${i % 2 === 0 ? '-0.3deg' : '0.3deg'})` }}>
              <div className="tack" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', marginTop: '8px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.2rem', marginBottom: '4px' }}>{offer.requester_name} veut échanger</h3>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555' }}>Votre livre : <strong>{offer.requested_book_title}</strong></p>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: '#888' }}>{new Date(offer.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', padding: '4px 12px', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', ...statusStyle(offer.status) }}>{statusLabel(offer.status)}</span>
              </div>

              <div style={{ padding: '12px', background: '#fdfbf7', border: '1px dashed #2d2d2d', borderRadius: '6px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Livres proposés :</p>
                {offer.offered_books?.map((book, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
                    <BookOpen size={14} strokeWidth={2} color="#2d8a4e" />
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', margin: 0 }}>{book}</p>
                  </div>
                ))}
              </div>

              {offer.status === 'accepted' && offer.swap_code && (
                <div style={{ padding: '16px', background: '#f0faf4', border: '2px solid #2d8a4e', borderRadius: '8px', boxShadow: '3px 3px 0px 0px #2d8a4e', marginBottom: '16px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', marginBottom: '4px' }}>Code d'échange :</p>
                  <p style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', color: '#2d8a4e', letterSpacing: '4px' }}>{offer.swap_code}</p>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#555' }}>Présentez ce code au bureau d'administration</p>
                </div>
              )}

              {offer.status === 'pending' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleAccept(offer.id)}>
                    <Check size={16} strokeWidth={2.5} /> Accepter
                  </button>
                  <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleDecline(offer.id)}>
                    <X size={16} strokeWidth={2.5} /> Refuser
                  </button>
                </div>
              )}
              <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#888', marginTop: '12px' }}>Contact : {offer.requester_email}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'outgoing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {outgoing.length === 0 ? (
            <div className="card-yellow" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.3rem' }}>Aucune demande envoyée</p>
            </div>
          ) : outgoing.map((offer, i) => (
            <div key={offer.id} style={{ background: '#ffffff', border: '2px solid #2d2d2d', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: '4px 4px 0px 0px #2d2d2d', padding: '24px', position: 'relative', transform: `rotate(${i % 2 === 0 ? '0.3deg' : '-0.3deg'})` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.2rem', marginBottom: '4px' }}>Demande pour : <span style={{ color: '#2d8a4e' }}>{offer.requested_book_title}</span></h3>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: '#888' }}>{new Date(offer.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', padding: '4px 12px', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', ...statusStyle(offer.status) }}>{statusLabel(offer.status)}</span>
              </div>

              <div style={{ padding: '12px', background: '#fdfbf7', border: '1px dashed #2d2d2d', borderRadius: '6px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Vous avez proposé :</p>
                {offer.offered_books?.map((book, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
                    <BookOpen size={14} strokeWidth={2} color="#2d8a4e" />
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', margin: 0 }}>{book}</p>
                  </div>
                ))}
              </div>

              {offer.status === 'accepted' && offer.swap_code && (
                <div style={{ padding: '16px', background: '#f0faf4', border: '2px solid #2d8a4e', borderRadius: '8px', boxShadow: '3px 3px 0px 0px #2d8a4e', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Check size={18} strokeWidth={2.5} color="#2d8a4e" />
                    <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', color: '#2d8a4e', margin: 0 }}>Échange accepté !</p>
                  </div>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', marginBottom: '4px' }}>Code d'échange :</p>
                  <p style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', color: '#2d8a4e', letterSpacing: '4px' }}>{offer.swap_code}</p>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#555' }}>Présentez ce code au bureau d'administration</p>
                </div>
              )}

              {offer.status === 'declined' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={16} strokeWidth={2.5} color="#cc3333" />
                  <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#cc3333', fontWeight: 700, margin: 0 }}>Votre demande a été refusée.</p>
                </div>
              )}

              {offer.status === 'pending' && (
                <button className="btn-danger" onClick={() => handleCancel(offer.id)} style={{ fontSize: '0.9rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={14} strokeWidth={2.5} /> Annuler la demande
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}