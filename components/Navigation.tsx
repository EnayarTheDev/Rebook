'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any;
  userRole: string | null;
}

export default function Navigation({ currentPage, setCurrentPage, user, userRole }: NavigationProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-gray-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div
          onClick={() => { setCurrentPage('home'); router.push('/'); }}
          className="cursor-pointer flex items-center gap-2"
        >
          <span className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Re:Book
          </span>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <button onClick={() => setCurrentPage('home')} className={`font-semibold transition-colors ${currentPage === 'home' ? 'text-green-600' : 'text-gray-700 hover:text-green-500'}`}>
                Accueil
              </button>
              <button onClick={() => setCurrentPage('browse')} className={`font-semibold transition-colors ${currentPage === 'browse' ? 'text-green-600' : 'text-gray-700 hover:text-green-500'}`}>
                Parcourir
              </button>
              <button onClick={() => setCurrentPage('offer')} className={`font-semibold transition-colors ${currentPage === 'offer' ? 'text-green-600' : 'text-gray-700 hover:text-green-500'}`}>
                Proposer
              </button>
              <button onClick={() => setCurrentPage('notifications')} className={`font-semibold transition-colors relative ${currentPage === 'notifications' ? 'text-green-600' : 'text-gray-700 hover:text-green-500'}`}>
                Notifications
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">•</span>
              </button>
              {(userRole === 'admin' || userRole === 'owner') && (
                <button onClick={() => setCurrentPage('admin')} className={`font-semibold transition-colors ${currentPage === 'admin' ? 'text-red-600' : 'text-gray-700 hover:text-red-500'}`}>
                  Admin
                </button>
              )}
              <div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)} className="text-gray-700 hover:text-green-500 font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  {user.email?.split('@')[0]}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg py-2 w-48 z-50 border border-gray-200">
                    <p className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200 truncate">{user.email}</p>
                    {userRole && (
                      <p className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
                        Rôle: <span className="font-semibold capitalize">{userRole}</span>
                      </p>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-semibold transition-colors">
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setCurrentPage('home')} className={`font-semibold transition-colors ${currentPage === 'home' ? 'text-green-600' : 'text-gray-700 hover:text-green-500'}`}>
                Accueil
              </button>
              <button onClick={() => setCurrentPage('browse')} className={`font-semibold transition-colors ${currentPage === 'browse' ? 'text-green-600' : 'text-gray-700 hover:text-green-500'}`}>
                Parcourir
              </button>
              <button onClick={() => router.push('/auth/request-approval')} className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:shadow-lg transition-all">
                Commencer
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}