import React from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router';
import {
  LayoutDashboard, Building2, FileText, FileCheck, Receipt,
  Bell, User, TrendingUp, ClipboardList,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/proposals', label: 'Proposal', icon: ClipboardList },
  { to: '/quotations', label: 'Quotes', icon: FileText },
  { to: '/agreements', label: 'Agreements', icon: FileCheck },
  { to: '/invoices', label: 'Invoices', icon: Receipt },
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/companies': 'Companies',
  '/quotations': 'Quotations',
  '/proposals': 'Proposals',
  '/agreements': 'Agreements',
  '/invoices': 'Invoices',
};

export default function Layout() {
  const { logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const title = pageTitles[location.pathname] ?? 'RA & RA';

  return (
    // ✅ FIXED: removed overflow-hidden — it was trapping fixed-position modals
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Header */}
      <header
        className="shrink-0 flex items-center justify-between px-4 pt-safe"
        style={{ background: '#0c1e3d', height: 56 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white text-xs font-bold tracking-widest uppercase">RA & RA</span>
            <span className="text-blue-300 text-[10px] tracking-wide">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20">
            <Bell size={16} className="text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border border-[#0c1e3d]"></span>
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500"
          >
            <User size={15} className="text-white" />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav
        className="shrink-0 fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe"
        style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center h-16">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400 active:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-5 flex items-center justify-center rounded-full transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[9px] font-medium leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}