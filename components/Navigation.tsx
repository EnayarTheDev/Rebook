'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Bell, Settings, LogOut, ChevronDown, Home, BookOpen, PenLine, User } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any;
  userRole: string | null;
}

export default function Navigation({ currentPage, setCurrentPage, user, userRole }: NavigationProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const tabItems = [
    { key: 'home', label: 'Accueil', icon: <Home size={22} strokeWidth={2.5} /> },
    { key: 'browse', label: 'Parcourir', icon: <BookOpen size={22} strokeWidth={2.5} /> },
    { key: 'offer', label: 'Proposer', icon: <PenLine size={22} strokeWidth={2.5} /> },
    { key: 'notifications', label: 'Notifs', icon: <Bell size={22} strokeWidth={2.5} /> },
    { key: 'profile', label: 'Profil', icon: <User size={22} strokeWidth={2.5} /> },
    ...(userRole === 'admin' || userRole === 'owner' ? [{ key: 'admin', label: 'Admin', icon: <Settings size={22} strokeWidth={2.5} /> }] : []),
  ];

  const navLinks = user ? [
    { key: 'home', label: 'Accueil', icon: null },
    { key: 'browse', label: 'Parcourir', icon: null },
    { key: 'offer', label: 'Proposer', icon: null },
    { key: 'notifications', label: 'Notifs', icon: <Bell size={14} strokeWidth={2.5} /> },
    ...(userRole === 'admin' || userRole === 'owner' ? [{ key: 'admin', label: 'Admin', icon: <Settings size={14} strokeWidth={2.5} /> }] : []),
  ] : [
    { key: 'home', label: 'Accueil', icon: null },
    { key: 'browse', label: 'Parcourir', icon: null },
  ];

  return (
    <>
      {/* ── Desktop Floating Pill Nav ── */}
      <div className="desktop-nav" style={{
        position: 'sticky',
        top: '14px',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 20px',
        marginBottom: '28px',
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          background: '#fdfbf7',
          border: '2px solid #2d2d2d',
          borderRadius: '999px',
          padding: '10px 14px',
          boxShadow: scrolled ? '6px 6px 0px 0px #2d2d2d' : '4px 4px 0px 0px #2d2d2d',
          transition: 'box-shadow 0.2s ease',
          maxWidth: '980px',
          width: '100%',
        }}>

          {/* Logos */}
          <div
            onClick={() => { setCurrentPage('home'); router.push('/'); }}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}
          >
            <img
              src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png"
              alt="ReBook"
              style={{ height: '30px', width: 'auto' }}
            />
            <div style={{ width: '1px', height: '22px', background: '#e5e0d8', flexShrink: 0 }} />
            <img
              src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/alhanane-logo-cropped.png"
              alt="Al Hanane 2"
              style={{ height: '44px', width: 'auto' }}
            />
          </div>

          {/* Center links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center' }}>
            {navLinks.map((item: any) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                style={{
                  fontFamily: 'Patrick Hand, cursive',
                  fontSize: '1rem',
                  color: currentPage === item.key ? '#ffffff' : '#2d2d2d',
                  background: currentPage === item.key ? '#2d8a4e' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '7px 14px',
                  borderRadius: '999px',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: currentPage === item.key ? 700 : 400,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (currentPage !== item.key) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#f0faf4';
                    (e.currentTarget as HTMLButtonElement).style.color = '#2d8a4e';
                  }
                }}
                onMouseLeave={e => {
                  if (currentPage !== item.key) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = '#2d2d2d';
                  }
                }}
              >
                {item.icon && item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    fontFamily: 'Patrick Hand, cursive',
                    fontSize: '1rem',
                    background: '#2d8a4e',
                    color: '#ffffff',
                    border: '2px solid #2d2d2d',
                    borderRadius: '999px',
                    padding: '7px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    fontWeight: 600,
                    boxShadow: '2px 2px 0px 0px #2d2d2d',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#1a6b3a';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0px 0px #2d2d2d';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translate(1px, 1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#2d8a4e';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0px 0px #2d2d2d';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                  }}
                >
                  {user.email?.split('@')[0]} <ChevronDown size={14} strokeWidth={2.5} />
                </button>
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 10px)',
                    background: '#fdfbf7',
                    border: '2px solid #2d2d2d',
                    borderRadius: '16px',
                    padding: '8px',
                    minWidth: '200px',
                    zIndex: 50,
                    boxShadow: '4px 4px 0px 0px #2d2d2d',
                  }}>
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#888', padding: '6px 10px', borderBottom: '1px dashed #e5e0d8', marginBottom: '4px' }}>{user.email}</p>
                    {userRole && (
                      <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: '#555', padding: '6px 10px', borderBottom: '1px dashed #e5e0d8', marginBottom: '4px' }}>
                        Rôle: <span style={{ color: '#2d8a4e', fontWeight: 700 }}>{userRole}</span>
                      </p>
                    )}
                    <button
                      onClick={() => { setCurrentPage('profile'); setShowDropdown(false); }}
                      style={{ fontFamily: 'Patrick Hand, cursive', background: 'none', border: 'none', color: '#2d2d2d', cursor: 'pointer', padding: '7px 10px', width: '100%', textAlign: 'left', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', transition: 'background 0.1s ease' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f0faf4'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                    >
                      <User size={14} strokeWidth={2.5} /> Mon profil
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{ fontFamily: 'Patrick Hand, cursive', background: 'none', border: 'none', color: '#cc3333', cursor: 'pointer', padding: '7px 10px', width: '100%', textAlign: 'left', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', transition: 'background 0.1s ease' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fde8e8'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
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
                  background: '#2d8a4e',
                  color: '#ffffff',
                  border: '2px solid #2d2d2d',
                  borderRadius: '999px',
                  padding: '7px 20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                  boxShadow: '2px 2px 0px 0px #2d2d2d',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1a6b3a';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0px 0px #2d2d2d';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(1px, 1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#2d8a4e';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0px 0px #2d2d2d';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                }}
              >
                Commencer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Top Bar ── */}
      <div className="mobile-nav" style={{
        background: '#fdfbf7',
        borderBottom: '2px solid #2d2d2d',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}>
        <div onClick={() => { setCurrentPage('home'); router.push('/'); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png" alt="ReBook" style={{ height: '26px', width: 'auto' }} />
          <div style={{ width: '1px', height: '18px', background: '#e5e0d8' }} />
          <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/alhanane-logo-cropped.png" alt="Al Hanane 2" style={{ height: '39px', width: 'auto' }} />
        </div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: '#555' }}>{user.email?.split('@')[0]}</span>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc3333', display: 'flex', alignItems: 'center' }}>
              <LogOut size={16} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/auth/request-approval')}
            style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', background: '#2d8a4e', color: '#ffffff', border: '2px solid #2d2d2d', borderRadius: '999px', padding: '6px 14px', cursor: 'pointer', boxShadow: '2px 2px 0px 0px #2d2d2d' }}
          >
            Commencer
          </button>
        )}
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      {user && (
        <div className="mobile-bottom-bar" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fdfbf7',
          borderTop: '2px solid #2d2d2d',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '8px 0',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
          zIndex: 50,
          boxShadow: '0 -4px 0px 0px #2d2d2d',
        }}>
          {tabItems.map(item => (
            <button
              key={item.key}
              onClick={() => setCurrentPage(item.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: currentPage === item.key ? '#2d8a4e' : '#888',
                padding: '4px 8px',
                flex: 1,
                transition: 'color 0.1s ease',
              }}
            >
              {item.icon}
              <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.65rem' }}>{item.label}</span>
              {currentPage === item.key && (
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#2d8a4e', marginTop: '2px' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}