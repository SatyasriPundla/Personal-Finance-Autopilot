import React, { useState, useEffect } from 'react';
import { X, PiggyBank, Sparkles, Loader2 } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../utils/calculations.js';
import { MONTHS } from '../utils/formatters.js';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { CategoryIconCircle } from '../utils/categoryIcons.jsx';

export function BudgetModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currentMonth = new Date().getMonth() + 1,
  currentYear = new Date().getFullYear(),
  existingCategories = [],
  loading = false,
}) {
  const { activeCurrency } = useCurrency();
  const isEditing = Boolean(initialData);

  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || EXPENSE_CATEGORIES[0]);
      setMonthlyLimit(initialData.monthly_limit ? String(initialData.monthly_limit) : '');
      setMonth(initialData.month || currentMonth);
      setYear(initialData.year || currentYear);
    } else {
      const available = EXPENSE_CATEGORIES.find((c) => !existingCategories.includes(c));
      setCategory(available || EXPENSE_CATEGORIES[0]);
      setMonthlyLimit('');
      setMonth(currentMonth);
      setYear(currentYear);
    }
    setError('');
  }, [initialData, isOpen, currentMonth, currentYear, existingCategories]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const limitNum = parseFloat(monthlyLimit);

    if (!monthlyLimit || isNaN(limitNum) || limitNum <= 0) {
      setError('Please enter a valid monthly limit greater than zero.');
      return;
    }

    if (!category) {
      setError('Please select an expense category.');
      return;
    }

    try {
      await onSubmit({
        category,
        monthly_limit: limitNum,
        month: Number(month),
        year: Number(year),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save budget.');
    }
  };

  const years = [
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-indigo-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <CategoryIconCircle category={category} size="default" />
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {isEditing ? 'Adjust Budget Limit' : 'Allocate Category Budget'}
              </h3>
              <p className="text-xs text-slate-500">
                Set a monthly cap to monitor real-time utilization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Expense Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              disabled={isEditing}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-slate-100 disabled:text-slate-400 font-medium shadow-2xs cursor-pointer"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly Limit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Monthly Limit ({activeCurrency.symbol}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm font-bold">
                {activeCurrency.symbol}
              </span>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="e.g. 15000"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 font-mono tabular-nums font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
            </div>
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium shadow-2xs"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium shadow-2xs"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Establish Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BudgetModal;
