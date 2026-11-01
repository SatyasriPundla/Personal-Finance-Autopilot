/**
 * Currency and Date Formatters
 * Formats monetary amounts with special support for Indian currency notation (₹1,00,000)
 */

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', locale: 'en-GB' },
];

/**
 * Format a number as currency
 * Defaults to INR with Indian number grouping (lakhs/crores)
 */
export function formatCurrency(amount, currencyCode = 'INR', showDecimals = true) {
  const numericAmount = Number(amount) || 0;
  const isNegative = numericAmount < 0;
  const absAmount = Math.abs(numericAmount);

  const currencyConfig = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  try {
    let formatted = new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(absAmount);

    return isNegative ? `-${formatted}` : formatted;
  } catch {
    // Fallback manual formatting
    const formattedNum = absAmount.toLocaleString('en-IN', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
    return `${isNegative ? '-' : ''}${currencyConfig.symbol}${formattedNum}`;
  }
}

/**
 * Format date string to readable format
 * e.g., '2026-09-29' -> '29 Sep 2026'
 */
export function formatDate(dateString, format = 'medium') {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (format === 'short') {
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    if (format === 'month-year') {
      return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

/**
 * Format percentage difference
 */
export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(1)}%`;
}

/**
 * Month names
 */
export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function getMonthName(monthNumber) {
  const match = MONTHS.find((m) => m.value === Number(monthNumber));
  return match ? match.label : '';
}
