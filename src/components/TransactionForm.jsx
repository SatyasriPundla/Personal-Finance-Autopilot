import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Sparkles, Loader2 } from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../utils/calculations.js';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { CategoryIconCircle } from '../utils/categoryIcons.jsx';

export function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const { activeCurrency } = useCurrency();
  const isEditing = Boolean(initialData);

  const getTodayString = () => {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  };

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [transactionDate, setTransactionDate] = useState(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setTitle(initialData.title || '');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setCategory(
        initialData.category ||
          (initialData.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
      );
      setTransactionDate(initialData.transaction_date || getTodayString());
      setPaymentMethod(initialData.payment_method || PAYMENT_METHODS[0]);
      setDescription(initialData.description || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setTransactionDate(getTodayString());
      setPaymentMethod(PAYMENT_METHODS[0]);
      setDescription('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      if (!INCOME_CATEGORIES.includes(category)) {
        setCategory(INCOME_CATEGORIES[0]);
      }
    } else {
      if (!EXPENSE_CATEGORIES.includes(category)) {
        setCategory(EXPENSE_CATEGORIES[0]);
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length < 2) {
      errs.title = 'Title must be at least 2 characters';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      errs.amount = 'Amount is required';
    } else if (numAmount <= 0) {
      errs.amount = 'Amount must be greater than zero';
    }

    if (!category) {
      errs.category = 'Please select a category';
    }

    if (!transactionDate) {
      errs.transactionDate = 'Please select a date';
    }

    if (!paymentMethod) {
      errs.paymentMethod = 'Please select a payment method';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      transaction_date: transactionDate,
      payment_method: paymentMethod,
      description: description.trim() || null,
    };

    await onSubmit(payload);
  };

  if (!isOpen) return null;

  const currentCategoryList = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden border border-indigo-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 via-violet-50/40 to-white">
          <div className="flex items-center gap-3">
            <CategoryIconCircle category={category} size="default" />
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {isEditing ? 'Edit Transaction' : 'Record Transaction'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update transaction parameters and records'
                  : 'Track your income or expense with high accuracy'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Income vs Expense Segmented Control */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Transaction Flow
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  type === 'expense'
                    ? 'bg-white text-rose-600 shadow-sm border border-rose-100 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 stroke-[2.2]" />
                <span>Expense (-)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  type === 'income'
                    ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4 stroke-[2.2]" />
                <span>Income (+)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={type === 'income' ? 'e.g. Monthly Salary, Freelance Milestone' : 'e.g. Organic Groceries, Electric Bill'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 bg-white font-medium transition-all ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.title}</p>}
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Amount ({activeCurrency.symbol}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm font-bold">
                  {activeCurrency.symbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border font-mono tabular-nums font-bold focus:outline-none focus:ring-2 bg-white transition-all ${
                    errors.amount
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.amount && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 bg-white font-medium transition-all ${
                  errors.transactionDate
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              {errors.transactionDate && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.transactionDate}</p>
              )}
            </div>
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium cursor-pointer shadow-2xs"
              >
                {currentCategoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium cursor-pointer shadow-2xs"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description / Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Merchant name, receipt reference, or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium transition-all"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_4px_14px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {loading
                  ? 'Saving...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Save Transaction'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
