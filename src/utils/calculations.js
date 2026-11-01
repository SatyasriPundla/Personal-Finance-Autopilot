/**
 * Financial Calculations and Category Definitions
 */

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Other',
];

export const PAYMENT_METHODS = [
  'UPI / GPay / PhonePe',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Other',
];

// Aesthetic vibrant color palette for categories in Chart.js
export const CATEGORY_COLORS = {
  Food: '#F43F5E',          // Coral Red
  Transportation: '#F59E0B',// Amber
  Shopping: '#EC4899',      // Pink
  Bills: '#6366F1',         // Electric Indigo
  Entertainment: '#8B5CF6', // Vibrant Violet
  Healthcare: '#10B981',    // Emerald Green
  Education: '#0EA5E9',     // Sky Blue
  Travel: '#14B8A6',        // Bright Teal
  Other: '#64748B',         // Slate
  Salary: '#10B981',        // Emerald
  Freelance: '#14B8A6',     // Bright Teal
  Business: '#8B5CF6',      // Vibrant Violet
  Investments: '#F59E0B',   // Amber
  Gifts: '#EC4899',         // Pink
};

/**
 * Filter transactions by month and year
 */
export function filterTransactionsByMonth(transactions, month, year) {
  return (transactions || []).filter((tx) => {
    if (!tx.transaction_date) return false;
    const d = new Date(tx.transaction_date);
    return d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year);
  });
}

/**
 * Calculate Dashboard Totals & Month-over-Month Comparisons
 */
export function calculateDashboardSummary(transactions = [], budgets = [], targetDate = new Date()) {
  const currentMonth = targetDate.getMonth() + 1;
  const currentYear = targetDate.getFullYear();

  // Previous month logic
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // All-time income & expense for overall balance
  let allTimeIncome = 0;
  let allTimeExpense = 0;

  // Current month income & expense
  let currentMonthIncome = 0;
  let currentMonthExpense = 0;

  // Previous month income & expense
  let prevMonthIncome = 0;
  let prevMonthExpense = 0;

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    const isIncome = tx.type === 'income';
    const isExpense = tx.type === 'expense';

    if (isIncome) allTimeIncome += amount;
    if (isExpense) allTimeExpense += amount;

    if (!tx.transaction_date) return;
    const d = new Date(tx.transaction_date);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();

    if (m === currentMonth && y === currentYear) {
      if (isIncome) currentMonthIncome += amount;
      if (isExpense) currentMonthExpense += amount;
    } else if (m === prevMonth && y === prevYear) {
      if (isIncome) prevMonthIncome += amount;
      if (isExpense) prevMonthExpense += amount;
    }
  });

  const totalBalance = allTimeIncome - allTimeExpense;
  const prevMonthBalance = prevMonthIncome - prevMonthExpense;

  // Percentage changes
  const incomeChange = prevMonthIncome > 0
    ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100
    : currentMonthIncome > 0 ? 100 : 0;

  const expenseChange = prevMonthExpense > 0
    ? ((currentMonthExpense - prevMonthExpense) / prevMonthExpense) * 100
    : currentMonthExpense > 0 ? 100 : 0;

  const balanceChange = prevMonthBalance !== 0
    ? ((totalBalance - prevMonthBalance) / Math.abs(prevMonthBalance)) * 100
    : 0;

  // Current month active budget calculations
  const currentBudgets = (budgets || []).filter(
    (b) => Number(b.month) === currentMonth && Number(b.year) === currentYear
  );

  const totalBudgetLimit = currentBudgets.reduce((sum, b) => sum + (Number(b.monthly_limit) || 0), 0);

  // Spent in budgeted categories for current month
  const budgetedCategories = new Set(currentBudgets.map((b) => b.category));
  const currentMonthTransactions = filterTransactionsByMonth(transactions, currentMonth, currentYear);

  let spentInBudgetedCategories = 0;
  currentMonthTransactions.forEach((tx) => {
    if (tx.type === 'expense' && budgetedCategories.has(tx.category)) {
      spentInBudgetedCategories += Number(tx.amount) || 0;
    }
  });

  const remainingMonthlyBudget = totalBudgetLimit > 0 ? totalBudgetLimit - spentInBudgetedCategories : 0;
  const budgetUtilization = totalBudgetLimit > 0 ? (spentInBudgetedCategories / totalBudgetLimit) * 100 : 0;

  return {
    totalBalance,
    balanceChange,
    totalIncome: currentMonthIncome,
    allTimeIncome,
    incomeChange,
    totalExpenses: currentMonthExpense,
    allTimeExpense,
    expenseChange,
    totalBudgetLimit,
    spentInBudgetedCategories,
    remainingMonthlyBudget,
    budgetUtilization,
    currentMonth,
    currentYear,
  };
}

