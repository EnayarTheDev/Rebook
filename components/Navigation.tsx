'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { Bell, Settings, LogOut, ChevronDown, Handshake } from 'lucide-react';

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
    <nav style={{
      background: '#fdfbf7',
      borderBottom: '2px solid #2d2d2d',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>

        {/* Logos */}
        <div
          onClick={() => { setCurrentPage('home'); router.push('/'); }}
          style={{
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginRight: '24px',
          }}
        >
          <img
            src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png"
            alt="ReBook"
            style={{ height: '32px', width: 'auto', display: 'block' }}
          />
          <Handshake size={20} strokeWidth={2} color="#2d8a4e" />
          <img
            src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/alhanane-logo-cropped.png"
            alt="Al Hanane 2"
            style={{ height: '50px', width: 'auto', display: 'block' }}
          />
        </div>

        {/* Center nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1, justifyContent: 'center' }}>
          {user ? (
            <>
              {[
                { key: 'home', label: 'Accueil' },
                { key: 'browse', label: 'Parcourir' },
                { key: 'offer', label: 'Proposer' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key)}
                  style={{
                    fontFamily: 'Patrick Hand, cursive',
                    fontSize: '1rem',
                    color: currentPage === item.key ? '#2d8a4e' : '#2d2d2d',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: currentPage === item.key ? 700 : 400,
                    padding: '0',
                    position: 'relative',
                  }}
                >
                  {item.label}
                  {currentPage === item.key && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: '#2d8a4e',
                      borderRadius: '2px',
                    }} />
                  )}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage('notifications')}
                style={{
                  fontFamily: 'Patrick Hand, cursive',
                  fontSize: '1rem',
                  color: currentPage === 'notifications' ? '#2d8a4e' : '#2d2d2d',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: currentPage === 'notifications' ? 700 : 400,
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  position: 'relative',
                }}
              >
                <Bell size={15} strokeWidth={2.5} /> Notifs
                {currentPage === 'notifications' && (
                  <span style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: '#2d8a4e', borderRadius: '2px' }} />
                )}
              </button>
              {(userRole === 'admin' || userRole === 'owner') && (
                <button
                  onClick={() => setCurrentPage('admin')}
                  style={{
                    fontFamily: 'Patrick Hand, cursive',
                    fontSize: '1rem',
                    color: currentPage === 'admin' ? '#2d8a4e' : '#2d2d2d',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: currentPage === 'admin' ? 700 : 400,
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    position: 'relative',
                  }}
                >
                  <Settings size={15} strokeWidth={2.5} /> Admin
                  {currentPage === 'admin' && (
                    <span style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: '#2d8a4e', borderRadius: '2px' }} />
                  )}
                </button>
              )}
            </>
          ) : (
            <>
              {[
                { key: 'home', label: 'Accueil' },
                { key: 'browse', label: 'Parcourir' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key)}
                  style={{
                    fontFamily: 'Patrick Hand, cursive',
                    fontSize: '1rem',
                    color: currentPage === item.key ? '#2d8a4e' : '#2d2d2d',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: currentPage === item.key ? 700 : 400,
                    padding: '0',
                    position: 'relative',
                  }}
                >
                  {item.label}
                  {currentPage === item.key && (
                    <span style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: '#2d8a4e', borderRadius: '2px' }} />
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '24px' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  fontFamily: 'Patrick Hand, cursive',
                  fontSize: '1rem',
                  background: '#ffffff',
                  color: '#2d2d2d',
                  border: '2px solid #2d2d2d',
                  borderRadius: '4px',
                  boxShadow: '3px 3px 0px 0px #2d2d2d',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0px 0px #2d2d2d';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px, 2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0px 0px #2d2d2d';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                }}
              >
                {user.email?.split('@')[0]} <ChevronDown size={14} strokeWidth={2.5} />
              </button>
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: '#fdfbf7',
                  border: '2px solid #2d2d2d',
                  borderRadius: '4px',
                  boxShadow: '4px 4px 0px 0px #2d2d2d',
                  padding: '8px',
                  minWidth: '180px',
                  zIndex: 50,
                }}>
                  <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: '#888', padding: '4px 8px', borderBottom: '1px dashed #2d2d2d', marginBottom: '4px' }}>{user.email}</p>
                  {userRole && (
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: '#2d2d2d', padding: '4px 8px', borderBottom: '1px dashed #2d2d2d', marginBottom: '4px' }}>
                      Rôle: <strong>{userRole}</strong>
                    </p>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      fontFamily: 'Patrick Hand, cursive',
                      background: 'none',
                      border: 'none',
                      color: '#cc3333',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      width: '100%',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <LogOut size={14} strokeWidth={2.5} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth/request-approval')}
              style={{
                fontFamily: 'Patrick Hand, cursive',
                fontSize: '1rem',
                background: '#ffffff',
                color: '#2d2d2d',
                border: '2px solid #2d2d2d',
                borderRadius: '4px',
                boxShadow: '4px 4px 0px 0px #2d2d2d',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: 700,
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0px 0px #2d2d2d';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px, 2px)';
                (e.currentTarget as HTMLButtonElement).style.background = '#2d8a4e';
                (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '4px 4px 0px 0px #2d2d2d';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                (e.currentTarget as HTMLButtonElement).style.color = '#2d2d2d';
              }}
            >
              Commencer
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}