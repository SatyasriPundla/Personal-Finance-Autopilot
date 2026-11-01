import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = 'Loading financial data...', size = 'default' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-7 h-7',
    large: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 animate-ping absolute opacity-60"></div>
        <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin text-indigo-600 mb-2 relative`} />
      </div>
      {text && <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-3">{text}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded-lg w-28"></div>
        <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
      </div>
      <div className="h-9 bg-slate-200 rounded-xl w-36"></div>
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <div className="h-4 bg-slate-100 rounded-full w-14"></div>
        <div className="h-3 bg-slate-100 rounded w-24"></div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="h-6 bg-slate-200 rounded-xl w-48"></div>
        <div className="h-9 bg-slate-100 rounded-xl w-32"></div>
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50">
          <div className="flex items-center gap-3 w-1/3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 shrink-0"></div>
            <div className="space-y-1.5 w-full">
              <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-6 bg-slate-100 rounded-full w-24"></div>
          <div className="h-4 bg-slate-100 rounded w-20"></div>
          <div className="h-5 bg-slate-200 rounded w-24 font-mono"></div>
        </div>
      ))}
    </div>
  );
}

export default LoadingSpinner;
