import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Send, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Zap, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Terminal,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function Transactions({
  overview,
  activeCustomer,
  initialType = 'TRANSFER',
  initialAccount = '',
  onSuccess
}) {
  const [type, setType] = useState(initialType);
  const [fromAccount, setFromAccount] = useState(initialAccount || '');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const accounts = overview?.accounts || [];
  const senderAccounts = activeCustomer
    ? accounts.filter(a => a.customerId === activeCustomer.id)
    : accounts;

  // Auto-fill fromAccount if empty and accounts exist
  React.useEffect(() => {
    if (!fromAccount && senderAccounts.length > 0) {
      setFromAccount(senderAccounts[0].number);
    }
  }, [senderAccounts, fromAccount]);

  // Set default purpose when type changes
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'BILL') setPurpose('Electricity Bill');
    else if (newType === 'SALARY') setPurpose('Monthly Salary');
    else if (newType === 'DEPOSIT') setPurpose('Cash Deposit');
    else if (newType === 'WITHDRAW') setPurpose('ATM Cash');
    else if (newType === 'TRANSFER') setPurpose('UPI Transfer');
    setResult(null);
    setError(null);
  };

  const presetAmounts = [500, 2000, 10000, 30000, 75000];
  const quickPurposes = [
    'Grocery & Food',
    'Electricity Bill',
    'UPI Snacks',
    'Rent payment',
    'Doctor Consultation',
    'Online Shopping'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.move({
        type,
        fromAccount: type === 'DEPOSIT' || type === 'SALARY' ? '' : fromAccount,
        toAccount: type === 'WITHDRAW' ? '' : (type === 'DEPOSIT' || type === 'SALARY' ? fromAccount : toAccount),
        amount: Number(amount),
        purpose: purpose || 'General Banking',
      });

      setResult(response);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedFromObj = accounts.find(a => a.number === fromAccount);
  const isHighValue = Number(amount) >= 25000;
  const isFrozen = selectedFromObj?.frozen;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-cyan-400" />
          Money Operations & Rule Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Simulate live transactions evaluated by Java's RuleEngine with concurrent clearing & fraud detection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
          
          {/* Operation Type Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'TRANSFER', label: 'Transfer', icon: ArrowLeftRight },
              { id: 'DEPOSIT', label: 'Deposit', icon: ArrowDownLeft },
              { id: 'WITHDRAW', label: 'Withdraw', icon: ArrowUpRight },
              { id: 'SALARY', label: 'Salary', icon: Zap },
              { id: 'BILL', label: 'Bill Pay', icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              const active = type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTypeChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Selector(s) */}
            {(type === 'TRANSFER' || type === 'WITHDRAW' || type === 'BILL') && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Source Account (Debit)
                </label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                >
                  {accounts.map(acc => (
                    <option key={acc.number} value={acc.number}>
                      {acc.number} - {acc.holder} ({acc.type}) [Bal: ₹{acc.balance.toLocaleString('en-IN')}] {acc.frozen ? '⛔ FROZEN' : ''}
                    </option>
                  ))}
                </select>
                {isFrozen && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    This account is FROZEN. Java will throw AccountFrozenException.
                  </p>
                )}
              </div>
            )}

            {(type === 'DEPOSIT' || type === 'SALARY') && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Account (Credit)
                </label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                >
                  {accounts.map(acc => (
                    <option key={acc.number} value={acc.number}>
                      {acc.number} - {acc.holder} ({acc.type}) [Bal: ₹{acc.balance.toLocaleString('en-IN')}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {type === 'TRANSFER' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Beneficiary Account (Credit)
                </label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                >
                  <option value="">Select counterparty account...</option>
                  {accounts
                    .filter(a => a.number !== fromAccount)
                    .map(acc => (
                      <option key={acc.number} value={acc.number}>
                        {acc.number} - {acc.holder} ({acc.type})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Amount (₹)</label>
                {selectedFromObj && (type === 'TRANSFER' || type === 'WITHDRAW' || type === 'BILL') && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Avail: ₹{selectedFromObj.available.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {presetAmounts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(String(p))}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition font-mono"
                  >
                    +₹{p >= 1000 ? `${p/1000}k` : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose / Category */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Transaction Purpose & Category
              </label>
              <input
                type="text"
                placeholder="e.g. Grocery, Electricity, Snack, Rent..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickPurposes.map((qp) => (
                  <button
                    key={qp}
                    type="button"
                    onClick={() => setPurpose(qp)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Safety Alert Banner */}
            {isHighValue && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
                <Clock className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">High Value Alert: </span>
                  Amounts ≥ ₹25,000 trigger Java's <span className="font-mono">CooldownVault</span> rule (holding for 4 ticks) to prevent fraudulent spikes.
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isFrozen}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Executing via FinGuard Java Core...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Execute {type}
                </>
              )}
            </button>
          </form>

        </div>

        {/* Live Feedback & Java Rules Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Result Card */}
          {result ? (
            <div className={`p-5 rounded-2xl border shadow-xl ${
              result.message.startsWith('SUCCESS')
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : result.message.startsWith('HELD')
                ? 'bg-amber-950/20 border-amber-500/30'
                : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.message.startsWith('SUCCESS') ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : result.message.startsWith('HELD') ? (
                  <Clock className="h-5 w-5 text-amber-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                )}
                <span className="font-bold text-sm text-white">
                  {result.message.startsWith('SUCCESS')
                    ? 'Transaction Settled'
                    : result.message.startsWith('HELD')
                    ? 'Transaction in Cooldown'
                    : 'Transaction Blocked'}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-mono mb-3">{result.message}</p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
              <Sparkles className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                Execute a transaction to see Java RuleEngine risk evaluation and thread log output.
              </p>
            </div>
          )}

          {/* Real-time System.out Terminal */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-mono flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                Java Console Log (System.out)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">ConsoleCapture.java</span>
            </div>
            <pre className="text-[11px] font-mono text-emerald-400 bg-slate-950/90 p-3 rounded-lg overflow-x-auto max-h-56 scrollbar-thin whitespace-pre-wrap">
              {result?.log || '// FinGuard RuleEngine & SettlementWorker ready...\n// Awaiting next transaction request...'}
            </pre>
          </div>

          {/* Academic Notes */}
          <div className="p-3.5 rounded-xl bg-slate-900/30 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Java Concept Highlights:</div>
            <div>• <span className="font-mono text-indigo-300">RuleEngine.score()</span> evaluates transaction heuristics & assigns fraud score.</div>
            <div>• Deadlock-free account locking in <span className="font-mono text-indigo-300">lockAndMove()</span> orders locks by account number to prevent circular wait condition!</div>
          </div>

        </div>

      </div>

    </div>
  );
}
