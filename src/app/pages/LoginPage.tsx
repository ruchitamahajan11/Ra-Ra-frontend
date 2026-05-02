import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Scale, User, Lock, Eye, EyeOff, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const ok = await login(username, password);
    setLoading(false);

    if (ok) {
      navigate('/');
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0c1e3d' }}>

      {/* ── LEFT PANEL — desktop branding (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 px-12 relative overflow-hidden">
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,145,60,0.1) 0%, transparent 70%)',
        }} />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-24 h-24 rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto mb-8">
            <Scale size={48} className="text-blue-300" />
          </div>
          <h1 className="text-white text-4xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            RA & RA Counsel
          </h1>
          <p className="text-blue-300/70 text-sm tracking-widest uppercase mb-10">
            Legal & Advisory Practice
          </p>

          <div className="space-y-4 text-left">
            {[
              { title: 'Agreement Management', desc: 'Draft, review and track all legal agreements' },
              { title: 'Company Directory', desc: 'Manage clients and corporate relationships' },
              { title: 'Invoice & Quotations', desc: 'Streamlined billing and quote generation' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'linear-gradient(135deg, #b4913c, #e8c96a)' }} />
                <div>
                  <p className="text-white text-sm font-semibold" style={{ fontFamily: 'Georgia, serif' }}>{item.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — login form ── */}
      <div className="flex flex-col w-full lg:w-[480px] lg:shrink-0">

        {/* Mobile: top brand area */}
        <div className="lg:hidden flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
          <div className="w-20 h-20 rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-5">
            <Scale size={40} className="text-blue-300" />
          </div>
          <h1 className="text-white text-center" style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
            RA & RA Counsel
          </h1>
        </div>

        {/* Form area */}
        <div
          className="bg-white lg:flex-1 lg:flex lg:flex-col lg:justify-center rounded-t-3xl lg:rounded-none px-6 lg:px-12 pt-8 pb-10"
          style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}
        >
          <div className="lg:max-w-sm lg:w-full lg:mx-auto">
            <h2 className="text-slate-800 mb-1" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Welcome back</h2>
            <p className="text-slate-400 text-sm mb-7">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    placeholder="Enter your username"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    placeholder="Enter your password"
                    required
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 mt-2"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                  : <> Sign In <ChevronRight size={16} /> </>
                }
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
}