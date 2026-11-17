import React, { useState } from 'react';
import { 
  Lock, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function CooldownVault({ 
  overview, 
  currentTick, 
  onRefresh, 
  onCancelSuccess 
}) {
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const heldList = overview?.cooldown || [];

  const handleCancel = async (id) => {
    setCancellingId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await api.cancelCooldown(id);
      if (res.cancelled) {
        setMessage(`Transaction #${id} successfully cancelled and recalled.`);
        if (onCancelSuccess) onCancelSuccess();
      } else {
        setError(`Could not cancel #${id}: it may have already been cleared or settled.`);
      }
    } catch (err) {
      setError(err.message || 'Cancel request failed');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-400" />
              Cooldown Vault (Safety Hold Queue)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {heldList.length} Held
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Suspicious or high-value transfers are paused here for a cooling period, giving users time to cancel unauthorized debits.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs transition"
        >
          <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
          Sync Queue
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Queue Table */}
      {heldList.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <ShieldCheck className="h-12 w-12 text-emerald-500/50 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No Transactions Currently Held</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            All cleared transactions have been settled. Any future transactions exceeding threshold amounts or flagged by RuleEngine will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">From Account</th>
                  <th className="py-3 px-4">Recipient / Payee</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Cooldown Timer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {heldList.map((tx) => {
                  const ticksLeft = Math.max(0, (tx.readyTick || 0) - (currentTick || 0));
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-bold text-amber-400">
                        #{tx.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        {tx.fromAccount}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        {tx.toAccount || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-300">
                        {tx.purpose}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                          <span className="font-semibold text-amber-300">
                            {ticksLeft > 0 ? `${ticksLeft} ticks left` : 'Ready to settle'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            (At tick #{tx.readyTick})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleCancel(tx.id)}
                          disabled={cancellingId === tx.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-sans text-xs font-semibold transition disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {cancellingId === tx.id ? 'Cancelling...' : 'Cancel & Recall'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Java Multithreading Explanation */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <Info className="h-4 w-4 text-cyan-400" />
          How the Java Cooldown Engine Works:
        </div>
        <p>
          1. <span className="font-mono text-slate-200">BankClock</span> runs as a dedicated daemon thread advancing discrete bank ticks.
        </p>
        <p>
          2. <span className="font-mono text-slate-200">CooldownVault</span> monitors held transactions using synchronized locking. When bank clock ticks match <span className="font-mono text-slate-200">readyTick</span>, transactions are queued into the <span className="font-mono text-slate-200">ClearingHouse</span> for settlement.
        </p>
        <p>
          3. Calling <span className="font-mono text-slate-200">cancel(id)</span> atomically evicts the transaction from the hold list before the settlement worker thread acquires it.
        </p>
      </div>

    </div>
  );
}
