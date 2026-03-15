'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/pages/HomePage';
import BrowsePage from '@/components/pages/BrowsePage';
import OfferBooksPage from '@/components/pages/OfferBooksPage';
import DetailsPage from '@/components/pages/DetailsPage';
import NotificationsPage from '@/components/pages/NotificationsPage';
import AdminDashboard from '@/components/pages/AdminDashboard';
import ProfilePage from '@/components/pages/ProfilePage';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async (sessionUser: any) => {
      if (!sessionUser) {
        setUser(null);
        setUserRole(null);
        setIsLoading(false);
        return;
      }
      setUser(sessionUser);
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', sessionUser.id).single();
      setUserRole(profile?.role || 'user');
      setIsLoading(false);
    };

    supabase.auth.getUser().then(({ data: { user } }) => loadUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setCurrentPage('details');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fdfbf7' }}>
        <p style={{ fontFamily: 'Kalam, cursive', fontSize: '1.5rem', color: '#2d2d2d' }}>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} userRole={null} />
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', paddingBottom: '90px' }}>
          {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
          {currentPage === 'browse' && <BrowsePage onSelectBook={handleSelectBook} user={user} />}
          {currentPage === 'details' && selectedBookId && (
            <DetailsPage bookId={selectedBookId} setCurrentPage={setCurrentPage} user={user} />
          )}
          {currentPage !== 'home' && currentPage !== 'browse' && currentPage !== 'details' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h2 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', marginBottom: '16px' }}>Connectez-vous pour continuer</h2>
              <button onClick={() => router.push('/auth/request-approval')} className="btn-primary" style={{ fontSize: '1.1rem', padding: '12px 32px' }}>
                Demander l'accès
              </button>
            </div>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} userRole={userRole} />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', paddingBottom: '90px' }}>
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'browse' && <BrowsePage onSelectBook={handleSelectBook} user={user} />}
        {currentPage === 'offer' && <OfferBooksPage setCurrentPage={setCurrentPage} user={user} />}
        {currentPage === 'notifications' && <NotificationsPage user={user} />}
        {currentPage === 'profile' && <ProfilePage user={user} setCurrentPage={setCurrentPage} />}
        {currentPage === 'admin' && (userRole === 'admin' || userRole === 'owner') && <AdminDashboard userRole={userRole} user={user} />}
        {currentPage === 'details' && selectedBookId && (
          <DetailsPage bookId={selectedBookId} setCurrentPage={setCurrentPage} user={user} />
        )}
      </main>
    </>
  );
}