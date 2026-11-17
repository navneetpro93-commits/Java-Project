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
  CreditCard,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function Dashboard({
  overview,
  activeCustomer,
  onOpenTransfer,
  onOpenFreezeModal,
  onOpenCreateAccountModal,
  onSelectAccountForStatement,
  onNavigateToLabs
}) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 flex-shrink-0">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-xl text-cyan-400 font-mono">
              {activeCustomer ? activeCustomer.name.slice(0, 2).toUpperCase() : 'FG'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {activeCustomer ? activeCustomer.name : 'All Accounts Overview'}
              </h2>
              {activeCustomer && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {activeCustomer.id}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Financial Persona:{' '}
              <span className="font-semibold text-indigo-300">
                {activeCustomer?.personality || 'Balanced Budgeter'}
              </span>{' '}
              • {customerAccounts.length} Connected {customerAccounts.length === 1 ? 'Account' : 'Accounts'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenTransfer('DEPOSIT')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Deposit
          </button>
          <button
            onClick={() => onOpenTransfer('TRANSFER')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
          >
            <ArrowUpRight className="h-4 w-4" />
            Send Money
          </button>
          <button
            onClick={onOpenCreateAccountModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <PlusCircle className="h-4 w-4 text-cyan-400" />
            New Account
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Liquid Assets</span>
            <Wallet className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Safety Vault Locked</span>
            <PiggyBank className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            ₹{totalVault.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Auto-savings & roundups</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Security Queue</span>
            <Lock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {cooldownCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Transactions in Cooldown</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Security Status</span>
            {frozenCount > 0 ? (
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono">
            {frozenCount > 0 ? (
              <span className="text-rose-400">{frozenCount} Frozen</span>
            ) : (
              <span className="text-emerald-400">All Secure</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Freezeable interface active</div>
        </div>
      </div>

      {/* Account Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-cyan-400" />
            Account Portfolios
          </h3>
          <span className="text-xs text-slate-400">
            Demonstrating Polymorphism: SavingsAccount vs CurrentAccount
          </span>
        </div>

        {customerAccounts.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <CreditCard className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No accounts found for this customer.</p>
            <button
              onClick={onOpenCreateAccountModal}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-semibold"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Open an Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerAccounts.map((account) => {
              const isUnmasked = !!unmaskedMap[account.number];
              const isSavings = account.type === 'SAVINGS';
              const isFrozen = account.frozen;

              return (
                <div
                  key={account.number}
                  className={`relative p-5 rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isFrozen
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  {/* Subtle Top glow accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    isFrozen 
                      ? 'bg-rose-500' 
                      : isSavings 
                      ? 'bg-cyan-500' 
                      : 'bg-indigo-500'
                  }`} />

                  {/* Header: Number, Mask toggle, Type badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-200 tracking-wider">
                        {isUnmasked ? account.number : account.masked}
                      </span>
                      <button
                        onClick={() => toggleMask(account.number)}
                        className="text-slate-500 hover:text-slate-300 transition"
                        title={isUnmasked ? "Mask Account Number" : "Reveal Account Number"}
                      >
                        {isUnmasked ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        isSavings
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {account.type} ACCOUNT
                      </span>
                      {isFrozen && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" />
                          FROZEN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Holder Name */}
                  <p className="text-xs text-slate-400 mt-1">
                    Holder: <span className="text-slate-200 font-medium">{account.holder}</span>
                  </p>

                  {/* Primary Balance */}
                  <div className="mt-4 mb-3">
                    <div className="text-xs text-slate-400">Available Balance</div>
                    <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                      ₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Account Specific Fields (Polymorphism Showcase) */}
                  <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs mb-4">
                    {isSavings ? (
                      <>
                        <div>
                          <div className="text-slate-500 text-[11px]">Vault Savings</div>
                          <div className="font-mono font-semibold text-cyan-400">
                            ₹{account.vault.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[11px]">Interest Yield</div>
                          <div className="font-mono font-semibold text-emerald-400">4.5% p.a.</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-slate-500 text-[11px]">Overdraft Limit</div>
                          <div className="font-mono font-semibold text-indigo-400">
                            ₹{account.overdraft.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[11px]">Total Available</div>
                          <div className="font-mono font-semibold text-white">
                            ₹{account.available.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => onSelectAccountForStatement(account.number)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition text-center"
                    >
                      Audit Ledger
                    </button>
                    <button
                      onClick={() => onOpenTransfer('TRANSFER', account.number)}
                      disabled={isFrozen}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-xs font-medium transition text-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Transfer
                    </button>
                    <button
                      onClick={() => onOpenFreezeModal(account)}
                      className={`p-1.5 rounded-lg border transition ${
                        isFrozen
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      }`}
                      title={isFrozen ? "Unlock / Unfreeze Account" : "Emergency Freeze Account"}
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

      {/* Java Architecture & OOP Highlights Footer Card */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
        <Info className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">
            Semester 3 Java Concepts in Action:
          </p>
          <p>
            • <span className="text-slate-200 font-mono">finguard.model.Account</span> is an abstract class demonstrating encapsulation with synchronized atomic debit/credit methods.
          </p>
          <p>
            • Subclasses <span className="text-slate-200 font-mono">SavingsAccount</span> and <span className="text-slate-200 font-mono">CurrentAccount</span> override <span className="font-mono">availableLimit()</span> to enforce custom limits (overdraft vs vault locked).
          </p>
          <p>
            • <span className="text-slate-200 font-mono">Freezeable</span> interface allows dynamic safety lockdown without modifying core banking arithmetic.
          </p>
        </div>
      </div>

    </div>
  );
}
