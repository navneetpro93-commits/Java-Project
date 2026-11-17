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

        {/* Account Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select Account:</label>
          <select
            value={currentAcc}
            onChange={(e) => onSelectAccount(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {accounts.map(acc => (
              <option key={acc.number} value={acc.number}>
                {acc.number} ({acc.holder} - {acc.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Analyzing expenditure patterns...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      ) : (
        <>
          {/* Top Personality & Aggregate Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Personality Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-500/30 shadow-xl transition-colors">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <BrainCircuit className="h-4 w-4" />
                {t('financialPersona')}
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                {personality}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Derived from your transaction habits and debit category allocations.
              </p>
            </div>

            {/* Total Spend */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md transition-colors">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                {t('totalExpenditure')}
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Aggregated across all categories</div>
            </div>

            {/* Vault Reserve */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <span>{t('autoSavedInVault')}</span>
                <PiggyBank className="h-4 w-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                ₹{vault.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Generated via transaction micro-roundups</div>
            </div>

          </div>

          {/* Category Budgets vs Actual Consumption */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                {t('monthlyCategoryBudgets')}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {categories.length} Categories Monitored
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const percent = cat.budget > 0 ? Math.min(100, Math.round((cat.used / cat.budget) * 100)) : 0;
                const isOver = cat.used > cat.budget && cat.budget > 0;
                const isNear = percent >= 80 && !isOver;

                return (
                  <div 
                    key={cat.name} 
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                          {cat.name}
                        </span>
                        {isOver && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            OVER BUDGET
                          </span>
                        )}
                        {isNear && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                            Near Limit
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                        {percent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver 
                            ? 'bg-rose-500' 
                            : isNear 
                            ? 'bg-amber-400' 
                            : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Monetary Numbers */}
                    <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span>Spent: <span className="font-semibold text-slate-800 dark:text-white">₹{cat.used.toLocaleString('en-IN')}</span></span>
                      <span>Limit: <span className="font-semibold text-slate-600 dark:text-slate-300">₹{cat.budget.toLocaleString('en-IN')}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
