import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  Plus,
  Receipt,
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
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

import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { formatDate } from '../utils/formatters.js';
import {
  calculateDashboardSummary,
  getCategoryExpenseBreakdown,
  getMonthlyTrends,
} from '../utils/calculations.js';
import { StatCard } from '../components/StatCard.jsx';
import { SkeletonCard, SkeletonTable } from '../components/LoadingSpinner.jsx';
import { CategoryIconCircle, CategoryBadge } from '../utils/categoryIcons.jsx';

// Register Chart.js elements
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

export function Dashboard({
  transactions = [],
  budgets = [],
  loading = false,
  onOpenAddTransaction,
}) {
  const { user, profile } = useAuth();
  const { format, activeCurrency } = useCurrency();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Summary computations
  const summary = useMemo(() => {
    return calculateDashboardSummary(transactions, budgets);
  }, [transactions, budgets]);

  // Category breakdown for current month doughnut chart
  const categoryBreakdown = useMemo(() => {
    return getCategoryExpenseBreakdown(transactions, summary.currentMonth, summary.currentYear);
  }, [transactions, summary.currentMonth, summary.currentYear]);

  // 6-month trend data for Bar & Line charts
  const trends = useMemo(() => {
    return getMonthlyTrends(transactions, 6);
  }, [transactions]);

  // 5 Most recent transactions
  const recentTransactions = useMemo(() => {
    return (transactions || []).slice(0, 5);
  }, [transactions]);

  // Chart 1: Income vs Expense Bar Chart
  const barChartData = {
    labels: trends.map((t) => t.shortLabel),
    datasets: [
      {
        label: 'Income',
        data: trends.map((t) => t.income),
        backgroundColor: '#10B981', // Emerald Green
        hoverBackgroundColor: '#059669',
        borderRadius: 8,
        barPercentage: 0.55,
      },
      {
        label: 'Expense',
        data: trends.map((t) => t.expense),
        backgroundColor: '#6366F1', // Electric Indigo
        hoverBackgroundColor: '#4F46E5',
        borderRadius: 8,
        barPercentage: 0.55,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          font: { family: 'Inter', size: 12, weight: 600 },
          color: '#475569',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { family: 'Inter', size: 12, weight: 700 },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${format(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11, weight: 500 }, color: '#64748B' },
      },
      y: {
        border: { dash: [4, 4] },
        grid: { color: '#F1F5F9' },
        ticks: {
          font: { family: 'JetBrains Mono', size: 11 },
          color: '#94A3B8',
          callback: (value) => `${activeCurrency.symbol}${Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(0)}k` : value}`,
        },
      },
    },
  };

  // Chart 2: Category Expense Doughnut Chart
  const doughnutData = {
    labels: categoryBreakdown.breakdown.length > 0
      ? categoryBreakdown.breakdown.map((b) => b.category)
      : ['No Expenses Recorded'],
    datasets: [
      {
        data: categoryBreakdown.breakdown.length > 0
          ? categoryBreakdown.breakdown.map((b) => b.amount)
          : [1],
        backgroundColor: categoryBreakdown.breakdown.length > 0
          ? categoryBreakdown.breakdown.map((b) => b.color)
          : ['#E2E8F0'],
        borderWidth: 3,
        borderColor: '#FFFFFF',
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          font: { family: 'Inter', size: 11, weight: 500 },
          padding: 12,
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { family: 'Inter', size: 12, weight: 700 },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        padding: 12,
        cornerRadius: 10,
        enabled: categoryBreakdown.breakdown.length > 0,
        callbacks: {
          label: (context) => {
            const raw = context.raw;
            const pct = categoryBreakdown.totalExpense > 0
              ? ((raw / categoryBreakdown.totalExpense) * 100).toFixed(1)
              : 0;
            return ` ${context.label}: ${format(raw)} (${pct}%)`;
          },
        },
      },
    },
  };

  // Chart 3: Monthly Spending Trend Line Chart
  const lineChartData = {
    labels: trends.map((t) => t.shortLabel),
    datasets: [
      {
        label: 'Monthly Spending',
        data: trends.map((t) => t.expense),
        borderColor: '#6366F1', // Electric Indigo
        borderWidth: 3,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.00)');
          return gradient;
        },
        fill: true,
        tension: 0.38,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2.5,
        pointRadius: 4.5,
        pointHoverRadius: 7,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { family: 'Inter', size: 12, weight: 700 },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context) => ` Spent: ${format(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11, weight: 500 }, color: '#64748B' },
      },
      y: {
        border: { dash: [4, 4] },
        grid: { color: '#F1F5F9' },
        ticks: {
          font: { family: 'JetBrains Mono', size: 11 },
          color: '#94A3B8',
          callback: (value) => `${activeCurrency.symbol}${Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(0)}k` : value}`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Welcoming Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-teal-500/10 p-5 sm:p-6 rounded-3xl border border-indigo-100/80 shadow-xs relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              {greeting}, <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">{displayName}</span>!
            </h1>
            <span className="text-2xl animate-bounce">👋</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Here&apos;s your financial overview. You&apos;re currently managing your personal wealth with precision.
          </p>
        </div>

        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_22px_rgba(99,102,241,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Balance */}
        <StatCard
          title="Total Net Balance"
          amount={format(summary.totalBalance)}
          icon={Wallet}
          trendPercent={summary.balanceChange}
          trendLabel="net growth"
          accentColor="indigo"
          featured={false}
        />

        {/* Card 2: Total Income */}
        <StatCard
          title="Monthly Income"
          amount={format(summary.totalIncome)}
          icon={TrendingUp}
          trendPercent={summary.incomeChange}
          trendLabel="vs last month"
          accentColor="emerald"
        />

        {/* Card 3: Total Expenses */}
        <StatCard
          title="Monthly Expenses"
          amount={format(summary.totalExpenses)}
          icon={TrendingDown}
          trendPercent={summary.expenseChange}
          trendLabel="vs last month"
          accentColor="rose"
        />

        {/* Card 4: Remaining Monthly Budget */}
        <StatCard
          title="Remaining Budget"
          amount={format(summary.remainingMonthlyBudget)}
          icon={PiggyBank}
          trendPercent={null}
          subtext={
            summary.totalBudgetLimit > 0
              ? `${summary.budgetUtilization.toFixed(0)}% of monthly limit utilized`
              : 'No budget allocated'
          }
          accentColor="amber"
        />
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Income vs Expense (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] flex flex-col justify-between transition-all hover:border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center ring-4 ring-indigo-50/50 shadow-2xs">
                <BarChart3 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Income vs Expense Performance
                </h3>
                <p className="text-xs text-slate-400">Past 6 months cash flow breakdown</p>
              </div>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full mt-2">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Chart 2: Category Expense Breakdown */}
        <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] flex flex-col justify-between transition-all hover:border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center ring-4 ring-teal-50/50 shadow-2xs">
                <PieIcon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Expense Distribution
                </h3>
                <p className="text-xs text-slate-400">Current month category share</p>
              </div>
            </div>
          </div>

          <div className="h-60 relative flex items-center justify-center my-2">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Total Month Spending:</span>
            <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
              {format(categoryBreakdown.totalExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Spending Trend Line Chart */}
      <div className="bg-white rounded-3xl border border-indigo-100/70 p-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] transition-all hover:border-indigo-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center ring-4 ring-violet-50/50 shadow-2xs">
              <LineIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Monthly Spending Trajectory
              </h3>
              <p className="text-xs text-slate-400">Total expense fluctuation over time</p>
            </div>
          </div>
        </div>
        <div className="h-60 sm:h-64 w-full">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-3xl border border-indigo-100/70 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] overflow-hidden transition-all hover:border-indigo-200">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Recent Transactions
            </h3>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-xl hover:bg-indigo-50"
          >
            <span>View All Transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-500">
            No transactions found. Click &quot;New Transaction&quot; to begin your financial records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-6">Transaction</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-xs">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <CategoryIconCircle category={tx.category} size="default" />
                          <div>
                            <span className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                              {tx.title}
                            </span>
                            {tx.description && (
                              <span className="text-[11px] text-slate-400 line-clamp-1">
                                {tx.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <CategoryBadge category={tx.category} size="small" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono tabular-nums whitespace-nowrap">
                        {formatDate(tx.transaction_date)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span className="capitalize">{tx.type}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-extrabold font-mono tabular-nums whitespace-nowrap text-sm">
                        <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                          {isIncome ? '+' : '-'}{format(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
