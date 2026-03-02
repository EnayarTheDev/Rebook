'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Book {
  id: string;
  title: string;
  genre: string;
  condition: string;
  description: string;
  user_id: string;
  owner_name: string;
  owner_email: string;
  is_available: boolean;
  cover_url: string | null;
}

interface BrowsePageProps {
  onSelectBook: (bookId: string) => void;
  user: any;
}

export default function BrowsePage({ onSelectBook, user }: BrowsePageProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ genre: '', condition: '' });

  const genres = ['Roman', 'Poésie', 'Théâtre', 'Comédie', 'Drame', 'Science-Fiction', 'Fantastique', 'Policier', 'Biographie', 'Histoire', 'Philosophie', 'Autre'];
  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good',      label: 'Bon' },
    { value: 'fair',      label: 'Correct' },
  ];

  useEffect(() => { loadBooks(); }, [filters]);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('books')
        .select('*');

      if (filters.genre) query = query.eq('subject', filters.genre);
      if (filters.condition) query = query.eq('condition', filters.condition);

      const { data: booksData, error } = await query.order('created_at', { ascending: false });
      if (error || !booksData) { setBooks([]); setIsLoading(false); return; }
      if (booksData.length === 0) { setBooks([]); setIsLoading(false); return; }

      const userIds = [...new Set(booksData.map(b => b.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      const profileMap: Record<string, any> = {};
      profilesData?.forEach(p => { profileMap[p.id] = p; });

      setBooks(booksData.map(b => ({
        ...b,
        genre: b.subject,
        owner_name: profileMap[b.user_id]
          ? `${profileMap[b.user_id].first_name} ${profileMap[b.user_id].last_name}`
          : 'Inconnu',
        owner_email: profileMap[b.user_id]?.email || '',
      })));
    } catch { setBooks([]); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Parcourir les livres disponibles</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Genre</label>
            <select value={filters.genre} onChange={(e) => setFilters({ ...filters, genre: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
              <option value="">Tous les genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">État</label>
            <select value={filters.condition} onChange={(e) => setFilters({ ...filters, condition: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
              <option value="">Tous les états</option>
              {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Chargement des livres...</div>
      ) : books.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">Aucun livre trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <div
              key={book.id}
              onClick={() => book.is_available && onSelectBook(book.id)}
              className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all ${
                book.is_available
                  ? 'hover:shadow-xl hover:scale-105 cursor-pointer border-gray-200 hover:border-green-500'
                  : 'cursor-not-allowed border-gray-200 opacity-75'
              }`}
            >
              <div className="relative h-40 overflow-hidden">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-medium">Pas de photo</span>
                  </div>
                )}
                {!book.is_available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-black text-3xl tracking-widest rotate-[-15deg] border-4 border-white px-3 py-1">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <h3 className="font-bold text-white line-clamp-2 text-sm">{book.title}</h3>
                  <p className="text-xs text-white/80">{book.genre}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {book.condition.charAt(0).toUpperCase() + book.condition.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Proposé par : <span className="font-semibold">{book.owner_name}</span></p>
                {book.description && <p className="text-xs text-gray-600 line-clamp-2">{book.description}</p>}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {book.is_available ? (
                    <p className="text-lg font-bold text-green-600">Échange gratuit</p>
                  ) : (
                    <p className="text-lg font-bold text-red-500">Non disponible</p>
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