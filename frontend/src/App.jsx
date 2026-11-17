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
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [overview, setOverview] = useState(null);
  const [tick, setTick] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeCustomer, setActiveCustomer] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  
  // Modals
  const [freezeAccount, setFreezeAccount] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Transfers pre-fill state
  const [transferType, setTransferType] = useState('TRANSFER');
  const [transferAccount, setTransferAccount] = useState('');

  // Fetch full overview from Java BankCore API
  const refreshData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await api.getOverview();
      setOverview(data);
      setTick(data.tick);
      setIsOnline(true);

      // Auto-select first customer if none selected
      if (data.customers && data.customers.length > 0) {
        setActiveCustomer((prev) => {
          if (!prev) return data.customers[0];
          const found = data.customers.find((c) => c.id === prev.id);
          return found || data.customers[0];
        });
      }

      // Auto-select first account if none selected
      if (data.accounts && data.accounts.length > 0) {
        setSelectedAccount((prev) => {
          if (!prev) return data.accounts[0].number;
          const found = data.accounts.find((a) => a.number === prev);
          return found ? prev : data.accounts[0].number;
        });
      }
    } catch (err) {
      console.warn('API sync warning:', err.message);
      setIsOnline(false);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Poll Bank Clock and Cooldown updates periodically
  useEffect(() => {
    refreshData(true);
    const interval = setInterval(() => {
      refreshData(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshData]);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        tick={tick}
        isOnline={isOnline}
        customers={overview?.customers || []}
        activeCustomer={activeCustomer}
        setActiveCustomer={setActiveCustomer}
        cooldownCount={overview?.cooldown?.length || 0}
        onRefresh={() => refreshData(true)}
        loading={loading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Offline Banner if Java Server isn't running */}
        {!isOnline && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div>
              <span className="font-bold">FinGuard Java Server Disconnected: </span>
              Ensure the Java backend is active on <code className="font-mono bg-rose-950 px-1 py-0.5 rounded">http://localhost:8080</code>.
            </div>
            <button
              onClick={() => refreshData(true)}
              className="px-3 py-1 rounded-lg bg-rose-500 text-slate-950 font-bold hover:bg-rose-400 transition flex-shrink-0"
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
            onNavigateToLabs={() => setCurrentTab('labs')}
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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-300">FinGuard Core</span> • Semester 3 Java Project
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Core Java</span>
            <span>•</span>
            <span>Multithreading & Concurrency</span>
            <span>•</span>
            <span>React + Tailwind CSS</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {freezeAccount && (
        <FreezeModal
          account={freezeAccount}
          onClose={() => setFreezeAccount(null)}
          onSuccess={() => refreshData(false)}
        />
      )}

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
