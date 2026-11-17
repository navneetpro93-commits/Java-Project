import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import CooldownVault from './components/CooldownVault';
import Statements from './components/Statements';
import SpendingIntelligence from './components/SpendingIntelligence';
import ChallengeBoard from './components/ChallengeBoard';
import Labs from './components/Labs';
import FreezeModal from './components/FreezeModal';
import CreateAccountModal from './components/CreateAccountModal';
import AuthPage from './components/AuthPage';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [overview, setOverview] = useState(null);
  const [tick, setTick] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  // Authentication State
  const [activeCustomer, setActiveCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('finguard_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedAccount, setSelectedAccount] = useState('');
  
  // Modals
  const [freezeAccount, setFreezeAccount] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Transfers pre-fill state
  const [transferType, setTransferType] = useState('TRANSFER');
  const [transferAccount, setTransferAccount] = useState('');

  // Fetch full overview from API
  const refreshData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await api.getOverview();
      setOverview(data);
      setTick(data.tick);
      setIsOnline(true);

      // If activeCustomer is set, verify/update it from the latest customers list
      if (activeCustomer && data.customers && data.customers.length > 0) {
        const matching = data.customers.find((c) => c.id === activeCustomer.id);
        if (matching) {
          setActiveCustomer(matching);
          localStorage.setItem('finguard_user', JSON.stringify(matching));
        }
      }

      // Auto-select account if none selected
      if (data.accounts && data.accounts.length > 0) {
        setSelectedAccount((prev) => {
          if (!prev) return data.accounts[0].number;
          const found = data.accounts.find((a) => a.number === prev);
          return found ? prev : data.accounts[0].number;
        });
      }
    } catch (err) {
      console.warn('Network sync warning:', err.message);
      setIsOnline(false);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [activeCustomer]);

  // Periodic polling for Bank Clock & Queue updates
  useEffect(() => {
    refreshData(true);
    const interval = setInterval(() => {
      refreshData(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Handle Login & Signup Success
  const handleLoginSuccess = (customer) => {
    setActiveCustomer(customer);
    localStorage.setItem('finguard_user', JSON.stringify(customer));
    setCurrentTab('dashboard');
    refreshData(false);
  };

  // Handle Sign Out
  const handleLogout = () => {
    setActiveCustomer(null);
    localStorage.removeItem('finguard_user');
  };

  // Quick navigation handlers
  const handleOpenTransfer = (type = 'TRANSFER', accountNum = '') => {
    setTransferType(type);
    setTransferAccount(accountNum);
    setCurrentTab('transfers');
  };

  const handleSelectAccountForStatement = (accNum) => {
    setSelectedAccount(accNum);
    setCurrentTab('statements');
  };

  // IF NOT AUTHENTICATED -> SHOW LOGIN / SIGN UP PAGE
  if (!activeCustomer) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        tick={tick}
        isOnline={isOnline}
        activeCustomer={activeCustomer}
        onLogout={handleLogout}
        cooldownCount={overview?.cooldown?.length || 0}
        onRefresh={() => refreshData(true)}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Offline Notice */}
        {!isOnline && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div>
              <span className="font-bold">Backend Server Offline: </span>
              Ensure the FinGuard Core Server is active on <code className="font-mono bg-rose-950 px-1 py-0.5 rounded">http://localhost:8080</code>.
            </div>
            <button
              onClick={() => refreshData(true)}
              className="px-3 py-1 rounded-xl bg-rose-500 text-slate-950 font-bold hover:bg-rose-400 transition flex-shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Tab Views */}
        {currentTab === 'dashboard' && (
          <Dashboard
            overview={overview}
            activeCustomer={activeCustomer}
            onOpenTransfer={handleOpenTransfer}
            onOpenFreezeModal={(acc) => setFreezeAccount(acc)}
            onOpenCreateAccountModal={() => setShowCreateModal(true)}
            onSelectAccountForStatement={handleSelectAccountForStatement}
          />
        )}

        {currentTab === 'transfers' && (
          <Transactions
            overview={overview}
            activeCustomer={activeCustomer}
            initialType={transferType}
            initialAccount={transferAccount}
            onSuccess={() => refreshData(false)}
          />
        )}

        {currentTab === 'cooldown' && (
          <CooldownVault
            overview={overview}
            currentTick={tick}
            onRefresh={() => refreshData(false)}
            onCancelSuccess={() => refreshData(false)}
          />
        )}

        {currentTab === 'statements' && (
          <Statements
            overview={overview}
            selectedAccount={selectedAccount}
            onSelectAccount={(acc) => setSelectedAccount(acc)}
          />
        )}

        {currentTab === 'spending' && (
          <SpendingIntelligence
            overview={overview}
            selectedAccount={selectedAccount}
            onSelectAccount={(acc) => setSelectedAccount(acc)}
          />
        )}

        {currentTab === 'challenges' && (
          <ChallengeBoard overview={overview} />
        )}

        {currentTab === 'labs' && (
          <Labs />
        )}

      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="font-semibold text-slate-400">
            FinGuard Banking Technologies • All Rights Reserved
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>256-bit Encryption</span>
            <span>•</span>
            <span>Zero-Drift Atomic Clearing</span>
            <span>•</span>
            <span>Fraud Shield Active</span>
          </div>
        </div>
      </footer>

      {/* Emergency Lock / Freeze Modal */}
      {freezeAccount && (
        <FreezeModal
          account={freezeAccount}
          onClose={() => setFreezeAccount(null)}
          onSuccess={() => refreshData(false)}
        />
      )}

      {/* Open Account Modal */}
      {showCreateModal && (
        <CreateAccountModal
          customers={overview?.customers || []}
          activeCustomer={activeCustomer}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => refreshData(false)}
        />
      )}

    </div>
  );
}
