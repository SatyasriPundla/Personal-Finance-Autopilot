import React, { useState, useMemo } from 'react';
import {
  Plus,
  PiggyBank,
  Calendar,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { MONTHS, getMonthName } from '../utils/formatters.js';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { BudgetCard } from '../components/BudgetCard.jsx';
import { BudgetModal } from '../components/BudgetModal.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';
import { SkeletonCard } from '../components/LoadingSpinner.jsx';

export function Budgets({
  budgets = [],
  transactions = [],
  loading = false,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
}) {
  const { format } = useCurrency();
  const toast = useToast();
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Filter budgets for selected month and year
  const activeBudgets = useMemo(() => {
    return (budgets || []).filter(
      (b) => Number(b.month) === Number(selectedMonth) && Number(b.year) === Number(selectedYear)
    );
  }, [budgets, selectedMonth, selectedYear]);

  // Calculate actual spending in selected month for each category
  const spendingByCategory = useMemo(() => {
    const map = {};
    (transactions || []).forEach((tx) => {
      if (tx.type !== 'expense' || !tx.transaction_date) return;
      const d = new Date(tx.transaction_date);
      if (d.getMonth() + 1 === Number(selectedMonth) && d.getFullYear() === Number(selectedYear)) {
        const cat = tx.category || 'Other';
        map[cat] = (map[cat] || 0) + (Number(tx.amount) || 0);
      }
    });
    return map;
  }, [transactions, selectedMonth, selectedYear]);

  // Aggregate monthly budget statistics
  const totalAllocated = useMemo(() => {
    return activeBudgets.reduce((sum, b) => sum + (Number(b.monthly_limit) || 0), 0);
  }, [activeBudgets]);

  const totalSpentInBudgeted = useMemo(() => {
    return activeBudgets.reduce((sum, b) => sum + (spendingByCategory[b.category] || 0), 0);
  }, [activeBudgets, spendingByCategory]);

  const overallRemaining = totalAllocated - totalSpentInBudgeted;
  const overallPercentage = totalAllocated > 0 ? (totalSpentInBudgeted / totalAllocated) * 100 : 0;

  // Alerts tally
  const warningCount = useMemo(() => {
    return activeBudgets.filter((b) => {
      const spent = spendingByCategory[b.category] || 0;
      const limit = Number(b.monthly_limit) || 0;
      const pct = limit > 0 ? (spent / limit) * 100 : 0;
      return pct >= 80 && pct <= 100;
    }).length;
  }, [activeBudgets, spendingByCategory]);

  const exceededCount = useMemo(() => {
    return activeBudgets.filter((b) => {
      const spent = spendingByCategory[b.category] || 0;
      const limit = Number(b.monthly_limit) || 0;
      return spent > limit;
    }).length;
  }, [activeBudgets, spendingByCategory]);

  const healthyCount = activeBudgets.length - warningCount - exceededCount;

  const handleOpenAdd = () => {
    setSelectedBudget(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setSelectedBudget(budget);
    setModalOpen(true);
  };

  const handleOpenDelete = (budget) => {
    setBudgetToDelete(budget);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setActionLoading(true);
    try {
      if (selectedBudget) {
        await onEditBudget(selectedBudget.id, payload);
        toast.success(`Budget for "${payload.category}" updated to ${format(payload.monthly_limit)}!`);
      } else {
        await onAddBudget(payload);
        toast.success(`New budget for "${payload.category}" created!`);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;
    setActionLoading(true);
    try {
      await onDeleteBudget(budgetToDelete.id);
      toast.success(`Budget for "${budgetToDelete.category}" deleted.`);
      setDeleteModalOpen(false);
      setBudgetToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete budget.');
    } finally {
      setActionLoading(false);
    }
  };

  const existingCategories = activeBudgets.map((b) => b.category);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Budget Management
            </h1>
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200/80">
              {activeBudgets.length} allocated
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Set category limits, track utilization progress, and prevent overspending with real-time indicators
          </p>
        </div>

        {/* Month/Year selector & Add budget */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border border-indigo-100/80 rounded-2xl px-3 py-2 shadow-[0_4px_12px_rgba(99,102,241,0.06)]">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer border-l border-slate-200 pl-2"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_22px_rgba(99,102,241,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Overview Banner */}
      <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 sm:p-7 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-100/40 via-violet-50/20 to-transparent rounded-bl-full pointer-events-none -mr-20 -mt-20"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center relative z-10">
          {/* Card 1: Total Allocated */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Total Budget Cap</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {format(totalAllocated)}
            </div>
            <p className="text-[11px] text-slate-400">
              For {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </div>

          {/* Card 2: Actual Spent */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Total Actual Spent</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              {format(totalSpentInBudgeted)}
            </div>
            <p className="text-[11px] text-slate-400">
              Across active categories
            </p>
          </div>

          {/* Card 3: Remaining Pool */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span
                className={`w-2 h-2 rounded-full ${
                  overallRemaining < 0 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              ></span>
              <span>Remaining Balance</span>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight tabular-nums ${
                overallRemaining < 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {format(overallRemaining)}
            </div>
            <p className="text-[11px] text-slate-400">
              {overallRemaining < 0 ? 'Exceeded monthly budget!' : 'Available for allocation'}
            </p>
          </div>

          {/* Card 4: Aggregate Utilization Gauge */}
          <div className="space-y-2.5 sm:border-l sm:border-slate-100 sm:pl-6">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                Overall Utilization
              </span>
              <span className="font-extrabold font-mono tabular-nums text-slate-900 text-sm">
                {overallPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/40">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out shadow-xs ${
                  overallPercentage > 100
                    ? 'bg-gradient-to-r from-rose-500 to-red-600'
                    : overallPercentage >= 80
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, overallPercentage))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>0%</span>
              <span className="font-semibold text-slate-600">Threshold: 80%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Alert Banner Tags */}
        {(exceededCount > 0 || warningCount > 0) && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            {exceededCount > 0 && (
              <div className="flex items-center gap-2 text-rose-700 bg-rose-50/80 px-4 py-2 rounded-xl border border-rose-200/90 shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">
                  <strong>{exceededCount}</strong> {exceededCount === 1 ? 'category has' : 'categories have'} exceeded their monthly spending cap.
                </span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-2 text-amber-800 bg-amber-50/80 px-4 py-2 rounded-xl border border-amber-200/90 shadow-2xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span className="font-medium">
                  <strong>{warningCount}</strong> {warningCount === 1 ? 'category is' : 'categories are'} approaching the 80% threshold.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid of Budget Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : activeBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBudgets.map((budget) => {
            const spent = spendingByCategory[budget.category] || 0;
            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                spent={spent}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-indigo-100/70 p-12 text-center shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)]">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <PiggyBank className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 font-heading">
            No Budgets for {getMonthName(selectedMonth)} {selectedYear}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            Take control of your spending habits by setting category-level targets. We will track your expenses and notify you when you reach 80% and 100%.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create First Budget</span>
          </button>
        </div>
      )}

      {/* Modal: Create or Edit Budget */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedBudget}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        existingCategories={existingCategories}
        loading={actionLoading}
      />

      {/* Modal: Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Budget Allocation"
        message={
          budgetToDelete
            ? `Are you sure you want to remove the ${budgetToDelete.category} monthly budget of ${format(
                budgetToDelete.monthly_limit
              )}? This will not delete any associated transactions.`
            : 'Are you sure you want to delete this budget?'
        }
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setBudgetToDelete(null);
        }}
        loading={actionLoading}
      />
    </div>
  );
}

export default Budgets;
