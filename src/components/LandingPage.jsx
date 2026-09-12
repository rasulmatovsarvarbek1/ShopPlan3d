import React from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  ArrowRight, LayoutGrid, Box, DollarSign,
  Sparkles, CheckCircle2, Star, Zap, TrendingUp
} from 'lucide-react';


export const LandingPage = () => {
  const { setActivePage } = useAppStore();

  return (
    <div className="animate-fade-in">
      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={13} />
          Interaktiv 3D Do'kon Rejalashtiruvchi
        </div>

        <h1 className="hero-title">
          Do'koningizni ochishdan oldin<br />
          <span>3D rejada ko'ring va smetasini hisoblang</span>
        </h1>

        <p className="hero-subtitle">
          Oziq-ovqat, kiyim, fitnes, kosmetika va 10+ turdagi bizneslar uchun xona o'lchamlarini slayder bilan o'zgartirib, jihozlar smetasini aniq hisoblang — barchasi real vaqtda.
        </p>

        <div className="hero-buttons">
          <button
            className="btn-primary"
            style={{ padding: '14px 32px', fontSize: '1.05rem' }}
            onClick={() => setActivePage('selector')}
          >
            Biznes Turini Tanlash
            <ArrowRight size={18} />
          </button>

          <button
            className="btn-secondary"
            style={{ padding: '14px 26px', fontSize: '0.98rem' }}
            onClick={() => setActivePage('planner')}
          >
            <Box size={18} />
            3D Demo Ko'rish
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '3rem',
          padding: '1.25rem 2rem',
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '600px',
          margin: '3rem auto 0'
        }}>
          {[
            { value: '10+', label: 'Biznes Shabloni' },
            { value: '3D', label: 'Drag & Drop' },
            { value: '∞', label: 'Loyiha Saqlash' },
          ].map(({ value, label }, i) => (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS BANNER ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 4rem', padding: '0 3rem' }}>
        <div style={{
          background: '#fff',
          border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{
              background: 'var(--accent-emerald-light)',
              color: 'var(--accent-emerald)',
              padding: '4px 12px',
              borderRadius: '99px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              QANDAY ISHLAYDI?
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              3 ta oddiy qadam
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: <LayoutGrid size={18} />, color: 'var(--accent-blue)', title: '1. Biznes turini tanlang', desc: 'Oziq-ovqat, Kiyim, Fitnes, Kosmetika va 10+ shablondan birini tanlang.' },
                { icon: <Box size={18} />, color: 'var(--accent-violet)', title: '2. O\'lchamni o\'zgartiring', desc: 'Slayder bilan xona eni/bo\'yini o\'zgartiring — 3D maydon darhol moslashadi.' },
                { icon: <TrendingUp size={18} />, color: 'var(--accent-emerald)', title: '3. Smetani oling', desc: 'Jihozlar, tovarlar va ta\'mirlash narxi real vaqtda hisoblanadi.' },
              ].map(({ icon, color, title, desc }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: color === 'var(--accent-blue)' ? 'var(--accent-blue-light)' : color === 'var(--accent-violet)' ? 'var(--accent-violet-light)' : 'var(--accent-emerald-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{title}</div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.75rem' }}>
              <button className="btn-primary" onClick={() => setActivePage('selector')}>
                Hoziroq Boshlash <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Demo card */}
          <div style={{
            background: 'linear-gradient(145deg, #eff6ff 0%, #f0fdf4 100%)',
            borderRadius: '18px',
            border: '1.5px solid var(--border-color)',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Namuna Smeta — Fitnes Zal
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '0.1rem' }}>
              250 m²
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Xona: 12m × 18m × 3.5m balandlik
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Jihozlar', value: '$28,500', color: 'var(--accent-blue-light)', textColor: 'var(--accent-blue)' },
                { label: 'Tovarlar', value: '$10,000', color: 'var(--accent-emerald-light)', textColor: 'var(--accent-emerald)' },
                { label: 'Ta\'mirlash', value: '$22,500', color: 'var(--accent-violet-light)', textColor: 'var(--accent-violet)' },
              ].map(({ label, value, color, textColor }, i) => (
                <div key={i} style={{ background: color, padding: '10px 8px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: textColor, fontWeight: 700 }}>{label}</div>
                  <div style={{ fontWeight: 800, color: textColor, fontSize: '0.9rem' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1.5px solid var(--border-color)', borderRadius: '12px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Jami Smeta</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>$61,000</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURE CARDS ── */}
      <div className="features-grid">
        {[
          {
            icon: <LayoutGrid size={24} />,
            bg: 'var(--accent-blue-light)',
            color: 'var(--accent-blue)',
            title: '10+ Biznes Shabloni',
            desc: 'Oziq-ovqat, kiyim, fitnes, kosmetika, elektronika, kofe va dorixonalar uchun tayyor jihozlar to\'plami.'
          },
          {
            icon: <Box size={24} />,
            bg: 'var(--accent-violet-light)',
            color: 'var(--accent-violet)',
            title: 'Drag & Drop 3D',
            desc: 'Har bir jihozni sichqoncha bilan ushlab, 3D maydonda xohlagan joyga suring — qulay va intuitiv.'
          },

          {
            icon: <DollarSign size={24} />,
            bg: 'var(--accent-amber-light)',
            color: 'var(--accent-amber)',
            title: 'Byudjet Kalkulyatori',
            desc: 'O\'z byudjetingizni kiriting — Ekonom, Standart va Premium paketlar ichida o\'z optimalingizni toping.'
          },
        ].map(({ icon, bg, color, title, desc }, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon" style={{ background: bg, color }}>
              {icon}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── CTA BANNER ── */}
      <div style={{ maxWidth: '1100px', margin: '2rem auto 5rem', padding: '0 3rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-indigo) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          color: '#fff',
          boxShadow: 'var(--shadow-glow-blue)'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Biznesingizni bugun rejalashtiring!
          </h2>
          <p style={{ opacity: 0.85, marginBottom: '1.75rem', fontSize: '1rem' }}>
            10 turdagi biznes shablonlaridan birini tanlab, 3D rejangizni yarating va smetangizni PDF shaklida yuklab oling.
          </p>
          <button
            className="btn-secondary"
            style={{ background: '#fff', color: 'var(--accent-blue)', padding: '13px 32px', fontSize: '1rem', fontWeight: 800, border: 'none' }}
            onClick={() => setActivePage('selector')}
          >
            Loyiha Boshlash <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
