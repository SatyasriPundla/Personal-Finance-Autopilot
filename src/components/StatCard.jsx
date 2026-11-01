import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Sparkles } from 'lucide-react';
import { formatPercent } from '../utils/formatters.js';

export function StatCard({
  title,
  amount,
  icon: Icon,
  trendPercent,
  trendLabel = 'vs last month',
  accentColor = 'indigo', // indigo, emerald, rose, amber, teal
  subtext,
  featured = false,
}) {
  const isPositive = trendPercent > 0;
  const isNegative = trendPercent < 0;
  const isZero = trendPercent === 0 || trendPercent === null || trendPercent === undefined;

  const colorStyles = {
    indigo: {
      cardBg: featured ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white' : 'bg-white',
      border: 'border-indigo-100/80 hover:border-indigo-300',
      shadow: 'card-glow-indigo',
      iconBox: featured ? 'bg-white/20 text-white backdrop-blur-xs' : 'bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/50',
      titleColor: featured ? 'text-indigo-100' : 'text-slate-500',
      amountColor: featured ? 'text-white' : 'text-slate-900',
      subtextColor: featured ? 'text-indigo-200' : 'text-slate-400',
      topBar: 'bg-gradient-to-r from-indigo-500 to-violet-500',
    },
    emerald: {
      cardBg: 'bg-white',
      border: 'border-emerald-100/80 hover:border-emerald-300',
      shadow: 'card-glow-emerald',
      iconBox: 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50',
      titleColor: 'text-slate-500',
      amountColor: 'text-slate-900',
      subtextColor: 'text-slate-400',
      topBar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    },
    rose: {
      cardBg: 'bg-white',
      border: 'border-rose-100/80 hover:border-rose-300',
      shadow: 'card-glow-coral',
      iconBox: 'bg-rose-50 text-rose-500 ring-4 ring-rose-50/50',
      titleColor: 'text-slate-500',
      amountColor: 'text-slate-900',
      subtextColor: 'text-slate-400',
      topBar: 'bg-gradient-to-r from-rose-400 to-pink-500',
    },
    amber: {
      cardBg: 'bg-white',
      border: 'border-amber-100/80 hover:border-amber-300',
      shadow: 'card-glow-amber',
      iconBox: 'bg-amber-50 text-amber-600 ring-4 ring-amber-50/50',
      titleColor: 'text-slate-500',
      amountColor: 'text-slate-900',
      subtextColor: 'text-slate-400',
      topBar: 'bg-gradient-to-r from-amber-400 to-orange-500',
    },
    teal: {
      cardBg: 'bg-white',
      border: 'border-teal-100/80 hover:border-teal-300',
      shadow: 'card-glow-indigo',
      iconBox: 'bg-teal-50 text-teal-600 ring-4 ring-teal-50/50',
      titleColor: 'text-slate-500',
      amountColor: 'text-slate-900',
      subtextColor: 'text-slate-400',
      topBar: 'bg-gradient-to-r from-teal-400 to-emerald-500',
    },
  }[accentColor] || {
    cardBg: 'bg-white',
    border: 'border-slate-200/80 hover:border-slate-300',
    shadow: 'shadow-sm',
    iconBox: 'bg-slate-100 text-slate-700',
    titleColor: 'text-slate-500',
    amountColor: 'text-slate-900',
    subtextColor: 'text-slate-400',
    topBar: 'bg-indigo-500',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${colorStyles.border} ${colorStyles.cardBg} ${colorStyles.shadow} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group`}
    >
      {/* Top micro gradient line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colorStyles.topBar}`} />

      {/* Decorative background glow in the corner */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <span
          className={`text-xs font-bold uppercase tracking-wider font-heading ${colorStyles.titleColor}`}
        >
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${colorStyles.iconBox}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex flex-col relative z-10">
        <span
          className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight ${colorStyles.amountColor}`}
        >
          {amount}
        </span>

        <div className="mt-3 flex items-center flex-wrap gap-2 text-xs">
          {trendPercent !== null && trendPercent !== undefined ? (
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold font-mono tabular-nums text-[11px] shadow-2xs ${
                featured
                  ? 'bg-white/20 text-white'
                  : isPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  : isNegative
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                  : 'bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              {isPositive && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
              {isNegative && <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />}
              {isZero && <Minus className="w-3.5 h-3.5" />}
              <span>{formatPercent(trendPercent)}</span>
            </div>
          ) : null}

          {trendLabel && (
            <span className={`text-[11px] font-medium ${colorStyles.subtextColor}`}>
              {trendLabel}
            </span>
          )}

          {subtext && !trendLabel && (
            <span className={`text-[11px] font-medium ${colorStyles.subtextColor}`}>
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
