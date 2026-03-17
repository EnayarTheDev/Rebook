'use client';

import { BookOpen, Leaf, Zap, ArrowRight, Search, HandshakeIcon, CheckCircle } from 'lucide-react';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
}

export default function HomePage({ setCurrentPage }: HomePageProps) {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

      {/* Hero */}
      <div style={{ position: 'relative', marginBottom: '60px' }}>
        <div className="card" style={{ padding: '48px', position: 'relative', overflow: 'visible' }}>
          <div className="tape" />
          <h1 style={{ fontFamily: 'Kalam, cursive', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--fg)', lineHeight: 1.1, marginBottom: '16px' }}>
            Échangez vos livres<br />
            <span style={{ color: 'var(--accent)' }}>gratuitement !</span>
          </h1>
          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.25rem', color: 'var(--fg)', marginBottom: '32px', maxWidth: '500px' }}>
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

      {/* Why ReBook */}
      <h2 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', marginBottom: '24px', transform: 'rotate(-1deg)', display: 'inline-block', color: 'var(--fg)' }}>
        Pourquoi Re:Book ?
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '60px' }}>
        {[
          { icon: <BookOpen size={32} strokeWidth={2} />, title: 'Gratuit', desc: 'Aucun argent impliqué. Échangez vos livres gratuitement !', rotate: '-1deg' },
          { icon: <Leaf size={32} strokeWidth={2} />, title: 'Écologique', desc: "Donnez une seconde vie à vos livres. Faites partie de la solution.", rotate: '1deg' },
          { icon: <Zap size={32} strokeWidth={2} />, title: 'Simple', desc: "Proposez vos livres et trouvez des partenaires d'échange en quelques minutes.", rotate: '-0.5deg' },
        ].map((f, i) => (
          <div key={i} className="card" style={{ transform: `rotate(${f.rotate})`, transition: 'transform 0.1s ease', position: 'relative' }}
            onMouseEnter={e => (e.currentTarget.style.transform = `rotate(${f.rotate === '-1deg' ? '1deg' : '-1deg'})`)}
            onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${f.rotate})`)}
          >
            <div className="tack" />
            <div style={{ color: 'var(--accent)', marginBottom: '12px', marginTop: '8px' }}>{f.icon}</div>
            <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.5rem', marginBottom: '8px', color: 'var(--fg)' }}>{f.title}</h3>
            <p style={{ fontFamily: 'Patrick Hand, cursive', color: 'var(--subtle)', lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* How it Works */}
      <h2 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', marginBottom: '32px', transform: 'rotate(0.5deg)', display: 'inline-block', color: 'var(--fg)' }}>
        Comment ça marche ?
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '60px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '27px', top: '40px', bottom: '40px', width: '2px', borderLeft: '2px dashed var(--muted)', zIndex: 0 }} />
        {[
          { icon: <Search size={24} strokeWidth={2.5} />, step: '1', title: 'Parcourez les livres', desc: 'Recherchez parmi les livres disponibles proposés par vos camarades. Filtrez par genre ou état.', rotate: '-0.5deg' },
          { icon: <HandshakeIcon size={24} strokeWidth={2.5} />, step: '2', title: 'Proposez un échange', desc: "Sélectionnez un livre qui vous intéresse et proposez un de vos livres en échange. C'est gratuit !", rotate: '0.5deg' },
          { icon: <CheckCircle size={24} strokeWidth={2.5} />, step: '3', title: "Finalisez l'échange", desc: "Le propriétaire accepte votre offre. Vous recevez un code d'échange à présenter au bureau d'administration.", rotate: '-0.3deg' },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--accent)', border: '2px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '3px 3px 0px 0px var(--shadow)', color: '#ffffff' }}>
              {step.icon}
            </div>
            <div className="card" style={{ flex: 1, transform: `rotate(${step.rotate})`, transition: 'transform 0.1s ease' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(0deg)')}
              onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${step.rotate})`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.8rem', background: 'var(--yellow)', border: '1px solid var(--accent)', borderRadius: '255px', padding: '2px 8px', color: 'var(--accent)' }}>Étape {step.step}</span>
                <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '1.3rem', margin: 0, color: 'var(--fg)' }}>{step.title}</h3>
              </div>
              <p style={{ fontFamily: 'Patrick Hand, cursive', color: 'var(--subtle)', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="card-yellow" style={{ textAlign: 'center', padding: '48px', position: 'relative', marginBottom: '60px' }}>
        <div className="tape" style={{ transform: 'translateX(-50%) rotate(2deg)' }} />
        <h3 style={{ fontFamily: 'Kalam, cursive', fontSize: '2rem', marginBottom: '16px', color: 'var(--fg)' }}>Prêt à commencer l'échange ?</h3>
        <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1.1rem', marginBottom: '24px', color: 'var(--subtle)' }}>Rejoignez Re:Book aujourd'hui !</p>
        <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '12px 32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => setCurrentPage('browse')}>
          Explorer les livres <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px dashed var(--muted)', paddingTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/rebook-logo-cropped.png" alt="ReBook" style={{ height: '24px', width: 'auto' }} />
          <span style={{ fontFamily: 'Patrick Hand, cursive', color: 'var(--subtle)', fontSize: '0.9rem' }}>×</span>
          <img src="https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/alhanane-logo-cropped.png" alt="Al Hanane 2" style={{ height: '24px', width: 'auto' }} />
        </div>
        <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.9rem', color: 'var(--subtle)', margin: 0, textAlign: 'center' }}>
          Un projet de l'Institution Al Hanane 2 — Collège & Lycée
        </p>
        <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '0.85rem', color: 'var(--muted-text)', margin: 0 }}>
          Développé par Enayar • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}