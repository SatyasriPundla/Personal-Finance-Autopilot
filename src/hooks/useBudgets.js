import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../services/budgetService.js';

export function useBudgets(month = null, year = null) {
  const { user, isDemoMode } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchBudgets(user.id, month, year, isDemoMode);
      setBudgets(data);
    } catch (err) {
      console.error('Failed to load budgets:', err);
      setError(err.message || 'Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  }, [user, month, year, isDemoMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const add = async (budgetData) => {
    if (!user) throw new Error('You must be signed in.');
    const created = await createBudget(user.id, budgetData, isDemoMode);
    setBudgets((prev) => [...prev, created]);
    return created;
  };

  const edit = async (id, budgetData) => {
    if (!user) throw new Error('You must be signed in.');
    const updated = await updateBudget(user.id, id, budgetData, isDemoMode);
    setBudgets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    return updated;
  };

  const remove = async (id) => {
    if (!user) throw new Error('You must be signed in.');
    await deleteBudget(user.id, id, isDemoMode);
    setBudgets((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    budgets,
    loading,
    error,
    reload: loadData,
    addBudget: add,
    editBudget: edit,
    deleteBudget: remove,
  };
}

export default useBudgets;
