'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, ArrowLeft, ArrowLeftRight, Check, User } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  subject: string;
  condition: string;
  description: string;
  user_id: string;
  owner_name: string;
  owner_email: string;
  is_available: boolean;
  cover_url: string | null;
}

interface UserBook {
  id: string;
  title: string;
  subject: string;
  condition: string;
}

interface DetailsPageProps {
  bookId: string;
  setCurrentPage: (page: string) => void;
  user: any;
}

export default function DetailsPage({ bookId, setCurrentPage, user }: DetailsPageProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadBookDetails(); }, [bookId]);

  const loadBookDetails = async () => {
    const supabase = createClient();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('books').select('*').eq('id', bookId).single();
      if (error) throw error;
      const { data: profile } = await supabase.from('profiles').select('first_name, last_name, email').eq('id', data.user_id).single();
      setBook({ ...data, owner_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Inconnu', owner_email: profile?.email || '' });
      if (user) {
        const { data: userBooksData } = await supabase.from('books').select('id, title, subject, condition').eq('user_id', user.id).eq('is_available', true);
        setUserBooks(userBooksData || []);
      }
    } catch (err) {
      console.error('Erreur chargement livre:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateSwap = async () => {
    if (!user) { alert('Veuillez vous connecter pour échanger des livres'); return; }
    if (selectedBooks.length === 0) { alert('Veuillez sélectionner au moins un livre'); return; }
    if (!book) return;
    const supabase = createClient();
    try {
      const offeredBookTitles = selectedBooks.map(id => userBooks.find(b => b.id === id)?.title || 'Inconnu');
      const { error } = await supabase.from('swap_offers').insert([{
        book_id: bookId, book_owner_id: book.user_id, requester_id: user.id,
        requester_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Utilisateur',
        requester_email: user.email, requested_book_title: book.title,
        offered_books: offeredBookTitles, offered_book_ids: selectedBooks, status: 'pending',
      }]);
      if (error) throw error;
      setSwapSuccess(true);
    } catch (err: any) {
      alert("Erreur lors de la demande d'échange : " + err.message);
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'Kalam, cursive', fontSize: '1.5rem' }}>Chargement...</div>;
  if (!book) return <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'Kalam, cursive', fontSize: '1.5rem' }}>Livre introuvable</div>;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px' }}>
      <button onClick={() => setCurrentPage('browse')} style={{ fontFamily: 'Patrick Hand, cursive', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#2d8a4e', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'underline wavy #2d8a4e 2px' }}>
        <ArrowLeft size={16} strokeWidth={2.5} /> Retour à la liste
      </button>

      <div className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
        <div className="tape" />
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderBottom: '2px solid #2d2d2d' }} />
        ) : (
          <div style={{ width: '100%', height: '160px', background: '#f0faf4', borderBottom: '2px solid #2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={64} strokeWidth={1.5} color="#2d8a4e" />
          </div>
        )}

        <div style={{ padding: '32px' }}>
          <h1 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', marginBottom: '12px', lineHeight: 1.2 }}>{book.title}</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'Patrick Hand, cursive', background: '#f0faf4', border: '1px solid #2d2d2d', borderRadius: '4px 8px 3px 6px / 8px 3px 6px 4px', padding: '3px 12px' }}>{book.subject}</span>
            <span style={{ fontFamily: 'Patrick Hand, cursive', background: '#e5e0d8', border: '1px solid #2d2d2d', borderRadius: '4px 8px 3px 6px / 8px 3px 6px 4px', padding: '3px 12px' }}>{book.condition.charAt(0).toUpperCase() + book.condition.slice(1)}</span>
          </div>

          {book.description && (
            <div style={{ marginBottom: '20px', padding: '16px', background: '#fdfbf7', border: '1px dashed #2d2d2d', borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px' }}>
              <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{book.description}</p>
            </div>
          )}

          <div style={{ marginBottom: '20px', padding: '16px', background: '#f0faf4', border: '2px solid #2d2d2d', borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px', boxShadow: '3px 3px 0px 0px #2d2d2d', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <User size={20} strokeWidth={2} color="#2d8a4e" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', marginBottom: '4px' }}>Proposé par</p>
              <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{book.owner_name}</p>
              <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', color: '#555', margin: 0 }}>{book.owner_email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
            <Check size={18} strokeWidth={2.5} color="#2d8a4e" />
            <p style={{ fontFamily: 'Kalam, cursive', color: '#2d8a4e', fontSize: '1.2rem', margin: 0 }}>Échange gratuit</p>
          </div>

          {!book.is_available ? (
            <div style={{ textAlign: 'center', padding: '24px', background: '#fdfbf7', border: '3px solid #cc3333', borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px' }}>
              <p style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', color: '#cc3333', transform: 'rotate(-3deg)', display: 'inline-block' }}>SWAP DONE</p>
              <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#cc3333', marginTop: '4px' }}>Ce livre n'est plus disponible</p>
            </div>
          ) : user && user.id !== book.user_id ? (
            showSwapForm ? (
              <div style={{ padding: '20px', background: '#fdfbf7', border: '2px dashed #2d2d2d', borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px' }}>
                <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.2rem', marginBottom: '16px' }}>Choisissez vos livres à proposer :</h3>
                {userBooks.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
                    {userBooks.map(userBook => (
                      <label key={userBook.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: selectedBooks.includes(userBook.id) ? '#f0faf4' : '#ffffff', border: `2px solid ${selectedBooks.includes(userBook.id) ? '#2d8a4e' : '#2d2d2d'}`, borderRadius: '6px 3px 8px 3px / 3px 8px 3px 6px', cursor: 'pointer', boxShadow: selectedBooks.includes(userBook.id) ? '2px 2px 0px 0px #2d8a4e' : '2px 2px 0px 0px #2d2d2d' }}>
                        <input type="checkbox" checked={selectedBooks.includes(userBook.id)} onChange={e => { if (e.target.checked) setSelectedBooks([...selectedBooks, userBook.id]); else setSelectedBooks(selectedBooks.filter(id => id !== userBook.id)); }} style={{ width: '16px', height: '16px' }} />
                        <div>
                          <p style={{ fontFamily: 'Patrick Hand, cursive', fontWeight: 700, margin: 0 }}>{userBook.title}</p>
                          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: '#555', margin: 0 }}>{userBook.subject} — {userBook.condition}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#555', marginBottom: '16px' }}>Vous n'avez pas encore proposé de livres.</p>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-primary" onClick={handleInitiateSwap} disabled={selectedBooks.length === 0} style={{ flex: 1, opacity: selectedBooks.length === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ArrowLeftRight size={16} strokeWidth={2.5} /> Proposer l'échange
                  </button>
                  <button className="btn-secondary" onClick={() => setShowSwapForm(false)}>Annuler</button>
                </div>
              </div>
            ) : (
              <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => { if (userBooks.length === 0) setCurrentPage('offer'); else setShowSwapForm(true); }}>
                <ArrowLeftRight size={18} strokeWidth={2.5} />
                {userBooks.length === 0 ? "Proposer un livre d'abord" : "Demander l'échange"}
              </button>
            )
          ) : user && user.id === book.user_id ? (
            <div style={{ textAlign: 'center', padding: '16px', background: '#e5e0d8', border: '2px dashed #2d2d2d', borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <BookOpen size={18} strokeWidth={2} />
              <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', margin: 0 }}>C'est votre livre</p>
            </div>
          ) : (
            <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }} onClick={() => window.location.href = '/auth/request-approval'}>
              Inscrivez-vous pour échanger →
            </button>
          )}

          {swapSuccess && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#f0faf4', border: '2px solid #2d8a4e', borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px', boxShadow: '3px 3px 0px 0px #2d8a4e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={18} strokeWidth={2.5} color="#2d8a4e" />
              <p style={{ fontFamily: 'Kalam, cursive', color: '#2d8a4e', fontSize: '1.1rem', margin: 0 }}>Demande envoyée ! Consultez vos notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}