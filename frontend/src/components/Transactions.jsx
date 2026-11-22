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
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Transactions({
  overview,
  activeCustomer,
  initialType = 'TRANSFER',
  initialAccount = '',
  onSuccess
}) {
  const { t } = useLanguage();
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

  React.useEffect(() => {
    if (!fromAccount && senderAccounts.length > 0) {
      setFromAccount(senderAccounts[0].number);
    }
  }, [senderAccounts, fromAccount]);

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
    'Healthcare',
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
      const res = await api.move({
        type,
        fromAccount: (type === 'DEPOSIT' || type === 'SALARY') ? '' : fromAccount,
        toAccount: (type === 'WITHDRAW') ? '' : (type === 'DEPOSIT' ? fromAccount : toAccount),
        amount: Number(amount),
        purpose: purpose || `${type} Payment`
      });

      setResult(res);
      if (res.ok && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Transaction submission failed');
    } finally {
      setLoading(false);
    }
  };

  const isHighValue = Number(amount) >= 25000;
  const currentFromAccObj = accounts.find(a => a.number === fromAccount);
  const isFrozen = currentFromAccObj?.frozen;

  const typeTabs = [
    { id: 'TRANSFER', label: t('typeTransfer'), icon: ArrowLeftRight },
    { id: 'BILL', label: t('typeBill'), icon: FileText },
    { id: 'SALARY', label: t('typeSalary'), icon: Zap },
    { id: 'DEPOSIT', label: t('typeDeposit'), icon: ArrowDownLeft },
    { id: 'WITHDRAW', label: t('typeWithdraw'), icon: ArrowUpRight },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          {t('transfersTitle')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('transfersSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl transition-colors">
          
          {/* Action Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-5">
            {typeTabs.map(tab => {
              const Icon = tab.icon;
              const active = type === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTypeChange(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-md border border-slate-200 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Account Locked Warning */}
          {isFrozen && type !== 'DEPOSIT' && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs mb-4 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <span>This account is currently locked. Debits and transfers are blocked until unlocked.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Sender / From Account */}
            {type !== 'SALARY' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {type === 'DEPOSIT' ? t('creditAccount') : t('debitAccount')}
                </label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {senderAccounts.map((a) => (
                    <option key={a.number} value={a.number}>
                      {a.number} - {a.holder} (Bal: ₹{a.balance.toLocaleString('en-IN')}) {a.frozen ? '🔒 [LOCKED]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Recipient / Beneficiary Account */}
            {(type === 'TRANSFER' || type === 'BILL' || type === 'SALARY') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('beneficiaryAccount')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. FG1002 or Beneficiary A/C"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  {/* Quick Select Beneficiaries */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {accounts.filter(a => a.number !== fromAccount).slice(0, 3).map((acc) => (
                      <button
                        key={acc.number}
                        type="button"
                        onClick={() => setToAccount(acc.number)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 font-mono transition cursor-pointer"
                      >
                        + {acc.holder} ({acc.masked})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Amount & Preset Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('amount')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Preset Amount Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-600 transition cursor-pointer"
                  >
                    +₹{preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose / Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('categoryNote')}
              </label>
              <input
                type="text"
                placeholder="e.g. Grocery, Electricity, Rent"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickPurposes.map((qp) => (
                  <button
                    key={qp}
                    type="button"
                    onClick={() => setPurpose(qp)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* High-Value Cooldown Notification */}
            {isHighValue && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                <Clock className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>{t('highValueAlert')}</div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isFrozen}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t('clearingTransaction')}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{t('authorize')} {type}</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Live Feedback & Audit (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Result Card */}
          {result ? (
            <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl ${
              result.message.startsWith('SUCCESS')
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30'
                : result.message.startsWith('HELD')
                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30'
                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.message.startsWith('SUCCESS') ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : result.message.startsWith('HELD') ? (
                  <Clock className="h-5 w-5 text-amber-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                )}
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {result.message.startsWith('SUCCESS')
                    ? t('settledSuccess')
                    : result.message.startsWith('HELD')
                    ? t('placedInHold')
                    : t('blockedByFraud')}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-mono mb-2">{result.message}</p>
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center shadow-md">
              <Sparkles className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('initialIdleAudit')}
              </p>
            </div>
          )}

          {/* Real-time System Terminal */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-mono flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                {t('telemetryAuditLog')}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{t('telemetryLive')}</span>
            </div>
            <pre className="text-[11px] font-mono text-emerald-400 bg-slate-950/90 p-3 rounded-xl overflow-x-auto max-h-56 scrollbar-thin whitespace-pre-wrap">
              {result?.log || '// Transaction settlement engine active...\n// Waiting for transaction dispatch...'}
            </pre>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-cyan-500 flex-shrink-0" />
            <span>{t('deadlockFreeAssurance')}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
