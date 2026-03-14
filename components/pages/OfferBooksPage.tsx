'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Check, PenLine, X } from 'lucide-react';

interface OfferBooksPageProps {
  setCurrentPage: (page: string) => void;
  user: any;
}

export default function OfferBooksPage({ setCurrentPage, user }: OfferBooksPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ title: '', subject: 'Roman', condition: 'excellent', description: '' });

  const genres = ['Roman', 'Poésie', 'Théâtre', 'Comédie', 'Drame', 'Science-Fiction', 'Fantastique', 'Policier', 'Biographie', 'Histoire', 'Philosophie', 'Autre'];
  const conditions = [{ value: 'excellent', label: 'Excellent' }, { value: 'good', label: 'Bon' }, { value: 'fair', label: 'Correct' }];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Veuillez sélectionner une image (JPG, PNG, etc.)'); return; }
    if (file.size > 5 * 1024 * 1024) { alert("L'image ne doit pas dépasser 5 Mo"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { alert('Veuillez entrer un titre'); return; }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Vous devez être connecté.');
      let cover_url: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const filePath = `${session.user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('book-covers').upload(filePath, imageFile, { upsert: false });
        if (uploadError) throw new Error('Erreur upload image : ' + uploadError.message);
        const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(filePath);
        cover_url = urlData.publicUrl;
      }
      const { error } = await supabase.from('books').insert([{ user_id: session.user.id, title: formData.title, subject: formData.subject, level: 'N/A', condition: formData.condition, description: formData.description, is_available: true, cover_url }]);
      if (error) throw error;
      setSuccess(true);
      setFormData({ title: '', subject: 'Roman', condition: 'excellent', description: '' });
      handleRemoveImage();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <PenLine size={32} strokeWidth={2} color="#2d8a4e" />
        <h1 style={{ fontFamily: 'Kalam, cursive', fontSize: '2.5rem', transform: 'rotate(-1deg)', display: 'inline-block', margin: 0 }}>Proposer un livre</h1>
      </div>
      <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.1rem', marginBottom: '32px', color: '#555' }}>Listez les livres que vous souhaitez échanger !</p>

      {success && (
        <div style={{ marginBottom: '24px', padding: '16px', background: '#f0faf4', border: '2px solid #2d8a4e', borderRadius: '8px', boxShadow: '3px 3px 0px 0px #2d8a4e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} strokeWidth={2.5} color="#2d8a4e" />
          <p style={{ fontFamily: 'Kalam, cursive', color: '#2d8a4e', fontSize: '1.1rem', margin: 0 }}>Livre ajouté avec succès ! Il est maintenant disponible.</p>
        </div>
      )}

      <div className="card" style={{ position: 'relative' }}>
        <div className="tape" />
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
          <div>
            <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', display: 'block', marginBottom: '6px' }}>Titre du livre *</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="input-wobbly" placeholder="ex: Le Petit Prince" />
          </div>
          <div>
            <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', display: 'block', marginBottom: '6px' }}>Genre *</label>
            <select value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="input-wobbly">
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', display: 'block', marginBottom: '6px' }}>État *</label>
            <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="input-wobbly">
              {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', display: 'block', marginBottom: '6px' }}>Description (optionnel)</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-wobbly" placeholder="ex: Couverture légèrement usée, pages en bon état" rows={4} style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ fontFamily: 'Kalam, cursive', fontSize: '1.1rem', display: 'block', marginBottom: '6px' }}>Photo du livre (optionnel)</label>
            {imagePreview ? (
              <div style={{ position: 'relative' }}>
                <img src={imagePreview} alt="Aperçu" style={{ width: '100%', height: '180px', objectFit: 'cover', border: '2px solid #2d2d2d', borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px' }} />
                <button type="button" onClick={handleRemoveImage} style={{ position: 'absolute', top: '8px', right: '8px', background: '#cc3333', color: 'white', border: '2px solid #2d2d2d', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} style={{ width: '100%', height: '120px', border: '2px dashed #2d2d2d', borderRadius: '8px 4px 10px 3px / 4px 10px 3px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fdfbf7', transition: 'background 0.15s ease', gap: '8px' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f0faf4')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fdfbf7')}
              >
                <Camera size={28} strokeWidth={1.5} color="#2d8a4e" />
                <span style={{ fontFamily: 'Patrick Hand, cursive', color: '#555' }}>Cliquez pour ajouter une photo</span>
                <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#888' }}>JPG, PNG, WebP — max 5 Mo</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary" style={{ fontSize: '1.1rem', padding: '14px', opacity: isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Check size={18} strokeWidth={2.5} />
            {isLoading ? 'Ajout en cours...' : 'Ajouter le livre'}
          </button>
        </form>
      </div>
    </div>
  );
}