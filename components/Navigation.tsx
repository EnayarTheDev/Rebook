'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Bell, Settings, LogOut, ChevronDown, Home, BookOpen, PenLine, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

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
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

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

  const navBg = isDark ? '#1e1e1e' : '#fdfbf7';
  const navBorder = isDark ? '#3a3a3a' : '#2d2d2d';
  const navShadow = isDark ? '#000000' : '#2d2d2d';
  const textColor = isDark ? '#eeeae0' : '#2d2d2d';
  const mutedText = isDark ? '#777' : '#888';
  const dropdownBg = isDark ? '#1a1a1a' : '#fdfbf7';
  const hoverBg = isDark ? 'rgba(61,186,106,0.1)' : '#f0faf4';
  const dividerColor = isDark ? '#2a2a2a' : '#e5e0d8';

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
          background: navBg,
          border: `2px solid ${navBorder}`,
          borderRadius: '999px',
          padding: '10px 14px',
          boxShadow: scrolled ? `6px 6px 0px 0px ${navShadow}` : `4px 4px 0px 0px ${navShadow}`,
          transition: 'box-shadow 0.2s ease, background 0.2s ease',
          maxWidth: '980px',
          width: '100%',
        }}>

          {/* Logos — no filter, transparent backgrounds work on both themes */}
          <div
            onClick={() => { setCurrentPage('home'); router.push('/'); }}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}
          >
            <img
              src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png"
              alt="ReBook"
              style={{ height: '30px', width: 'auto', display: 'block' }}
            />
            <div style={{ width: '1px', height: '22px', background: dividerColor, flexShrink: 0 }} />
            <img
              src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/alhanane-logo-cropped.png"
              alt="Al Hanane 2"
              style={{ height: '48px', width: 'auto', display: 'block' }}
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
                  color: currentPage === item.key ? '#ffffff' : textColor,
                  background: currentPage === item.key ? (isDark ? '#3dba6a' : '#2d8a4e') : 'transparent',
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
                    (e.currentTarget as HTMLButtonElement).style.background = hoverBg;
                    (e.currentTarget as HTMLButtonElement).style.color = isDark ? '#3dba6a' : '#2d8a4e';
                  }
                }}
                onMouseLeave={e => {
                  if (currentPage !== item.key) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = textColor;
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

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              style={{
                background: 'none',
                border: `2px solid ${navBorder}`,
                borderRadius: '999px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: textColor,
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
            >
              {isDark ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
            </button>

            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    fontFamily: 'Patrick Hand, cursive',
                    fontSize: '1rem',
                    background: isDark ? '#3dba6a' : '#2d8a4e',
                    color: '#ffffff',
                    border: `2px solid ${navBorder}`,
                    borderRadius: '999px',
                    padding: '7px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    fontWeight: 600,
                    boxShadow: `2px 2px 0px 0px ${navShadow}`,
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#1a6b3a';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `1px 1px 0px 0px ${navShadow}`;
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translate(1px, 1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#3dba6a' : '#2d8a4e';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `2px 2px 0px 0px ${navShadow}`;
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
                    background: dropdownBg,
                    border: `2px solid ${navBorder}`,
                    borderRadius: '16px',
                    padding: '8px',
                    minWidth: '200px',
                    zIndex: 50,
                    boxShadow: `4px 4px 0px 0px ${navShadow}`,
                  }}>
                    <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: mutedText, padding: '6px 10px', borderBottom: `1px dashed ${dividerColor}`, marginBottom: '4px' }}>{user.email}</p>
                    {userRole && (
                      <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', color: mutedText, padding: '6px 10px', borderBottom: `1px dashed ${dividerColor}`, marginBottom: '4px' }}>
                        Rôle: <span style={{ color: isDark ? '#3dba6a' : '#2d8a4e', fontWeight: 700 }}>{userRole}</span>
                      </p>
                    )}
                    <button
                      onClick={() => { setCurrentPage('profile'); setShowDropdown(false); }}
                      style={{ fontFamily: 'Patrick Hand, cursive', background: 'none', border: 'none', color: textColor, cursor: 'pointer', padding: '7px 10px', width: '100%', textAlign: 'left', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', transition: 'background 0.1s ease' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                    >
                      <User size={14} strokeWidth={2.5} /> Mon profil
                    </button>
                    <button
                      onClick={toggleTheme}
                      style={{ fontFamily: 'Patrick Hand, cursive', background: 'none', border: 'none', color: textColor, cursor: 'pointer', padding: '7px 10px', width: '100%', textAlign: 'left', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', transition: 'background 0.1s ease' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = hoverBg}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                    >
                      {isDark ? <Sun size={14} strokeWidth={2.5} /> : <Moon size={14} strokeWidth={2.5} />}
                      {isDark ? 'Mode clair' : 'Mode sombre'}
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{ fontFamily: 'Patrick Hand, cursive', background: 'none', border: 'none', color: '#ff5555', cursor: 'pointer', padding: '7px 10px', width: '100%', textAlign: 'left', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', transition: 'background 0.1s ease' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,85,85,0.1)' : '#fde8e8'}
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
                  background: isDark ? '#3dba6a' : '#2d8a4e',
                  color: '#ffffff',
                  border: `2px solid ${navBorder}`,
                  borderRadius: '999px',
                  padding: '7px 20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                  boxShadow: `2px 2px 0px 0px ${navShadow}`,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1a6b3a';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `1px 1px 0px 0px ${navShadow}`;
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(1px, 1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#3dba6a' : '#2d8a4e';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `2px 2px 0px 0px ${navShadow}`;
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
        background: navBg,
        borderBottom: `2px solid ${navBorder}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        transition: 'background 0.2s ease',
      }}>
        <div onClick={() => { setCurrentPage('home'); router.push('/'); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png" alt="ReBook" style={{ height: '26px', width: 'auto' }} />
          <div style={{ width: '1px', height: '18px', background: dividerColor }} />
          <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/alhanane-logo-cropped.png" alt="Al Hanane 2" style={{ height: '40px', width: 'auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleTheme}
            style={{ background: 'none', border: `2px solid ${navBorder}`, borderRadius: '999px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: textColor }}
          >
            {isDark ? <Sun size={14} strokeWidth={2.5} /> : <Moon size={14} strokeWidth={2.5} />}
          </button>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: textColor }}>{user.email?.split('@')[0]}</span>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff5555', display: 'flex', alignItems: 'center' }}>
                <LogOut size={16} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth/request-approval')}
              style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', background: isDark ? '#3dba6a' : '#2d8a4e', color: '#ffffff', border: `2px solid ${navBorder}`, borderRadius: '999px', padding: '6px 14px', cursor: 'pointer', boxShadow: `2px 2px 0px 0px ${navShadow}` }}
            >
              Commencer
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      {user && (
        <div className="mobile-bottom-bar" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: navBg,
          borderTop: `2px solid ${navBorder}`,
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '8px 0',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
          zIndex: 50,
          boxShadow: `0 -4px 0px 0px ${navShadow}`,
          transition: 'background 0.2s ease',
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
                color: currentPage === item.key ? (isDark ? '#3dba6a' : '#2d8a4e') : mutedText,
                padding: '4px 8px',
                flex: 1,
                transition: 'color 0.1s ease',
              }}
            >
              {item.icon}
              <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.65rem' }}>{item.label}</span>
              {currentPage === item.key && (
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: isDark ? '#3dba6a' : '#2d8a4e', marginTop: '2px' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}