/**
 * Category breakdown for expenses
 */
export function getCategoryExpenseBreakdown(transactions = [], month = null, year = null) {
  let filtered = transactions.filter((t) => t.type === 'expense');
  if (month && year) {
    filtered = filterTransactionsByMonth(filtered, month, year);
  }

  const categoryTotals = {};
  EXPENSE_CATEGORIES.forEach((cat) => {
    categoryTotals[cat] = 0;
  });

  let totalExpense = 0;
  filtered.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    const cat = tx.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    totalExpense += amt;
  });

  // Filter out zero categories and sort descending
  const sorted = Object.entries(categoryTotals)
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      color: CATEGORY_COLORS[category] || '#64748B',
    }));

  return {
    breakdown: sorted,
    totalExpense,
  };
}

/**
 * Monthly trend data (last 6 months) for Line and Bar charts
 */
export function getMonthlyTrends(transactions = [], count = 6) {
  const result = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const label = d.toLocaleDateString('en-US', { month: 'short' });

    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      if (!tx.transaction_date) return;
      const txDate = new Date(tx.transaction_date);
      if (txDate.getMonth() + 1 === month && txDate.getFullYear() === year) {
        if (tx.type === 'income') income += Number(tx.amount) || 0;
        if (tx.type === 'expense') expense += Number(tx.amount) || 0;
      }
    });

    result.push({
      month,
      year,
      label: `${label} ${year}`,
      shortLabel: label,
      income,
      expense,
      savings: income - expense,
    });
  }

  return result;
}

/**
 * Advanced Analytics Computations
 */
export function calculateAnalyticsMetrics(transactions = [], startDate = null, endDate = null) {
  let filtered = transactions || [];

  if (startDate) {
    const s = new Date(startDate);
    filtered = filtered.filter((t) => new Date(t.transaction_date) >= s);
  }
  if (endDate) {
    const e = new Date(endDate);
    e.setHours(23, 59, 59, 999);
    filtered = filtered.filter((t) => new Date(t.transaction_date) <= e);
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryExpenses = {};

  filtered.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      totalIncome += amt;
    } else if (tx.type === 'expense') {
      totalExpenses += amt;
      const cat = tx.category || 'Other';
      categoryExpenses[cat] = (categoryExpenses[cat] || 0) + amt;
    }
  });

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  // Highest spending category
  let highestCategory = { category: 'None', amount: 0 };
  Object.entries(categoryExpenses).forEach(([category, amount]) => {
    if (amount > highestCategory.amount) {
      highestCategory = { category, amount };
    }
  });

  // Calculate unique months in range for average monthly expenditure
  const monthKeys = new Set(
    filtered.map((tx) => {
      const d = new Date(tx.transaction_date);
      return `${d.getFullYear()}-${d.getMonth() + 1}`;
    })
  );
  const monthCount = Math.max(1, monthKeys.size);
  const avgMonthlyExpenditure = totalExpenses / monthCount;

  return {
    filteredTransactions: filtered,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    highestCategory,
    avgMonthlyExpenditure,
    transactionCount: filtered.length,
  };
}
