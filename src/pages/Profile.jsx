import React, { useState } from 'react';
import {
  User,
  KeyRound,
  Coins,
  Database,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import avatarPhoto from '../assets/images/avatar_finance_user_1790668201136.jpg';

export function Profile({ onOpenConfig }) {
  const { user, profile, updateProfile, signOut, isConfigured, isDemoMode } = useAuth();
  const { currency, setCurrency, currencies } = useCurrency();
  const toast = useToast();

  const [fullName, setFullName] = useState(
    profile?.full_name || user?.user_metadata?.full_name || ''
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name cannot be empty.');
      return;
    }
    setSavingProfile(true);

    try {
      await updateProfile({ fullName: fullName.trim() });
      toast.success('Profile display name updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfile({ newPassword });
      toast.success('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Account & Preferences
          </h1>
          <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            Settings
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal identity, security credentials, display currency, and cloud database connection
        </p>
      </div>

      {/* Account Overview Hero Card */}
      <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 sm:p-7 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/40 via-violet-50/20 to-transparent rounded-bl-full pointer-events-none"></div>

        <div className="relative group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-gradient-to-tr from-indigo-500 to-violet-600 p-0.5 shadow-[0_8px_20px_rgba(99,102,241,0.3)]">
            <img
              src={avatarPhoto}
              alt={fullName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[22px]"
            />
          </div>
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1.5 relative z-10">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">
              {profile?.full_name || 'Personal Finance User'}
            </h2>
            {isDemoMode ? (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Demo User
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Authenticated
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">{user?.email || 'user@expensetracker.app'}</p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <Coins className="w-4 h-4" />
              Currency: <strong>{currency}</strong>
            </span>
            <span>·</span>
            <span className="text-slate-500">
              Database: <strong className={isConfigured ? 'text-emerald-600' : 'text-amber-600'}>{isConfigured ? 'Supabase PostgreSQL' : 'Local Demo'}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={signOut}
          className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer self-center sm:self-start shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4 stroke-[2.2]" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Grid: Profile Details & Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Personal Information
                </h3>
                <p className="text-xs text-slate-400">Update your public display identity</p>
              </div>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono font-medium cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                  Primary identifier associated with your cloud account.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your Full Name"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Security & Password
                </h3>
                <p className="text-xs text-slate-400">Change your authentication password</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Preferences & Database Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency Preference */}
        <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center">
                <Coins className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Currency & Numbering Format
                </h3>
                <p className="text-xs text-slate-400">Choose your monetary unit and representation</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Default currency is Indian Rupee (INR ₹) with Indian numbering format (e.g., <strong>₹1,00,000.00</strong>). You can seamlessly toggle to international currencies anytime.
            </p>

            <div className="space-y-2.5">
              {currencies.map((c) => (
                <label
                  key={c.code}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all text-xs ${
                    currency === c.code
                      ? 'border-indigo-500 bg-indigo-50/60 text-indigo-950 font-bold shadow-xs'
                      : 'border-slate-200/80 hover:bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="currencySelection"
                      value={c.code}
                      checked={currency === c.code}
                      onChange={() => {
                        setCurrency(c.code);
                        toast.success(`Currency changed to ${c.name} (${c.symbol})`);
                      }}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{c.name}</span>
                  </div>
                  <span className="font-mono tabular-nums text-sm font-extrabold text-indigo-600">
                    {c.symbol}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Supabase Connection Status Card */}
        <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <Database className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Database & Cloud Storage
                </h3>
                <p className="text-xs text-slate-400">Supabase PostgreSQL integration</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isConfigured
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : isDemoMode
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isConfigured ? (
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  )}
                  <div>
                    <strong className="block font-bold text-xs sm:text-sm">
                      {isConfigured
                        ? 'Connected to Supabase PostgreSQL'
                        : isDemoMode
                        ? 'Operating in Demo Workspace'
                        : 'Supabase Not Configured'}
                    </strong>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {isConfigured
                        ? 'Real cloud queries with user-scoped Row Level Security (RLS)'
                        : 'Connect your Supabase project to enable persistent storage'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-500 leading-relaxed text-[11px]">
                The application uses Supabase PostgreSQL for persistent data storage with user-scoped Row Level Security (RLS) policies on <code>profiles</code>, <code>transactions</code>, and <code>budgets</code>.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              {isConfigured ? 'Status: Live Cloud Active' : 'Status: Ready to Connect'}
            </span>
            <button
              onClick={onOpenConfig}
              className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/60 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Configure / View SQL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
