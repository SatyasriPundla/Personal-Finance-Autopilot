import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { CategoryIconCircle } from '../utils/categoryIcons.jsx';

export function BudgetCard({
  budget,
  spent = 0,
  onEdit,
  onDelete,
}) {
  const { format } = useCurrency();
  const limit = Number(budget.monthly_limit) || 0;
  const spentAmount = Number(spent) || 0;
  const remaining = limit - spentAmount;
  const percentage = limit > 0 ? (spentAmount / limit) * 100 : 0;
  const cappedPercentage = Math.min(100, Math.max(0, percentage));

  // Determine threshold status
  let status = 'normal'; // 'normal' | 'warning' (>=80%) | 'exceeded' (>100%)
  if (percentage > 100) {
    status = 'exceeded';
  } else if (percentage >= 80) {
    status = 'warning';
  }

  const styles = {
    normal: {
      barGradient: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Healthy & On Track',
      icon: CheckCircle,
      border: 'border-emerald-100 hover:border-emerald-300',
      shadow: 'card-glow-emerald',
      topLine: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    },
    warning: {
      barGradient: 'bg-gradient-to-r from-amber-400 to-orange-500',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'Warning (≥80%)',
      icon: AlertTriangle,
      border: 'border-amber-200 hover:border-amber-400',
      shadow: 'card-glow-amber',
      topLine: 'bg-gradient-to-r from-amber-400 to-orange-500',
    },
    exceeded: {
      barGradient: 'bg-gradient-to-r from-rose-500 to-red-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Exceeded Limit (>100%)',
      icon: AlertCircle,
      border: 'border-rose-200 hover:border-rose-400',
      shadow: 'card-glow-coral',
      topLine: 'bg-gradient-to-r from-rose-500 to-red-600',
    },
  }[status];

  const StatusIcon = styles.icon;

  return (
    <div
      className={`relative overflow-hidden bg-white rounded-3xl border ${styles.border} ${styles.shadow} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between group`}
    >
      {/* Top micro gradient line */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.topLine}`} />

      <div>
        {/* Header with category icon */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <CategoryIconCircle category={budget.category} size="large" />
            <div>
              <h4 className="text-base font-extrabold text-slate-900 font-heading">
                {budget.category}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles.badgeBg}`}
                >
                  <StatusIcon className="w-3 h-3 stroke-[2.5]" />
                  <span>{styles.label}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(budget)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
              title="Edit Budget Limit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(budget)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
              title="Delete Budget"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Financial metrics breakdown cards */}
        <div className="grid grid-cols-2 gap-3 my-4 text-xs">
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">
              Spent
            </span>
            <span className="font-extrabold text-slate-900 font-mono tabular-nums text-base mt-0.5 block">
              {format(spentAmount)}
            </span>
          </div>
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">
              Limit
            </span>
            <span className="font-extrabold text-slate-900 font-mono tabular-nums text-base mt-0.5 block">
              {format(limit)}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Utilization</span>
            <span className="font-mono tabular-nums font-bold text-slate-800">
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${styles.barGradient}`}
              style={{ width: `${cappedPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Threshold Alerts & Remaining Info */}
      <div className="pt-3.5 border-t border-slate-100">
        {status === 'exceeded' ? (
          <div className="p-2.5 bg-rose-50/90 rounded-2xl border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 stroke-[2.2]" />
            <span>
              Exceeded budget by <strong className="font-mono font-bold">{format(spentAmount - limit)}</strong>
            </span>
          </div>
        ) : status === 'warning' ? (
          <div className="p-2.5 bg-amber-50/90 rounded-2xl border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 stroke-[2.2]" />
            <span>
              Approaching limit: <strong className="font-mono font-bold">{format(remaining)}</strong> remaining.
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">Remaining Budget:</span>
            <span className="font-extrabold font-mono tabular-nums text-emerald-600 text-sm">
              {format(remaining)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetCard;
