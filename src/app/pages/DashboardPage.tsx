import React, { useEffect, useState } from 'react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', emoji: '🌤️' };
  if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

function getDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function DashboardPage() {
  const greeting = getGreeting();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'linear-gradient(160deg, #f8f6f0 0%, #edeae0 100%)',
        fontFamily: "'Georgia', serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 260, height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(12,30,61,0.07) 0%, transparent 70%)',
        animation: 'pulse 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: 120, left: -80,
        width: 200, height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(180,145,60,0.08) 0%, transparent 70%)',
        animation: 'pulse 8s ease-in-out infinite 2s',
      }} />

      {/* Decorative geometric lines */}
      <svg
        style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06 }}
        width="200" height="200" viewBox="0 0 200 200"
      >
        <circle cx="200" cy="0" r="80" fill="none" stroke="#0c1e3d" strokeWidth="1" />
        <circle cx="200" cy="0" r="120" fill="none" stroke="#0c1e3d" strokeWidth="0.5" />
        <circle cx="200" cy="0" r="160" fill="none" stroke="#b4913c" strokeWidth="0.5" />
      </svg>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .fade-up-1 { animation: fadeUp 0.6s ease forwards; opacity: 0; animation-delay: 0.1s; }
        .fade-up-2 { animation: fadeUp 0.6s ease forwards; opacity: 0; animation-delay: 0.25s; }
        .fade-up-3 { animation: fadeUp 0.6s ease forwards; opacity: 0; animation-delay: 0.4s; }
        .fade-up-4 { animation: fadeUp 0.6s ease forwards; opacity: 0; animation-delay: 0.55s; }
        .fade-up-5 { animation: fadeUp 0.6s ease forwards; opacity: 0; animation-delay: 0.7s; }
        .gold-shimmer {
          background: linear-gradient(90deg, #b4913c, #e8c96a, #b4913c, #c9a84c);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(12,30,61,0.12);
        }
        .stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>

      {/* ── CONTENT — max width constrains on desktop ── */}
      <div style={{
        padding: '2rem 1.5rem 2rem',
        position: 'relative',
        zIndex: 1,
        maxWidth: '960px',
        margin: '0 auto',
      }}>

        {/* Greeting */}
        <div className="fade-up-1">
          <p style={{
            color: '#9a8c6e',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '0.25rem',
          }}>
            {greeting.emoji} {greeting.text}
          </p>
          <p style={{ color: '#b0a080', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
            {getDate()}
          </p>
        </div>

        {/* Main Title Block */}
        <div className="fade-up-2" style={{ marginTop: '1.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 3, height: 36,
              background: 'linear-gradient(180deg, #b4913c, #e8c96a)',
              borderRadius: 2, flexShrink: 0,
            }} />
            <div>
              <h1 style={{
                color: '#0c1e3d', fontSize: '1.75rem', fontWeight: 700,
                lineHeight: 1.1, letterSpacing: '-0.01em',
              }}>Ra & Ra</h1>
              <h1 className="gold-shimmer" style={{
                fontSize: '1.75rem', fontWeight: 700,
                lineHeight: 1.1, letterSpacing: '-0.01em',
              }}>Counsel</h1>
            </div>
          </div>
          <p style={{
            color: '#8a7d60', fontSize: '0.72rem',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            marginTop: '0.6rem', paddingLeft: '0.9rem',
          }}>
            Legal & Advisory Practice
          </p>
        </div>

        {/* Ornamental divider */}
        <div className="fade-up-3" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '2rem 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #c9a84c44)' }} />
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L10.5 7H17L11.5 10.5L13.5 17L9 13L4.5 17L6.5 10.5L1 7H7.5L9 1Z"
              stroke="#b4913c" strokeWidth="1" fill="rgba(180,145,60,0.12)" />
          </svg>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #c9a84c44, transparent)' }} />
        </div>

        {/* ── RESPONSIVE LAYOUT: 1 column on mobile, 2 columns on desktop ── */}
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-5 mb-5">

          {/* Pillars card */}
          <div className="fade-up-3" style={{
            background: 'linear-gradient(135deg, #0c1e3d 0%, #1a3a6b 100%)',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(12,30,61,0.18)',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30,
              width: 140, height: 140, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(180,145,60,0.15) 0%, transparent 70%)',
            }} />
            <p style={{
              color: '#b4913c', fontSize: '0.65rem',
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem',
            }}>Our Practice</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Corporate Advisory', desc: 'Structuring, compliance & governance' },
                { label: 'Agreements & Contracts', desc: 'Drafting, review & negotiation' },
                { label: 'Dispute Resolution', desc: 'Mediation & legal representation' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #b4913c, #e8c96a)',
                    marginTop: 5, flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ color: '#e8e0cc', fontSize: '0.82rem', fontWeight: 600 }}>{item.label}</p>
                    <p style={{ color: '#7a91b8', fontSize: '0.68rem', marginTop: 1 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote block */}
          <div className="fade-up-4 flex flex-col justify-center p-6 bg-white/75 rounded-2xl border-l-[3px] border-[#b4913c] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <p style={{
              color: '#9a8c6e', fontSize: '0.65rem',
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem',
            }}>Philosophy</p>
            <p style={{
              color: '#0c1e3d', fontSize: '0.95rem',
              fontStyle: 'italic', lineHeight: 1.75,
            }}>
              "Justice is the foundation upon which every enduring agreement is built."
            </p>
            <p style={{
              color: '#b4913c', fontSize: '0.65rem',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '1rem',
            }}>— Ra & Ra Counsel</p>
          </div>

        </div>

        {/* Stats strip - 1 column mobile, 3 columns tablet/desktop */}
        <div className="fade-up-5 grid grid-cols-1 tablet:grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Est.', value: '2024' },
            { label: 'Focus', value: 'B2B' },
            { label: 'Service', value: '24/7' },
          ].map((item, i) => (
            <div key={i} className="stat-card" style={{
              background: 'rgba(255,255,255,0.65)',
              borderRadius: '0.875rem',
              padding: '0.875rem 0.5rem',
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(180,145,60,0.15)',
            }}>
              <p style={{ color: '#0c1e3d', fontSize: '1rem', fontWeight: 700 }}>{item.value}</p>
              <p style={{
                color: '#9a8c6e', fontSize: '0.62rem',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2,
              }}>{item.label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}