import React, { useState } from 'react';
import { 
  Wallet, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PlusCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  PiggyBank, 
  CreditCard
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard({
  overview,
  activeCustomer,
  onOpenTransfer,
  onOpenFreezeModal,
  onOpenCreateAccountModal,
  onSelectAccountForStatement,
}) {
  const { t } = useLanguage();
  const [unmaskedMap, setUnmaskedMap] = useState({});

  const toggleMask = (accNum) => {
    setUnmaskedMap(prev => ({ ...prev, [accNum]: !prev[accNum] }));
  };

  const accounts = overview?.accounts || [];
  const customerAccounts = activeCustomer 
    ? accounts.filter(a => a.customerId === activeCustomer.id)
    : accounts;

  const totalBalance = customerAccounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalVault = customerAccounts.reduce((acc, curr) => acc + (curr.vault || 0), 0);
  const frozenCount = customerAccounts.filter(a => a.frozen).length;
  const cooldownCount = overview?.cooldown?.length || 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Customer Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 flex-shrink-0 shadow-lg shadow-cyan-500/20">
            <div className="h-full w-full bg-slate-50 dark:bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-2xl text-cyan-600 dark:text-cyan-400 font-mono">
              {activeCustomer?.name ? activeCustomer.name[0].toUpperCase() : 'F'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('welcomeBack')}, {activeCustomer ? activeCustomer.name : 'Customer'}
              </h2>
              {activeCustomer && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  {activeCustomer.id}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>{t('activeVerified')}:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('allSecured')}
              </span>
              <span>•</span>
              <span>{customerAccounts.length} {t('connectedAccounts')}</span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenTransfer('DEPOSIT')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold transition"
          >
            <ArrowDownLeft className="h-4 w-4" />
            {t('depositFunds')}
          </button>
          <button
            onClick={() => onOpenTransfer('TRANSFER')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
          >
            <ArrowUpRight className="h-4 w-4" />
            {t('sendMoney')}
          </button>
          <button
            onClick={onOpenCreateAccountModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 transition"
          >
            <PlusCircle className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            {t('openAccount')}
          </button>
        </div>
      </div>

      {/* Primary Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
            <span>{t('totalLiquidBalance')}</span>
            <Wallet className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{t('acrossAllAccounts')}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
            <span>{t('safetyVaultLocked')}</span>
            <PiggyBank className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-300">
            ₹{totalVault.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{t('autoSavingsRoundups')}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
            <span>{t('pendingReview')}</span>
            <Lock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-300">
            {cooldownCount}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{t('transactionsInCooldown')}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
            <span>{t('fraudShieldStatus')}</span>
            {frozenCount > 0 ? (
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono">
            {frozenCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400">{frozenCount} {t('locked')}</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">{t('allSecured')}</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{t('automatedHeuristics')}</div>
        </div>
      </div>

      {/* Account Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-cyan-500" />
            {t('yourAccountsCards')}
          </h3>
        </div>

        {customerAccounts.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-md">
            <CreditCard className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold">{t('openAccount')}</p>
            <button
              onClick={onOpenCreateAccountModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20"
            >
              <PlusCircle className="h-4 w-4" />
              {t('openAccount')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {customerAccounts.map((account) => {
              const isUnmasked = !!unmaskedMap[account.number];
              const isSavings = account.type === 'SAVINGS';
              const isFrozen = account.frozen;

              return (
                <div
                  key={account.number}
                  className={`relative p-6 rounded-3xl border transition-all duration-300 overflow-hidden shadow-xl ${
                    isFrozen
                      ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/40 shadow-rose-950/10'
                      : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Glow line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isFrozen 
                      ? 'bg-rose-500' 
                      : isSavings 
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`} />

                  {/* Header: Number, Mask toggle, Type badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                        {isUnmasked ? account.number : account.masked}
                      </span>
                      <button
                        onClick={() => toggleMask(account.number)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                        title={isUnmasked ? "Mask Account Number" : "Reveal Account Number"}
                      >
                        {isUnmasked ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isSavings
                          ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30'
                          : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
                      }`}>
                        {account.type}
                      </span>
                      {isFrozen && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" />
                          {t('locked')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Holder Name */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Holder: <span className="text-slate-800 dark:text-slate-200 font-semibold">{account.holder}</span>
                  </p>

                  {/* Balance */}
                  <div className="mt-5 mb-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('availableBalance')}</div>
                    <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                      ₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Account Details Strip */}
                  <div className="grid grid-cols-2 gap-3 py-2.5 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs mb-5">
                    {isSavings ? (
                      <>
                        <div>
                          <div className="text-slate-500 text-[11px] font-medium">{t('vaultSavings')}</div>
                          <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                            ₹{account.vault.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[11px] font-medium">{t('annualYield')}</div>
                          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">4.50% p.a.</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-slate-500 text-[11px] font-medium">{t('overdraftFacility')}</div>
                          <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{account.overdraft.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[11px] font-medium">{t('totalCreditLimit')}</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            ₹{account.available.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => onSelectAccountForStatement(account.number)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition text-center"
                    >
                      {t('auditLedger')}
                    </button>
                    <button
                      onClick={() => onOpenTransfer('TRANSFER', account.number)}
                      disabled={isFrozen}
                      className="flex-1 py-2 px-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 text-xs font-semibold transition text-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t('transfer')}
                    </button>
                    <button
                      onClick={() => onOpenFreezeModal(account)}
                      className={`p-2 rounded-xl border transition ${
                        isFrozen
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                          : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                      }`}
                      title={isFrozen ? t('unlockAccount') : t('lockAccount')}
                    >
                      {isFrozen ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </button>
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
