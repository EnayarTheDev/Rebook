'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Check, X, Search } from 'lucide-react';

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
  const [search, setSearch] = useState('');

  const genres = ['Roman', 'Poésie', 'Théâtre', 'Comédie', 'Drame', 'Science-Fiction', 'Fantastique', 'Policier', 'Biographie', 'Histoire', 'Philosophie', 'Autre'];
  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Bon' },
    { value: 'fair', label: 'Correct' },
  ];

  useEffect(() => { loadBooks(); }, [filters]);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase.from('books').select('*');
      if (filters.genre) query = query.eq('subject', filters.genre);
      if (filters.condition) query = query.eq('condition', filters.condition);
      const { data: booksData, error } = await query.order('is_available', { ascending: false }).order('created_at', { ascending: false });
      if (error || !booksData) { setBooks([]); setIsLoading(false); return; }
      if (booksData.length === 0) { setBooks([]); setIsLoading(false); return; }
      const userIds = [...new Set(booksData.map(b => b.user_id))];
      const { data: profilesData } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds);
      const profileMap: Record<string, any> = {};
      profilesData?.forEach(p => { profileMap[p.id] = p; });
      setBooks(booksData.map(b => ({
        ...b,
        genre: b.subject,
        owner_name: profileMap[b.user_id] ? `${profileMap[b.user_id].first_name} ${profileMap[b.user_id].last_name}` : 'Inconnu',
        owner_email: profileMap[b.user_id]?.email || '',
      })));
    } catch { setBooks([]); }
    finally { setIsLoading(false); }
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    b.genre.toLowerCase().includes(search.toLowerCase())
  );

  const conditionLabel: Record<string, string> = { excellent: 'Excellent', good: 'Bon', fair: 'Correct' };
  const rotations = ['-1deg', '0.5deg', '-0.5deg', '1deg', '-1.5deg', '0.8deg'];

  const SkeletonCard = () => (
    <div style={{ background: '#ffffff', border: '2px solid #e5e0d8', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', overflow: 'hidden', boxShadow: '4px 4px 0px 0px #e5e0d8' }}>
      <div style={{ height: '160px', background: 'linear-gradient(90deg, #e5e0d8 25%, #f0ece4 50%, #e5e0d8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '20px', background: 'linear-gradient(90deg, #e5e0d8 25%, #f0ece4 50%, #e5e0d8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '4px', width: '80%' }} />
        <div style={{ height: '16px', background: 'linear-gradient(90deg, #e5e0d8 25%, #f0ece4 50%, #e5e0d8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '4px', width: '50%' }} />
        <div style={{ height: '16px', background: 'linear-gradient(90deg, #e5e0d8 25%, #f0ece4 50%, #e5e0d8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '4px', width: '60%' }} />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'Kalam, cursive', fontSize: '2.5rem', marginBottom: '8px', transform: 'rotate(-1deg)', display: 'inline-block' }}>
        Parcourir les livres
      </h1>
      <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.1rem', color: '#2d2d2d', marginBottom: '32px' }}>
        Trouvez votre prochain livre à échanger !
      </p>

      <div className="card" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={18} strokeWidth={2} color="#888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par titre, auteur, genre..."
            className="input-wobbly"
            style={{ paddingLeft: '44px' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>Genre</label>
            <select value={filters.genre} onChange={e => setFilters({ ...filters, genre: e.target.value })} className="input-wobbly">
              <option value="">Tous les genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>État</label>
            <select value={filters.condition} onChange={e => setFilters({ ...filters, condition: e.target.value })} className="input-wobbly">
              <option value="">Tous les états</option>
              {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '28px' }} className="browse-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="card-yellow" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.5rem' }}>
            {search ? `Aucun résultat pour "${search}"` : 'Aucun livre trouvé'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '28px' }} className="browse-grid">
          {filteredBooks.map((book, i) => (
            <div
              key={book.id}
              onClick={() => book.is_available && onSelectBook(book.id)}
              style={{ background: '#ffffff', border: '2px solid #2d2d2d', borderRadius: '30px 5px 25px 8px / 8px 25px 5px 30px', boxShadow: '4px 4px 0px 0px #2d2d2d', overflow: 'hidden', cursor: book.is_available ? 'pointer' : 'not-allowed', opacity: book.is_available ? 1 : 0.8, transform: `rotate(${rotations[i % rotations.length]})`, transition: 'transform 0.1s ease, box-shadow 0.1s ease', position: 'relative' }}
              onMouseEnter={e => { if (book.is_available) { (e.currentTarget as HTMLDivElement).style.transform = 'rotate(0deg)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 0px 0px #2d2d2d'; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = `rotate(${rotations[i % rotations.length]})`; (e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0px 0px #2d2d2d'; }}
            >
              <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ background: '#f0faf4', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #2d2d2d' }}>
                    <BookOpen size={48} strokeWidth={1.5} color="#2d8a4e" />
                  </div>
                )}
                {!book.is_available && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(45,45,45,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Kalam, cursive', color: '#2d8a4e', fontSize: '1.8rem', fontWeight: 700, transform: 'rotate(-15deg)', border: '3px solid #2d8a4e', padding: '4px 12px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px' }}>
                      SWAP DONE
                    </span>
                  </div>
                )}
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', marginBottom: '6px', lineHeight: 1.2 }}>{book.title}</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', background: '#f0faf4', border: '1px solid #2d2d2d', borderRadius: '4px 8px 3px 6px / 8px 3px 6px 4px', padding: '2px 8px' }}>{book.genre}</span>
                  <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', background: book.is_available ? '#d4edda' : '#e5e0d8', border: '1px solid #2d2d2d', borderRadius: '4px 8px 3px 6px / 8px 3px 6px 4px', padding: '2px 8px' }}>{conditionLabel[book.condition] || book.condition}</span>
                </div>
                <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: '#555', marginBottom: '12px' }}>Par : <strong>{book.owner_name}</strong></p>
                <div style={{ borderTop: '1px dashed #2d2d2d', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {book.is_available ? (
                    <><Check size={16} strokeWidth={2.5} color="#2d8a4e" /><p style={{ fontFamily: 'Kalam, cursive', color: '#2d8a4e', fontSize: '1rem', margin: 0 }}>Échange gratuit</p></>
                  ) : (
                    <><X size={16} strokeWidth={2.5} color="#cc3333" /><p style={{ fontFamily: 'Kalam, cursive', color: '#cc3333', fontSize: '1rem', margin: 0 }}>Échangé</p></>
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