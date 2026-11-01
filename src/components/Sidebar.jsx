import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  PiggyBank,
  TrendingUp,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import avatarPhoto from '../assets/images/avatar_finance_user_1790668201136.jpg';

export function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenConfig,
}) {
  const { user, profile, isConfigured, isDemoMode } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ReceiptText },
    { to: '/budgets', label: 'Budgets', icon: PiggyBank },
    { to: '/analytics', label: 'Analytics', icon: TrendingUp },
    { to: '/profile', label: 'Profile & Settings', icon: UserCog },
  ];

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'user@expensetracker.app';

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white/95 backdrop-blur-md border-r border-slate-200/80 shadow-xs">
      {/* Brand Header & Navigation */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100/90">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(99,102,241,0.35)] transition-transform hover:scale-105">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            {!collapsed && (
              <div className="leading-tight animate-in fade-in duration-200">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm block font-heading bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 bg-clip-text text-transparent">
                  Expense Tracker
                </span>
                <span className="text-[10px] text-indigo-600/80 font-bold uppercase tracking-wider block">
                  Fintech Suite
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-indigo-600'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    {!collapsed && <span>{item.label}</span>}
                    {isActive && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-l-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Zone: Supabase Connection Badge + User Profile Box */}
      <div className="p-3 border-t border-slate-100/90 space-y-2">
        {/* Supabase Connection Status Card */}
        <button
          onClick={onOpenConfig}
          className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 text-xs flex items-center gap-2.5 group ${
            isConfigured
              ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/70'
              : isDemoMode
              ? 'bg-amber-50/70 border-amber-200/80 text-amber-900 hover:bg-amber-100/70'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title="Supabase Database Settings"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isConfigured
                ? 'bg-emerald-100/80 text-emerald-700'
                : isDemoMode
                ? 'bg-amber-100/80 text-amber-700'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
          </div>

          {!collapsed && (
            <div className="flex-1 overflow-hidden leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-bold truncate text-[11px]">
                  {isConfigured ? 'Supabase Live' : isDemoMode ? 'Demo Workspace' : 'Connect DB'}
                </span>
                {isConfigured ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                {isConfigured ? 'PostgreSQL RLS Active' : 'Click to setup keys'}
              </span>
            </div>
          )}
        </button>

        {/* User Profile Mini Card */}
        {!collapsed ? (
          <Link
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-indigo-50/50 transition-colors group border border-transparent hover:border-indigo-100"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 ring-2 ring-indigo-100 shrink-0 shadow-2xs">
              <img
                src={avatarPhoto}
                alt={displayName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden leading-tight">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{displayEmail}</p>
            </div>
          </Link>
        ) : (
          <Link
            to="/profile"
            className="flex justify-center p-1 rounded-xl hover:bg-slate-100"
            title={displayName}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 ring-2 ring-indigo-100 shadow-2xs">
              <img
                src={avatarPhoto}
                alt={displayName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-64 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
