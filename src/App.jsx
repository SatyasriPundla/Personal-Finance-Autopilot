import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import { useTransactions } from './hooks/useTransactions.js';
import { useBudgets } from './hooks/useBudgets.js';

import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Navbar } from './components/Navbar.jsx';
import { TransactionForm } from './components/TransactionForm.jsx';
import { SupabaseConfigModal } from './components/SupabaseConfigModal.jsx';

import { Dashboard } from './pages/Dashboard.jsx';
import { Transactions } from './pages/Transactions.jsx';
import { Budgets } from './pages/Budgets.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { Profile } from './pages/Profile.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { ForgotPassword } from './pages/ForgotPassword.jsx';
import { NotFound } from './pages/NotFound.jsx';

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const toast = useToast();

  // Global transactional state
  const {
    transactions,
    loading: txLoading,
    addTransaction,
    editTransaction,
    deleteTransaction,
  } = useTransactions();

  // Global budget state
  const {
    budgets,
    loading: budgetLoading,
    addBudget,
    editBudget,
    deleteBudget,
  } = useBudgets();

  const handleCreateTransaction = async (payload) => {
    try {
      await addTransaction(payload);
      toast.success(`Transaction "${payload.title}" recorded successfully!`);
      setAddTxOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to add transaction.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onOpenConfig={() => setConfigModalOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          onMobileMenuClick={() => setMobileMenuOpen(true)}
          onOpenAddTransaction={() => setAddTxOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  transactions={transactions}
                  budgets={budgets}
                  loading={txLoading || budgetLoading}
                  onOpenAddTransaction={() => setAddTxOpen(true)}
                />
              }
            />
            <Route
              path="/transactions"
              element={
                <Transactions
                  transactions={transactions}
                  loading={txLoading}
                  onAddTransaction={addTransaction}
                  onEditTransaction={editTransaction}
                  onDeleteTransaction={deleteTransaction}
                />
              }
            />
            <Route
              path="/budgets"
              element={
                <Budgets
                  budgets={budgets}
                  transactions={transactions}
                  loading={budgetLoading}
                  onAddBudget={addBudget}
                  onEditBudget={editBudget}
                  onDeleteBudget={deleteBudget}
                />
              }
            />
            <Route
              path="/analytics"
              element={<Analytics transactions={transactions} />}
            />
            <Route
              path="/profile"
              element={<Profile onOpenConfig={() => setConfigModalOpen(true)} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionForm
        isOpen={addTxOpen}
        onClose={() => setAddTxOpen(false)}
        onSubmit={handleCreateTransaction}
      />

      {/* Global Supabase Configuration Modal */}
      <SupabaseConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  const [configModalOpen, setConfigModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <ToastProvider>
        <CurrencyProvider>
          <AuthProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={<Login onOpenConfig={() => setConfigModalOpen(true)} />}
              />
              <Route
                path="/register"
                element={<Register onOpenConfig={() => setConfigModalOpen(true)} />}
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Authenticated Application */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>

            {/* Config Modal for public screens */}
            <SupabaseConfigModal
              isOpen={configModalOpen}
              onClose={() => setConfigModalOpen(false)}
            />
          </AuthProvider>
        </CurrencyProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
