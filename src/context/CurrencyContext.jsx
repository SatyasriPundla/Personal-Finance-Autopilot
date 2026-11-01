import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_CURRENCIES, formatCurrency } from '../utils/formatters.js';

const CurrencyContext = createContext(null);

const STORAGE_KEY = 'expense_tracker_currency';

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_CURRENCIES.some((c) => c.code === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'INR';
  });

  const setCurrency = (code) => {
    if (SUPPORTED_CURRENCIES.some((c) => c.code === code)) {
      setCurrencyState(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        // ignore
      }
    }
  };

  const activeCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  const format = (amount, showDecimals = true) => {
    return formatCurrency(amount, currency, showDecimals);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        activeCurrency,
        format,
        currencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
