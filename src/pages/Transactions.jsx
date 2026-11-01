import React, { useState } from 'react';
import { Plus, ReceiptText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TransactionTable } from '../components/TransactionTable.jsx';
import { TransactionForm } from '../components/TransactionForm.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';
import { SkeletonTable } from '../components/LoadingSpinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';

export function Transactions({
  transactions = [],
  loading = false,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const toast = useToast();
  const { format } = useCurrency();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);

  const handleOpenAdd = () => {
    setSelectedTx(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setSelectedTx(tx);
    setFormOpen(true);
  };

  const handleOpenDelete = (tx) => {
    setTxToDelete(tx);
    setDeleteModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setActionLoading(true);
    try {
      if (selectedTx) {
        await onEditTransaction(selectedTx.id, payload);
        toast.success(`Transaction "${payload.title}" updated successfully!`);
      } else {
        await onAddTransaction(payload);
        toast.success(`New ${payload.type} "${payload.title}" recorded!`);
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!txToDelete) return;
    setActionLoading(true);
    try {
      await onDeleteTransaction(txToDelete.id);
      toast.success(`Transaction "${txToDelete.title}" deleted.`);
      setDeleteModalOpen(false);
      setTxToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction.');
    } finally {
      setActionLoading(false);
    }
  };

  const totalIncomeCount = transactions.filter((t) => t.type === 'income').length;
  const totalExpenseCount = transactions.filter((t) => t.type === 'expense').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Transaction Ledger
            </h1>
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              {transactions.length} entries
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, sort, and manage all your historical income and expense transactions
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_22px_rgba(99,102,241,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Transaction Table */}
      {loading ? (
        <SkeletonTable />
      ) : (
        <TransactionTable
          transactions={transactions}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onAddNew={handleOpenAdd}
        />
      )}

      {/* Add / Edit Form Modal */}
      <TransactionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTx}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Transaction"
        message={
          txToDelete
            ? `Are you sure you want to permanently delete "${txToDelete.title}" of ${format(txToDelete.amount)}? This action cannot be reversed.`
            : 'Are you sure you want to delete this transaction?'
        }
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setTxToDelete(null);
        }}
        loading={actionLoading}
      />
    </div>
  );
}

export default Transactions;
