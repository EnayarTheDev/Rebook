'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

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
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Roman',
    condition: 'excellent',
    description: '',
  });

  const genres = ['Roman', 'Poésie', 'Théâtre', 'Comédie', 'Drame', 'Science-Fiction', 'Fantastique', 'Policier', 'Biographie', 'Histoire', 'Philosophie', 'Autre'];
  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good',      label: 'Bon' },
    { value: 'fair',      label: 'Correct' },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Veuillez sélectionner une image (JPG, PNG, etc.)'); return; }
    if (file.size > 5 * 1024 * 1024) { alert("L'image ne doit pas dépasser 5 Mo"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { alert('Veuillez entrer un titre'); return; }
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Vous devez être connecté pour ajouter un livre. Veuillez vous reconnecter.');

      let cover_url: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const filePath = `${session.user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(filePath, imageFile, { upsert: false });
        if (uploadError) throw new Error('Erreur upload image : ' + uploadError.message);
        const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(filePath);
        cover_url = urlData.publicUrl;
      }

      const { error } = await supabase.from('books').insert([{
        user_id: session.user.id,
        title: formData.title,
        subject: formData.subject,
        level: 'N/A',
        condition: formData.condition,
        description: formData.description,
        is_available: true,
        cover_url,
      }]);

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
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposer un livre</h1>
        <p className="text-gray-600 mb-8">Listez les livres que vous souhaitez échanger avec d'autres lecteurs</p>

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            ✓ Livre ajouté avec succès. Il est maintenant disponible pour l'échange.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Titre du livre *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" placeholder="ex: Le Petit Prince" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Genre *</label>
            <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">État *</label>
            <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
              {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optionnel)</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500" placeholder="ex: Couverture légèrement usée, pages en bon état" rows={4} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Photo du livre (optionnel)</label>
            {imagePreview ? (
              <div className="relative w-full">
                <img src={imagePreview} alt="Aperçu" className="w-full h-48 object-cover rounded-lg border-2 border-green-400" />
                <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold hover:bg-red-600 shadow">✕</button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                <span className="text-sm text-gray-500 font-medium">Cliquez pour ajouter une photo</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5 Mo</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Ajout en cours...' : 'Ajouter le livre'}
          </button>
        </form>
      </div>
    </div>
  );
}
