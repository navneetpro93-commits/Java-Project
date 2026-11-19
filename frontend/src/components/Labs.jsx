import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Share2, 
  GitFork, 
  ShieldCheck, 
  Copy, 
  Zap, 
  Activity, 
  Server 
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Labs() {
  const { t } = useLanguage();
  const [runningLab, setRunningLab] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState('// FinGuard Multi-Threaded Settlement Engine Ready.\n// Click any stress test below to trigger concurrent transactions on the backend engine.');
  const [copied, setCopied] = useState(false);

  const runLab = async (labId, labName) => {
    setRunningLab(labId);
    setConsoleOutput(`// Initiating [${labName}]...\n// Spawning concurrent worker threads on runtime...\n`);
    try {
      let res;
      if (labId === 'race') {
        res = await api.runRaceLab();
      } else if (labId === 'priority') {
        res = await api.runPriorityLab();
      } else if (labId === 'freeze') {
        res = await api.runFreezeLab();
      }
      setConsoleOutput(res?.log || '// Stress test completed successfully.');
    } catch (err) {
      setConsoleOutput(`// Benchmark execution error:\n${err.message}`);
    } finally {
      setRunningLab(null);
    }
  };

  const copyLog = () => {
    navigator.clipboard.writeText(consoleOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const systemArchitectures = [
    {
      title: 'Atomic Transaction Isolation',
      desc: 'Synchronized memory barriers guarantee zero ledger drift under simultaneous multi-thread debits and credits.',
      icon: ShieldCheck,
      badge: 'High Integrity'
    },
    {
      title: 'Priority Settlement Queue',
      desc: 'Time-critical transactions (e.g. Payroll/Salary, Emergency Bills) automatically leapfrog standard retail transfers.',
      icon: Zap,
      badge: 'Dynamic Dispatch'
    },
    {
      title: 'Multi-Threaded Worker Pool',
      desc: 'Independent daemon threads handle bank clock ticks, cooldown monitoring, and asynchronous order settlement.',
      icon: Cpu,
      badge: 'Asynchronous'
    },
    {
      title: 'Automated Fraud Lockdown',
      desc: 'Immediate circuit breaker halts unauthorized debits across competing threads while preserving existing capital.',
      icon: AlertTriangle,
      badge: 'Fault Tolerant'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            {t('stressLabTitle')}
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
            System Diagnostics
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('stressLabSubtitle')}
        </p>
      </div>

      {/* Interactive Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Lab 1: Concurrency Race Test */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xl transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20">
                Data Integrity
              </span>
              <span className="text-xs font-mono text-slate-400">50 Worker Threads</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
              Unsynchronized vs Atomic Box
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Dispatches 50 worker threads executing 1,000 parallel debits and credits. Compares data loss in unsynchronized vaults against atomic synchronization.
            </p>
          </div>

          <button
            onClick={() => runLab('race', 'Concurrency Race Condition Test')}
            disabled={runningLab !== null}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {runningLab === 'race' ? (
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-slate-950" />
            )}
            {t('runRaceTest')}
          </button>
        </div>

        {/* Lab 2: Priority Clearing */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xl transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20">
                Load Clearing
              </span>
              <span className="text-xs font-mono text-slate-400">Priority Buffer</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
              Priority Settlement Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Simulates a burst of concurrent transaction requests. Verifies that high-priority payroll and bills leapfrog lower priority retail transfers.
            </p>
          </div>

          <button
            onClick={() => runLab('priority', 'Priority Settlement Stress Test')}
            disabled={runningLab !== null}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {runningLab === 'priority' ? (
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-slate-950" />
            )}
            {t('runPriorityTest')}
          </button>
        </div>

        {/* Lab 3: Emergency Freeze vs Worker Threads */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xl transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                Security Circuit
              </span>
              <span className="text-xs font-mono text-slate-400">Lock Interceptor</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
              Live Lock Interception
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Triggers competing worker withdrawal threads while simultaneously applying an emergency security freeze, confirming immediate debit blockage.
            </p>
          </div>

          <button
            onClick={() => runLab('freeze', 'Live Lock Interception Test')}
            disabled={runningLab !== null}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {runningLab === 'freeze' ? (
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-slate-950" />
            )}
            {t('runLockIntercept')}
          </button>
        </div>

      </div>

      {/* Real-time Execution Console */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-bold">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>Engine Output Telemetry (Real-Time Terminal Stream)</span>
          </div>

          <button
            onClick={copyLog}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 hover:text-white transition"
          >
            <Copy className="h-3 w-3" />
            {copied ? 'Copied' : 'Copy Output'}
          </button>
        </div>

        <pre className="font-mono text-xs text-emerald-400 bg-slate-950/80 p-4 rounded-2xl overflow-x-auto min-h-[160px] max-h-[320px] scrollbar-thin whitespace-pre-wrap leading-relaxed">
          {consoleOutput}
        </pre>
      </div>

      {/* Platform Architecture Highlights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-cyan-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Engine Architecture Highlights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemArchitectures.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.title}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-md transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    {item.title}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-10">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
