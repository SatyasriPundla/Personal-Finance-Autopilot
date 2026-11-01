import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Sparkles,
  Wallet,
  Activity,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import { useCurrency } from '../context/CurrencyContext.jsx';
import {
  calculateAnalyticsMetrics,
  getCategoryExpenseBreakdown,
  getMonthlyTrends,
} from '../utils/calculations.js';
import { CategoryIconCircle, CategoryBadge } from '../utils/categoryIcons.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Analytics({ transactions = [] }) {
  const { format, activeCurrency } = useCurrency();

  // Quick range options: '30d' | '90d' | 'ytd' | 'all' | 'custom'
  const [rangePreset, setRangePreset] = useState('90d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Calculate start date based on range preset
  const { computedStartDate, computedEndDate } = useMemo(() => {
    const now = new Date();
    let start = null;
    let end = null;

    if (rangePreset === '30d') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    } else if (rangePreset === '90d') {
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    } else if (rangePreset === 'ytd') {
      start = `${now.getFullYear()}-01-01`;
    } else if (rangePreset === 'custom') {
      start = customStart || null;
      end = customEnd || null;
    }

    return { computedStartDate: start, computedEndDate: end };
  }, [rangePreset, customStart, customEnd]);

  // Analytics Metrics computation
  const metrics = useMemo(() => {
    return calculateAnalyticsMetrics(transactions, computedStartDate, computedEndDate);
  }, [transactions, computedStartDate, computedEndDate]);

  // Category breakdown for filtered transactions
  const categoryBreakdown = useMemo(() => {
    return getCategoryExpenseBreakdown(metrics.filteredTransactions);
  }, [metrics.filteredTransactions]);

  // Monthly trends for last 6 months
  const trends = useMemo(() => {
    return getMonthlyTrends(transactions, 6);
  }, [transactions]);

  // Chart 1: Income vs Expense Comparison Bar Chart with Electric Indigo and Emerald Green
  const incomeVsExpenseData = {
    labels: trends.map((t) => t.shortLabel),
    datasets: [
      {
        label: 'Income',
        data: trends.map((t) => t.income),
        backgroundColor: '#10B981', // Emerald Green
        borderRadius: 8,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
      {
        label: 'Expenses',
        data: trends.map((t) => t.expense),
        backgroundColor: '#F43F5E', // Coral Red
        borderRadius: 8,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
      {
        label: 'Net Savings',
        data: trends.map((t) => Math.max(0, t.savings)),
        backgroundColor: '#6366F1', // Electric Indigo
        borderRadius: 8,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
    ],
  };

  const comparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          font: { family: 'Inter', size: 11, weight: '600' },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { family: 'Inter', size: 12, weight: '700' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${format(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11, weight: '600' }, color: '#64748B' },
      },
      y: {
        border: { dash: [4, 4], display: false },
        grid: { color: '#F1F5F9' },
        ticks: {
          font: { family: 'JetBrains Mono', size: 10 },
          color: '#64748B',
          callback: (value) =>
            `${activeCurrency.symbol}${
              Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(0)}k` : value
            }`,
        },
      },
    },
  };

  // Chart 2: Category Expense Doughnut
  const categoryChartData = {
    labels:
      categoryBreakdown.breakdown.length > 0
        ? categoryBreakdown.breakdown.map((b) => b.category)
        : ['No Expense Data'],
    datasets: [
      {
        data:
          categoryBreakdown.breakdown.length > 0
            ? categoryBreakdown.breakdown.map((b) => b.amount)
            : [1],
        backgroundColor:
          categoryBreakdown.breakdown.length > 0
            ? categoryBreakdown.breakdown.map((b) => b.color)
            : ['#E2E8F0'],
        borderWidth: 3,
        borderColor: '#FFFFFF',
        hoverOffset: 6,
      },
    ],
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          font: { family: 'Inter', size: 11, weight: '600' },
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 12,
        cornerRadius: 12,
        enabled: categoryBreakdown.breakdown.length > 0,
        callbacks: {
          label: (context) => {
            const raw = context.raw;
            const pct =
              categoryBreakdown.totalExpense > 0
                ? ((raw / categoryBreakdown.totalExpense) * 100).toFixed(1)
                : 0;
            return ` ${context.label}: ${format(raw)} (${pct}%)`;
          },
        },
      },
    },
  };

  // Chart 3: Net Savings Trajectory Line Chart
  const savingsLineData = {
    labels: trends.map((t) => t.shortLabel),
    datasets: [
      {
        label: 'Net Monthly Savings',
        data: trends.map((t) => t.savings),
        borderColor: '#6366F1', // Electric Indigo line
        backgroundColor: 'rgba(99, 102, 241, 0.12)', // Soft indigo gradient fill
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const savingsLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => ` Savings: ${format(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11, weight: '600' }, color: '#64748B' },
      },
      y: {
        border: { dash: [4, 4], display: false },
        grid: { color: '#F1F5F9' },
        ticks: {
          font: { family: 'JetBrains Mono', size: 10 },
          color: '#64748B',
          callback: (value) =>
            `${activeCurrency.symbol}${
              Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(0)}k` : value
            }`,
        },
      },
    },
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header and Date Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Financial Analytics & Trends
            </h1>
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80">
              Live Metrics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deep-dive into income vs expense dynamics, historical savings trajectory, and category distribution
          </p>
        </div>

        {/* Date Filter Segmented Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center p-1 bg-white border border-indigo-100 rounded-2xl shadow-[0_4px_12px_rgba(99,102,241,0.06)]">
            {[
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'ytd', label: 'This Year' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRangePreset(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  rangePreset === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Date Pickers (if selected) */}
      {rangePreset === 'custom' && (
        <div className="bg-white p-4 rounded-2xl border border-indigo-100/80 shadow-2xs flex flex-wrap items-center gap-4 text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-indigo-600">
            <Calendar className="w-4 h-4" />
            <span>Select Date Window:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Gradient-backed KPI Cards (5 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Income */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-emerald-100 p-5 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.08)] group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
            <span>Period Income</span>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-xs">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-600 tracking-tight">
            {format(metrics.totalIncome)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block font-medium">
            {metrics.filteredTransactions.filter((t) => t.type === 'income').length} deposits recorded
          </span>
        </div>

        {/* Total Expenses */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-rose-100 p-5 shadow-[0_10px_25px_-5px_rgba(244,63,94,0.08)] group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
            <span>Period Expenses</span>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500 to-red-500 text-white shadow-xs">
              <TrendingDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
            {format(metrics.totalExpenses)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block font-medium">
            {metrics.filteredTransactions.filter((t) => t.type === 'expense').length} debits recorded
          </span>
        </div>

        {/* Net Savings */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-indigo-100 p-5 shadow-[0_10px_25px_-5px_rgba(99,102,241,0.08)] group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
            <span>Net Savings</span>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div
            className={`text-2xl font-extrabold font-mono tabular-nums tracking-tight ${
              metrics.netSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {format(metrics.netSavings)}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block font-medium">
            Savings Rate:{' '}
            <strong className="font-extrabold text-indigo-600 font-mono tabular-nums">
              {metrics.savingsRate.toFixed(1)}%
            </strong>
          </span>
        </div>

        {/* Highest Spending Category */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-amber-100 p-5 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.08)] group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
            <span>Top Category</span>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-xs">
              <Zap className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-slate-900 truncate">
            {metrics.highestCategory.category}
          </div>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums mt-2 block font-bold">
            {format(metrics.highestCategory.amount)} spent
          </span>
        </div>

        {/* Average Monthly Expenditure */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-violet-100 p-5 shadow-[0_10px_25px_-5px_rgba(139,92,246,0.08)] group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
            <span>Avg Monthly Spend</span>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white shadow-xs">
              <Target className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
            {format(metrics.avgMonthlyExpenditure)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block font-medium">
            Across active periods
          </span>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Income vs Expenses vs Net Savings
                </h3>
                <p className="text-xs text-slate-400">Monthly side-by-side performance</p>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <Bar data={incomeVsExpenseData} options={comparisonOptions} />
          </div>
        </div>

        {/* Category Expense Doughnut */}
        <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center">
                <PieIcon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Expense Distribution
                </h3>
                <p className="text-xs text-slate-400">Spend by category</p>
              </div>
            </div>
          </div>
          <div className="h-72 w-full relative flex items-center justify-center">
            <Doughnut data={categoryChartData} options={categoryChartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Total
              </span>
              <span className="text-sm font-extrabold font-mono tabular-nums text-slate-800">
                {format(categoryBreakdown.totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Savings Trajectory Line Chart */}
      <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Monthly Net Savings Trajectory
              </h3>
              <p className="text-xs text-slate-400">Trend line for surplus cash flow over time</p>
            </div>
          </div>
          <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            6-Month History
          </span>
        </div>
        <div className="h-64 w-full">
          <Line data={savingsLineData} options={savingsLineOptions} />
        </div>
      </div>

      {/* Category Breakdown Table / Detailed Ranks */}
      <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 sm:p-7 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Category Spending Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Detailed breakdown of expenditures by category within the selected period
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 font-mono">
            {categoryBreakdown.breakdown.length} Categories
          </span>
        </div>

        {categoryBreakdown.breakdown.length > 0 ? (
          <div className="space-y-4">
            {categoryBreakdown.breakdown.map((item, index) => {
              const pct =
                categoryBreakdown.totalExpense > 0
                  ? (item.amount / categoryBreakdown.totalExpense) * 100
                  : 0;
              return (
                <div
                  key={item.category}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200/80 bg-slate-50/40 hover:bg-white transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400 w-4">
                        #{index + 1}
                      </span>
                      <CategoryIconCircle category={item.category} size="default" />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block font-heading">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.count || 1} transactions
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-slate-900 tabular-nums block">
                        {format(item.amount)}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 font-mono">
                        {pct.toFixed(1)}% of total
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, pct))}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            No expense records found for the selected time range.
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
