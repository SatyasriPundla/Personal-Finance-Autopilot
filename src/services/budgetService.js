import { getSupabaseClient } from '../lib/supabaseClient.js';

const DEMO_BUDGET_KEY = 'expense_tracker_demo_budgets';

export function getInitialDemoBudgets() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return [
    {
      id: 'b-1',
      category: 'Food',
      monthly_limit: 10000,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
    },
    {
      id: 'b-2',
      category: 'Bills',
      monthly_limit: 26000,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
    },
    {
      id: 'b-3',
      category: 'Transportation',
      monthly_limit: 3500,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
    },
    {
      id: 'b-4',
      category: 'Shopping',
      monthly_limit: 5000,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
    },
    {
      id: 'b-5',
      category: 'Entertainment',
      monthly_limit: 2000,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
    },
    {
      id: 'b-6',
      category: 'Healthcare',
      monthly_limit: 3000,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
    },
  ];
}

/**
 * Fetch budgets for a user for a given month and year
 */
export async function fetchBudgets(userId, month = null, year = null, isDemoMode = false) {
  if (isDemoMode) {
    const saved = localStorage.getItem(DEMO_BUDGET_KEY);
    let list = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch {
        // ignore
      }
    } else {
      list = getInitialDemoBudgets();
      localStorage.setItem(DEMO_BUDGET_KEY, JSON.stringify(list));
    }

    if (month && year) {
      return list.filter((b) => Number(b.month) === Number(month) && Number(b.year) === Number(year));
    }
    return list;
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized.');

  let query = client
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (month && year) {
    query = query.eq('month', month).eq('year', year);
  }

  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Create a new budget
 */
export async function createBudget(userId, budgetData, isDemoMode = false) {
  const payload = {
    category: budgetData.category,
    monthly_limit: Number(budgetData.monthly_limit),
    month: Number(budgetData.month),
    year: Number(budgetData.year),
  };

  if (isDemoMode) {
    const all = await fetchBudgets(userId, null, null, true);
    // Check duplicate
    const exists = all.find(
      (b) =>
        b.category === payload.category &&
        Number(b.month) === payload.month &&
        Number(b.year) === payload.year
    );
    if (exists) {
      throw new Error(`A budget for ${payload.category} already exists for this month.`);
    }

    const newBudget = {
      ...payload,
      id: 'b-' + Date.now(),
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    const updated = [...all, newBudget];
    localStorage.setItem(DEMO_BUDGET_KEY, JSON.stringify(updated));
    return newBudget;
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized.');

  const { data, error } = await client
    .from('budgets')
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`A budget for ${payload.category} already exists for this month.`);
    }
    throw error;
  }
  return data;
}

/**
 * Update an existing budget
 */
export async function updateBudget(userId, id, budgetData, isDemoMode = false) {
  const payload = {
    category: budgetData.category,
    monthly_limit: Number(budgetData.monthly_limit),
    month: Number(budgetData.month),
    year: Number(budgetData.year),
  };

  if (isDemoMode) {
    const all = await fetchBudgets(userId, null, null, true);
    const updated = all.map((item) =>
      item.id === id ? { ...item, ...payload } : item
    );
    localStorage.setItem(DEMO_BUDGET_KEY, JSON.stringify(updated));
    return { id, ...payload };
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized.');

  const { data, error } = await client
    .from('budgets')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a budget
 */
export async function deleteBudget(userId, id, isDemoMode = false) {
  if (isDemoMode) {
    const all = await fetchBudgets(userId, null, null, true);
    const updated = all.filter((item) => item.id !== id);
    localStorage.setItem(DEMO_BUDGET_KEY, JSON.stringify(updated));
    return true;
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized.');

  const { error } = await client
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}
