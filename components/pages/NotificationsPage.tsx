'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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
        const { data: incomingData } = await supabase
          .from('swap_offers')
          .select('*')
          .eq('book_owner_id', user.id)
          .order('created_at', { ascending: false });

        const { data: outgoingData } = await supabase
          .from('swap_offers')
          .select('*')
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false });

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

      const { error } = await supabase
        .from('swap_offers')
        .update({ status: 'accepted', swap_code: swapCode })
        .eq('id', offerId);
      if (error) throw error;

      const offer = incoming.find(o => o.id === offerId);
      if (offer) {
        // Mark requested book as unavailable
        await supabase.from('books').update({ is_available: false }).eq('id', offer.book_id);

        // Mark offered books as unavailable
        if (offer.offered_book_ids && offer.offered_book_ids.length > 0) {
          await supabase.from('books').update({ is_available: false }).in('id', offer.offered_book_ids);
        }

        // Decline all other pending offers for the same book
        await supabase
          .from('swap_offers')
          .update({ status: 'declined' })
          .eq('book_id', offer.book_id)
          .eq('status', 'pending')
          .neq('id', offerId);
      }

      setIncoming(incoming.map(o => o.id === offerId ? { ...o, status: 'accepted', swap_code: swapCode } : o));
    } catch (err) {
      alert('Erreur : ' + err);
    }
  };

  const handleDecline = async (offerId: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('swap_offers').update({ status: 'declined' }).eq('id', offerId);
      if (error) throw error;
      setIncoming(incoming.map(o => o.id === offerId ? { ...o, status: 'declined' } : o));
    } catch (err) {
      alert('Erreur : ' + err);
    }
  };

  const handleCancel = async (offerId: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('swap_offers').delete().eq('id', offerId);
      if (error) throw error;
      setOutgoing(outgoing.filter(o => o.id !== offerId));
    } catch (err) {
      alert('Erreur : ' + err);
    }
  };

  if (isLoading) return <div className="text-center py-12">Chargement des notifications...</div>;

  const pendingIncoming = incoming.filter(o => o.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>

      <div className="flex gap-4 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 font-semibold transition-colors ${activeTab === 'incoming' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Demandes reçues {pendingIncoming > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{pendingIncoming}</span>}
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 font-semibold transition-colors ${activeTab === 'outgoing' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Mes demandes ({outgoing.length})
        </button>
      </div>

      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incoming.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">Aucune demande reçue</p>
            </div>
          ) : incoming.map(offer => (
            <div key={offer.id} className={`rounded-lg p-6 border-2 ${offer.status === 'pending' ? 'bg-blue-50 border-blue-200' : offer.status === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{offer.requester_name} souhaite échanger</h3>
                  <p className="text-gray-600">Votre livre : <span className="font-semibold">{offer.requested_book_title}</span></p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(offer.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${offer.status === 'pending' ? 'bg-blue-200 text-blue-800' : offer.status === 'accepted' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                  {offer.status === 'pending' ? 'En attente' : offer.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                </span>
              </div>

              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Livres proposés en échange :</p>
                <ul className="space-y-1">
                  {offer.offered_books?.map((book, idx) => <li key={idx} className="text-gray-700">• {book}</li>)}
                </ul>
              </div>

              {offer.status === 'accepted' && offer.swap_code && (
                <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4 rounded">
                  <p className="text-sm text-gray-700 mb-1">Code d'échange :</p>
                  <p className="text-2xl font-bold text-green-700">{offer.swap_code}</p>
                  <p className="text-xs text-gray-600 mt-2">Présentez ce code avec vos livres au bureau d'administration</p>
                </div>
              )}

              {offer.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => handleAccept(offer.id)} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 transition-colors">Accepter</button>
                  <button onClick={() => handleDecline(offer.id)} className="flex-1 bg-gray-300 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-400 transition-colors">Refuser</button>
                </div>
              )}

              <p className="text-xs text-gray-600 mt-4">Contact : {offer.requester_email}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'outgoing' && (
        <div className="space-y-4">
          {outgoing.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">Vous n'avez fait aucune demande d'échange</p>
            </div>
          ) : outgoing.map(offer => (
            <div key={offer.id} className={`rounded-lg p-6 border-2 ${offer.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : offer.status === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Demande pour : <span className="text-green-700">{offer.requested_book_title}</span></h3>
                  <p className="text-sm text-gray-500 mt-1">{new Date(offer.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${offer.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : offer.status === 'accepted' ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {offer.status === 'pending' ? 'En attente' : offer.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                </span>
              </div>

              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Vous avez proposé en échange :</p>
                <ul className="space-y-1">
                  {offer.offered_books?.map((book, idx) => <li key={idx} className="text-gray-700">• {book}</li>)}
                </ul>
              </div>

              {offer.status === 'accepted' && offer.swap_code && (
                <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4 rounded">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Votre échange a été accepté !</p>
                  <p className="text-sm text-gray-700 mb-1">Code d'échange :</p>
                  <p className="text-2xl font-bold text-green-700">{offer.swap_code}</p>
                  <p className="text-xs text-gray-600 mt-2">Présentez ce code avec vos livres au bureau d'administration</p>
                </div>
              )}

              {offer.status === 'declined' && (
                <p className="text-sm text-red-600 font-semibold">Votre demande a été refusée.</p>
              )}

              {offer.status === 'pending' && (
                <button onClick={() => handleCancel(offer.id)} className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold underline">
                  Annuler la demande
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}