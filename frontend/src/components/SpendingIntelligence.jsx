import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  PiggyBank, 
  BrainCircuit, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function SpendingIntelligence({ 
  overview, 
  selectedAccount, 
  onSelectAccount 
}) {
  const { t } = useLanguage();
  const accounts = overview?.accounts || [];
  const currentAcc = selectedAccount || (accounts.length > 0 ? accounts[0].number : '');

  const [spendingData, setSpendingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSpending = async (accNum) => {
    if (!accNum) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSpending(accNum);
      setSpendingData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch spending data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAcc) {
      fetchSpending(currentAcc);
    }
  }, [currentAcc]);

  const categories = spendingData?.categories || [];
  const personality = spendingData?.personality || 'Balanced Budgeter';
  const totalDebit = spendingData?.totalDebit || 0;
  const vault = spendingData?.vault || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            {t('spendingTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('spendingSubtitle')}
          </p>
        </div>

        {/* Account Selector & Refresh */}
        <div className="flex items-center gap-2">
          <select
            value={currentAcc}
            onChange={(e) => onSelectAccount(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {accounts.map(acc => (
              <option key={acc.number} value={acc.number}>
                {acc.number} ({acc.holder})
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchSpending(currentAcc)}
            disabled={loading}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shadow-sm cursor-pointer"
            title={t('refreshIntel')}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Persona & Core Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Financial Persona Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl" />
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold mb-2">
              <BrainCircuit className="h-4 w-4" />
              <span>{t('financialPersona')}</span>
            </div>
            <h3 className="text-xl font-black tracking-tight">{personality}</h3>
            <p className="text-xs text-indigo-100/80 mt-1">
              Automated behavioral heuristic analysis of account cashflow.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="font-mono text-indigo-100">{currentAcc}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">AI Evaluated</span>
          </div>
        </div>

        {/* Total Debited */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t('totalExpenditure')}</div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">
              ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Aggregated expenditure across all debit transactions</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-4">
            <TrendingUp className="h-4 w-4" />
            <span>Real-Time Audit</span>
          </div>
        </div>

        {/* Auto Vault Savings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t('autoSavedInVault')}</div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
              ₹{vault.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Micro-roundups automatically diverted to high-yield reserve</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-4">
            <PiggyBank className="h-4 w-4" />
            <span>4.5% Annual APY</span>
          </div>
        </div>

      </div>

      {/* Category Budgets & Spend Breakdown */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {t('monthlyCategoryBudgets')}
          </h3>
          <span className="text-xs text-slate-400 font-mono">Current Cycle</span>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No spending records registered for this account yet.
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => {
              const spent = cat.spent || 0;
              const budget = cat.budget || 10000;
              const pct = Math.min(100, Math.round((spent / budget) * 100));
              const isOver = spent > budget;
              const isWarning = pct > 80 && !isOver;

              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cat.category}</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        isOver 
                          ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30' 
                          : isWarning 
                          ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' 
                          : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                      }`}>
                        {isOver ? t('budgetExceeded') : isWarning ? t('budgetNearLimit') : t('budgetHealthy')}
                      </span>
                    </div>
                    <div className="font-mono text-slate-500">
                      <span className="font-bold text-slate-900 dark:text-white">₹{spent.toLocaleString('en-IN')}</span> / ₹{budget.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        isOver 
                          ? 'bg-rose-500' 
                          : isWarning 
                          ? 'bg-amber-500' 
                          : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
