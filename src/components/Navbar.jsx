import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Plus,
  Calendar,
  LogOut,
  User,
  ChevronDown,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import avatarPhoto from '../assets/images/avatar_finance_user_1790668201136.jpg';

export function Navbar({ onMobileMenuClick, onOpenAddTransaction }) {
  const { user, profile, signOut, isDemoMode } = useAuth();
  const { currency, setCurrency, currencies } = useCurrency();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'user@expensetracker.app';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/85 backdrop-blur-md border-b border-indigo-100/70 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-all">
      {/* Left zone: Mobile hamburger & Date indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>{todayFormatted}</span>
          </div>

          {isDemoMode && (
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50/90 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs animate-pulse">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Demo Mode
            </span>
          )}
        </div>
      </div>

      {/* Right zone: Currency Selector, + Add Transaction, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Quick Selector */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-xs font-bold py-1.5 pl-3 pr-7 rounded-xl border border-slate-200 bg-white/90 text-slate-700 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer transition-all shadow-2xs"
            title="Change Currency Display"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Vibrant Gradient Quick Add Transaction Button */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_4px_14px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 ring-2 ring-indigo-200 shadow-2xs shrink-0">
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
            <div className="hidden md:block text-left text-xs leading-tight">
              <span className="font-bold text-slate-900 block truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                {displayEmail}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-indigo-100 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-slate-400 text-[11px] truncate mt-0.5">{displayEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </Link>
                <Link
                  to="/analytics"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium"
                >
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span>Financial Analytics</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
