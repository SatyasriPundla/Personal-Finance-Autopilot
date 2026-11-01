import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transactionService.js';

export function useTransactions() {
  const { user, isDemoMode } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions(user.id, isDemoMode);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(err.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const add = async (txData) => {
    if (!user) throw new Error('You must be signed in.');
    const created = await createTransaction(user.id, txData, isDemoMode);
    setTransactions((prev) => [created, ...prev]);
    return created;
  };

  const edit = async (id, txData) => {
    if (!user) throw new Error('You must be signed in.');
    const updated = await updateTransaction(user.id, id, txData, isDemoMode);
    setTransactions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    return updated;
  };

  const remove = async (id) => {
    if (!user) throw new Error('You must be signed in.');
    await deleteTransaction(user.id, id, isDemoMode);
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    transactions,
    loading,
    error,
    reload: loadData,
    addTransaction: add,
    editTransaction: edit,
    deleteTransaction: remove,
  };
}

export default useTransactions;
