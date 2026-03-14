'use client';

import { BookOpen, Leaf, Zap, ArrowRight } from 'lucide-react';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
}

export default function HomePage({ setCurrentPage }: HomePageProps) {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

      <div style={{ position: 'relative', marginBottom: '60px' }}>
        <div className="card" style={{ padding: '48px', position: 'relative', overflow: 'visible' }}>
          <div className="tape" />
          <h1 style={{ fontFamily: 'Kalam, cursive', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#2d2d2d', lineHeight: 1.1, marginBottom: '16px' }}>
            Échangez vos livres<br />
            <span style={{ color: '#2d8a4e' }}>gratuitement !</span>
          </h1>
          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.25rem', color: '#2d2d2d', marginBottom: '32px', maxWidth: '500px' }}>
            La plateforme simple pour échanger vos livres avec d'autres lecteurs. Pas d'argent, juste des livres !
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setCurrentPage('browse')}>
              <BookOpen size={18} strokeWidth={2.5} /> Parcourir les livres
            </button>
            <button className="btn-secondary" style={{ fontSize: '1.1rem', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setCurrentPage('offer')}>
              <ArrowRight size={18} strokeWidth={2.5} /> Proposer un livre
            </button>
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', marginBottom: '24px', transform: 'rotate(-1deg)', display: 'inline-block' }}>
        Pourquoi Re:Book ?
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '60px' }}>
        {[
          { icon: <BookOpen size={32} strokeWidth={2} />, title: 'Gratuit', desc: 'Aucun argent impliqué. Échangez vos livres gratuitement !', rotate: '-1deg', bg: '#ffffff' },
          { icon: <Leaf size={32} strokeWidth={2} />, title: 'Écologique', desc: "Donnez une seconde vie à vos livres. Faites partie de la solution.", rotate: '1deg', bg: '#f0faf4' },
          { icon: <Zap size={32} strokeWidth={2} />, title: 'Simple', desc: "Proposez vos livres et trouvez des partenaires d'échange en quelques minutes.", rotate: '-0.5deg', bg: '#ffffff' },
        ].map((f, i) => (
          <div key={i} className="card" style={{ background: f.bg, transform: `rotate(${f.rotate})`, transition: 'transform 0.1s ease', position: 'relative' }}
            onMouseEnter={e => (e.currentTarget.style.transform = `rotate(${f.rotate === '-1deg' ? '1deg' : '-1deg'})`)}
            onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${f.rotate})`)}
          >
            <div className="tack" />
            <div style={{ color: '#2d8a4e', marginBottom: '12px', marginTop: '8px' }}>{f.icon}</div>
            <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.5rem', marginBottom: '8px' }}>{f.title}</h3>
            <p style={{ fontFamily: 'Patrick Hand, cursive', color: '#2d2d2d', lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="card-yellow" style={{ textAlign: 'center', padding: '48px', position: 'relative' }}>
        <div className="tape" style={{ transform: 'translateX(-50%) rotate(2deg)' }} />
        <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', marginBottom: '16px' }}>Prêt à commencer l'échange ?</h3>
        <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.1rem', marginBottom: '24px' }}>Rejoignez Re:Book aujourd'hui !</p>
        <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '12px 32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => setCurrentPage('browse')}>
          Explorer les livres <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}