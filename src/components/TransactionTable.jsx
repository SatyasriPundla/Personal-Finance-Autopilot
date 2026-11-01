import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  Filter,
  Download,
  Receipt,
  Calendar,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../utils/formatters.js';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/calculations.js';
import { CategoryIconCircle, CategoryBadge } from '../utils/categoryIcons.jsx';

export function TransactionTable({
  transactions = [],
  onEdit,
  onDelete,
  onAddNew,
}) {
  const { format } = useCurrency();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const allCategories = useMemo(() => {
    return Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])).sort();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (
          search &&
          !tx.title.toLowerCase().includes(search.toLowerCase()) &&
          !(tx.description && tx.description.toLowerCase().includes(search.toLowerCase()))
        ) {
          return false;
        }

        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
          return false;
        }

        if (startDate && tx.transaction_date < startDate) {
          return false;
        }
        if (endDate && tx.transaction_date > endDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.transaction_date) - new Date(a.transaction_date);
        }
        if (sortBy === 'date-asc') {
          return new Date(a.transaction_date) - new Date(b.transaction_date);
        }
        if (sortBy === 'amount-desc') {
          return Number(b.amount) - Number(a.amount);
        }
        if (sortBy === 'amount-asc') {
          return Number(a.amount) - Number(b.amount);
        }
        return 0;
      });
  }, [transactions, search, typeFilter, categoryFilter, startDate, endDate, sortBy]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(search) ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    sortBy !== 'date-desc';

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['Title', 'Type', 'Amount', 'Category', 'Date', 'Payment Method', 'Description'];
    const rows = filteredTransactions.map((tx) => [
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.type,
      tx.amount,
      `"${tx.category}"`,
      tx.transaction_date,
      `"${tx.payment_method}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expense_tracker_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-100/70 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.06)] overflow-hidden transition-all">
      {/* Search & Filter Toolbar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by title, merchant, or notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/60 placeholder:text-slate-400 transition-all font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={handleExportCSV}
              disabled={filteredTransactions.length === 0}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 shadow-2xs cursor-pointer"
              title="Export filtered records as CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export CSV</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="all">All Types</option>
              <option value="expense">Expense Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="all">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            />
          </div>

          {/* Sort By */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="date-desc">Date (Newest first)</option>
              <option value="date-asc">Date (Oldest first)</option>
              <option value="amount-desc">Amount (Highest first)</option>
              <option value="amount-asc">Amount (Lowest first)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-indigo-50/50">
              <Receipt className="w-7 h-7 stroke-[2]" />
            </div>
            <h4 className="text-base font-bold text-slate-800 font-heading">No transactions found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No transactions match your current search or filter criteria. Try adjusting your parameters.'
                : 'You have not recorded any transactions yet. Start logging your income or expenses.'}
            </p>
            {onAddNew && !hasActiveFilters && (
              <button
                onClick={onAddNew}
                className="mt-5 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add Your First Transaction</span>
              </button>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-6">Transaction</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 hidden md:table-cell">Payment Method</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {paginatedTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    {/* Title & Description with Category Icon */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <CategoryIconCircle category={tx.category} size="default" />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {tx.title}
                          </div>
                          {tx.description && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {tx.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <CategoryBadge category={tx.category} size="default" />
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 font-mono tabular-nums">
                      {formatDate(tx.transaction_date)}
                    </td>

                    {/* Payment Method */}
                    <td className="py-4 px-4 text-xs text-slate-600 hidden md:table-cell font-medium">
                      {tx.payment_method || '—'}
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
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

                    {/* Amount */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-extrabold font-mono tabular-nums text-sm">
                      <span
                        className={
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }
                      >
                        {isIncome ? '+' : '-'}{format(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                          title="Edit Transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(tx)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {filteredTransactions.length > pageSize && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="font-mono tabular-nums font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="font-mono tabular-nums font-bold text-slate-800">
              {Math.min(currentPage * pageSize, filteredTransactions.length)}
            </strong> of{' '}
            <strong className="font-mono tabular-nums font-bold text-slate-800">{filteredTransactions.length}</strong> transactions
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs"
            >
              Previous
            </button>
            <span className="font-mono tabular-nums px-2.5 font-bold text-indigo-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionTable;
