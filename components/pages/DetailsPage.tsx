'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', data.user_id)
        .single();

      setBook({
        ...data,
        owner_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Inconnu',
        owner_email: profile?.email || '',
      });

      if (user) {
        const { data: userBooksData } = await supabase
          .from('books')
          .select('id, title, subject, condition')
          .eq('user_id', user.id)
          .eq('is_available', true);
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
        book_id: bookId,
        book_owner_id: book.user_id,
        requester_id: user.id,
        requester_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Utilisateur',
        requester_email: user.email,
        requested_book_title: book.title,
        offered_books: offeredBookTitles,
        offered_book_ids: selectedBooks,
        status: 'pending',
      }]);

      if (error) throw error;
      setSwapSuccess(true);
    } catch (err: any) {
      alert("Erreur lors de la demande d'échange : " + err.message);
    }
  };

  if (isLoading) return <div className="text-center py-12">Chargement...</div>;
  if (!book) return <div className="text-center text-gray-600 py-12">Livre introuvable</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => setCurrentPage('browse')} className="mb-6 text-green-600 hover:text-green-700 font-semibold">
        ← Retour à la liste
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="rounded-lg mb-6 overflow-hidden">
          {book.cover_url && (
            <img src={book.cover_url} alt={book.title} className="w-full h-56 object-cover" />
          )}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{book.title}</h1>
            <div className="flex gap-4 text-gray-700 flex-wrap">
              <span className="font-semibold">{book.subject}</span>
              <span className="inline-block bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {book.condition.charAt(0).toUpperCase() + book.condition.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {book.description && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700">{book.description}</p>
          </div>
        )}

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-l-4 border-green-500 mb-6">
          <h3 className="font-bold text-gray-800 mb-2">Proposé par</h3>
          <p className="text-gray-700 mb-1">{book.owner_name}</p>
          <p className="text-sm text-gray-600">{book.owner_email}</p>
        </div>

        <div className="text-lg font-bold text-green-600 mb-6">Échange gratuit</div>

        {!book.is_available ? (
          <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg text-center">
            <p className="text-2xl font-black text-red-600 tracking-widest">OUT OF STOCK</p>
            <p className="text-sm text-red-500 mt-1">Ce livre n'est plus disponible</p>
          </div>
        ) : user && user.id !== book.user_id ? (
          showSwapForm ? (
            <div className="space-y-3 pt-4 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3">Sélectionnez les livres à proposer en échange</h3>
              {userBooks.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {userBooks.map(userBook => (
                    <label key={userBook.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(userBook.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedBooks([...selectedBooks, userBook.id]);
                          else setSelectedBooks(selectedBooks.filter(id => id !== userBook.id));
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{userBook.title}</p>
                        <p className="text-xs text-gray-600">{userBook.subject} - {userBook.condition}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Vous n'avez pas encore proposé de livres.</p>
              )}
              <div className="flex gap-2 pt-3">
                <button
                  onClick={handleInitiateSwap}
                  disabled={selectedBooks.length === 0}
                  className={`flex-1 font-bold py-2 rounded-lg transition-all ${selectedBooks.length > 0 ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  🔄 Proposer l'échange
                </button>
                <button onClick={() => setShowSwapForm(false)} className="px-4 font-semibold text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { if (userBooks.length === 0) setCurrentPage('offer'); else setShowSwapForm(true); }}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              {userBooks.length === 0 ? "Proposer un livre d'abord" : '🔄 Demander l\'échange'}
            </button>
          )
        ) : user && user.id === book.user_id ? (
          <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-600">
            <p className="font-semibold">C'est votre livre</p>
          </div>
        ) : (
          <button onClick={() => window.location.href = '/auth/request-approval'} className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all">
            Inscrivez-vous pour échanger
          </button>
        )}

        {swapSuccess && (
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg font-semibold mt-4">
            ✓ Demande d'échange envoyée — consultez vos notifications pour les mises à jour.
          </div>
        )}
      </div>
    </div>
  );
}