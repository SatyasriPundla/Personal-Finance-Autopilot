import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-indigo-100 shadow-[0_20px_50px_rgba(99,102,241,0.08)]">
        <span className="text-7xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent block">
          404
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900 font-heading">
          Page Not Found
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
          The requested financial screen does not exist or may have been relocated.
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
