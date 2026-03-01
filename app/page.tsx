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
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionUser.id)
        .single();
      setUserRole(profile?.role || 'user');
      setIsLoading(false);
    };

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => loadUser(user));

    // Listen for login/logout changes
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  // Show landing page to unauthenticated users
  if (!user) {
    return (
      <>
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} userRole={null} />
        <main className="container mx-auto px-4 py-12">
          {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
          {currentPage === 'browse' && <BrowsePage onSelectBook={handleSelectBook} user={user} />}
          {currentPage === 'details' && selectedBookId && (
            <DetailsPage bookId={selectedBookId} setCurrentPage={setCurrentPage} user={user} />
          )}
          {currentPage !== 'home' && currentPage !== 'browse' && currentPage !== 'details' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign up to continue</h2>
              <button
                onClick={() => router.push('/auth/request-approval')}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
              >
                Request Access
              </button>
            </div>
          )}
        </main>
      </>
    );
  }

  // Authenticated user view
  return (
    <>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} userRole={userRole} />
      <main className="container mx-auto px-4 py-12">
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'browse' && <BrowsePage onSelectBook={handleSelectBook} user={user} />}
        {currentPage === 'offer' && <OfferBooksPage setCurrentPage={setCurrentPage} user={user} />}
        {currentPage === 'notifications' && <NotificationsPage user={user} />}
        {currentPage === 'admin' && (userRole === 'admin' || userRole === 'owner') && <AdminDashboard userRole={userRole} user={user} />}
        {currentPage === 'details' && selectedBookId && (
          <DetailsPage bookId={selectedBookId} setCurrentPage={setCurrentPage} user={user} />
        )}
      </main>
    </>
  );
}