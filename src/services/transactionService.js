import { getSupabaseClient } from '../lib/supabaseClient.js';

const DEMO_TX_KEY = 'expense_tracker_demo_transactions';

// Generate realistic initial demonstration data for college project evaluation
export function getInitialDemoTransactions() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const pad = (n) => String(n).padStart(2, '0');
  const d = (dayOffset, monthOffset = 0) => {
    const target = new Date(year, month + monthOffset, dayOffset);
    return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
  };

  return [
    {
      id: 'tx-1',
      title: 'Monthly Salary - Tech Corp',
      amount: 95000,
      type: 'income',
      category: 'Salary',
      transaction_date: d(1),
      payment_method: 'Net Banking',
      description: 'Monthly direct deposit for September',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-2',
      title: 'Apartment Rent',
      amount: 22000,
      type: 'expense',
      category: 'Bills',
      transaction_date: d(3),
      payment_method: 'UPI / GPay / PhonePe',
      description: 'Monthly flat rent transfer to landlord',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-3',
      title: 'Groceries & Household Supplies',
      amount: 5400,
      type: 'expense',
      category: 'Food',
      transaction_date: d(5),
      payment_method: 'Credit Card',
      description: 'Nature Basket monthly pantry shopping',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-4',
      title: 'Freelance UI/UX Web Design',
      amount: 28000,
      type: 'income',
      category: 'Freelance',
      transaction_date: d(7),
      payment_method: 'UPI / GPay / PhonePe',
      description: 'Milestone 2 payment for SaaS client project',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-5',
      title: 'Electricity & High-speed Wifi Bill',
      amount: 3150,
      type: 'expense',
      category: 'Bills',
      transaction_date: d(9),
      payment_method: 'UPI / GPay / PhonePe',
      description: 'BESCOM power and ACT Fibernet',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-6',
      title: 'Weekend Dining & Cafe',
      amount: 2850,
      type: 'expense',
      category: 'Food',
      transaction_date: d(12),
      payment_method: 'Debit Card',
      description: 'Dinner with friends at Olive Bistro',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-7',
      title: 'Fuel & Metro Smart Card Recharge',
      amount: 2400,
      type: 'expense',
      category: 'Transportation',
      transaction_date: d(14),
      payment_method: 'UPI / GPay / PhonePe',
      description: 'Metro pass recharge and petrol for car',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-8',
      title: 'Mutual Funds SIP Investment',
      amount: 15000,
      type: 'expense',
      category: 'Investments',
      transaction_date: d(15),
      payment_method: 'Net Banking',
      description: 'Nifty 50 Index Fund monthly auto-debit',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-9',
      title: 'Amazon Festive Shopping',
      amount: 4750,
      type: 'expense',
      category: 'Shopping',
      transaction_date: d(18),
      payment_method: 'Credit Card',
      description: 'Ergonomic mouse and home decor items',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-10',
      title: 'Movie Tickets & IMAX Popcorn',
      amount: 1200,
      type: 'expense',
      category: 'Entertainment',
      transaction_date: d(21),
      payment_method: 'UPI / GPay / PhonePe',
      description: 'PVR cinema weekend show',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-11',
      title: 'Quarterly Stock Dividend',
      amount: 4200,
      type: 'income',
      category: 'Investments',
      transaction_date: d(24),
      payment_method: 'Net Banking',
      description: 'TCS & Infosys quarterly dividend payouts',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-12',
      title: 'Pharmacy & Wellness Checkup',
      amount: 1650,
      type: 'expense',
      category: 'Healthcare',
      transaction_date: d(26),
      payment_method: 'UPI / GPay / PhonePe',
      description: 'Apollo Pharmacy vitamins & prescription',
      created_at: new Date().toISOString(),
    },
    // Previous month transactions to ensure Month-over-Month comparison works immediately
    {
      id: 'tx-prev-1',
      title: 'Previous Month Salary',
      amount: 95000,
      type: 'income',
      category: 'Salary',
      transaction_date: d(1, -1),
      payment_method: 'Net Banking',
      description: 'August direct deposit',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-prev-2',
      title: 'Previous Month Rent',
      amount: 22000,
      type: 'expense',
      category: 'Bills',
      transaction_date: d(3, -1),
      payment_method: 'UPI / GPay / PhonePe',
      description: 'August apartment rent',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-prev-3',
      title: 'August Food & Dining',
      amount: 7200,
      type: 'expense',
      category: 'Food',
      transaction_date: d(10, -1),
      payment_method: 'Credit Card',
      description: 'August grocery and dine outs',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx-prev-4',
      title: 'Flight Tickets - Goa Weekend',
      amount: 9800,
      type: 'expense',
      category: 'Travel',
      transaction_date: d(18, -1),
      payment_method: 'Credit Card',
      description: 'Indigo roundtrip flight booking',
      created_at: new Date().toISOString(),
    },
  ];
}

/**
 * Fetch all transactions for the user
 */
export async function fetchTransactions(userId, isDemoMode = false) {
  if (isDemoMode) {
    const saved = localStorage.getItem(DEMO_TX_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    const initial = getInitialDemoTransactions();
    localStorage.setItem(DEMO_TX_KEY, JSON.stringify(initial));
    return initial;
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized.');

  const { data, error } = await client
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Add a new transaction
 */
export async function createTransaction(userId, txData, isDemoMode = false) {
  const payload = {
    title: txData.title.trim(),
    amount: Number(txData.amount),
    type: txData.type,
    category: txData.category,
    transaction_date: txData.transaction_date,
    payment_method: txData.payment_method,
    description: txData.description ? txData.description.trim() : null,
  };

  if (isDemoMode) {
    const current = await fetchTransactions(userId, true);
    const newTx = {
      ...payload,
      id: 'tx-' + Date.now(),
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    const updated = [newTx, ...current];
    localStorage.setItem(DEMO_TX_KEY, JSON.stringify(updated));
    return newTx;
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized.');

  const { data, error } = await client
    .from('transactions')
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(userId, id, txData, isDemoMode = false) {
  const payload = {
    title: txData.title.trim(),
    amount: Number(txData.amount),
    type: txData.type,
    category: txData.category,
    transaction_date: txData.transaction_date,
    payment_method: txData.payment_method,
    description: txData.description ? txData.description.trim() : null,
  };

  if (isDemoMode) {
    const current = await fetchTransactions(userId, true);
    const updated = current.map((item) =>
      item.id === id ? { ...item, ...payload } : item
    );
    localStorage.setItem(DEMO_TX_KEY, JSON.stringify(updated));
    return { id, ...payload };
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized.');

  const { data, error } = await client
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(userId, id, isDemoMode = false) {
  if (isDemoMode) {
    const current = await fetchTransactions(userId, true);
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(DEMO_TX_KEY, JSON.stringify(updated));
    return true;
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized.');

  const { error } = await client
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}
