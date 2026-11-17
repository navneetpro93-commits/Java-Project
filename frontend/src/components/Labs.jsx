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
  BookOpen,
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';
import { api } from '../services/api';

export default function Labs() {
  const [runningLab, setRunningLab] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState('// Click any demo below to execute real-time Java multithreading threads...\n// Threads will spawn in Java JVM, run concurrent computations, and stream output here.');
  const [copied, setCopied] = useState(false);

  const runLab = async (labId, labName) => {
    setRunningLab(labId);
    setConsoleOutput(`// Launching [${labName}] on Java JVM...\n// Spawning worker threads...\n`);
    try {
      let res;
      if (labId === 'race') {
        res = await api.runRaceLab();
      } else if (labId === 'priority') {
        res = await api.runPriorityLab();
      } else if (labId === 'freeze') {
        res = await api.runFreezeLab();
      }
      setConsoleOutput(res?.log || '// Done without log output.');
    } catch (err) {
      setConsoleOutput(`// Error executing Java lab:\n${err.message}`);
    } finally {
      setRunningLab(null);
    }
  };

  const copyLog = () => {
    navigator.clipboard.writeText(consoleOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const javaConcepts = [
    {
      title: 'Object-Oriented Programming (OOP)',
      lecture: 'Lectures 1 - 10',
      icon: Layers,
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-300',
      items: [
        'Encapsulation: Private member fields, getters/setters, state integrity in Account and Customer.',
        'Abstract Classes: Account base class defining contract for withdraw(), credit(), and availableLimit().',
        'Inheritance & Polymorphism: SavingsAccount (vault savings & interest) and CurrentAccount (overdraft protection).',
        'Interfaces: Freezeable interface decoupling emergency account lockdown from account logic.'
      ]
    },
    {
      title: 'Exception Handling Hierarchy',
      lecture: 'Lectures 11 - 18',
      icon: AlertTriangle,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
      items: [
        'Custom Checked Exceptions: AccountFrozenException, InsufficientBalanceException.',
        'Custom Unchecked Exceptions: AccountNotFoundException, InvalidPinException.',
        'Defensive assertion: assertNotFrozen() halts execution before critical debit operations.'
      ]
    },
    {
      title: 'Java Collections Framework',
      lecture: 'Lectures 19 - 25',
      icon: GitFork,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
      items: [
        'HashMap: O(1) indexed lookups for accounts and customer credentials.',
        'ArrayList: Immutable audit ledger storage and transaction statement filtering.',
        'PriorityQueue & Comparator: TransactionPriorityComparator sorts by transaction importance (Salary > Bill > UPI).',
        'HashSet: Set operations for category spend vs budget analysis.'
      ]
    },
    {
      title: 'Multithreading & Concurrency',
      lecture: 'Lectures 26 - 31',
      icon: Zap,
      color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-300',
      items: [
        'Thread & Runnable: Daemon threads for BankClock and CooldownVault watcher.',
        'Race Conditions & Synchronization: SafeBox vs UnsafeBox race lab demonstrating synchronized blocks.',
        'Producer-Consumer Pattern: ClearingHouse bounded buffer utilizing wait() and notifyAll().',
        'Deadlock Prevention: Ordered account locking in lockAndMove() to eliminate circular wait conditions.'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            Interactive Concurrency Lab & Java Concepts
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            Semester 3 Project Showcase
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Trigger live multi-threaded simulations in the backend Java runtime and review the computer science concepts demonstrated.
        </p>
      </div>

      {/* Interactive Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Lab 1: Race Conditions */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                Race Condition
              </span>
              <span className="text-xs font-mono text-slate-500">RaceLab.java</span>
            </div>
            <h3 className="font-bold text-white text-base mb-1">
              Unsafe vs Synchronized Box
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Spawns 50 threads doing 1000 increment/decrements simultaneously. Demonstrates data loss without synchronization vs atomic safety with <code className="text-cyan-300">synchronized</code>.
            </p>
          </div>

          <button
            onClick={() => runLab('race', 'Race Condition Demo')}
            disabled={runningLab !== null}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {runningLab === 'race' ? (
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-slate-950" />
            )}
            Run Race Demo
          </button>
        </div>

        {/* Lab 2: Priority Clearing */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Producer-Consumer
              </span>
              <span className="text-xs font-mono text-slate-500">ClearingHouse.java</span>
            </div>
            <h3 className="font-bold text-white text-base mb-1">
              Priority Queue Clearing
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Dispatches concurrent requests (UPI, BILL, SALARY). Uses a custom <code className="text-cyan-300">Comparator</code> and bounded queue with <code className="text-cyan-300">wait()/notifyAll()</code> to clear high priority first.
            </p>
          </div>

          <button
            onClick={() => runLab('priority', 'Priority Clearing Demo')}
            disabled={runningLab !== null}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {runningLab === 'priority' ? (
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-slate-950" />
            )}
            Run Priority Demo
          </button>
        </div>

        {/* Lab 3: Freeze vs Worker Threads */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Thread Interruption
              </span>
              <span className="text-xs font-mono text-slate-500">CustomerWorker.java</span>
            </div>
            <h3 className="font-bold text-white text-base mb-1">
              Freeze vs Worker Threads
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Launches worker threads withdrawing while main thread invokes emergency freeze. Shows safe pre-emption and custom <code className="text-cyan-300">AccountFrozenException</code>.
            </p>
          </div>

          <button
            onClick={() => runLab('freeze', 'Freeze vs Worker Demo')}
            disabled={runningLab !== null}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {runningLab === 'freeze' ? (
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-slate-950" />
            )}
            Run Freeze Demo
          </button>
        </div>

      </div>

      {/* Real-time Execution Terminal */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>Java Execution Console Stream (JVM System.out)</span>
          </div>

          <button
            onClick={copyLog}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 hover:text-white transition"
          >
            <Copy className="h-3 w-3" />
            {copied ? 'Copied!' : 'Copy Log'}
          </button>
        </div>

        <pre className="font-mono text-xs text-emerald-400 bg-slate-950/80 p-4 rounded-xl overflow-x-auto min-h-[160px] max-h-[320px] scrollbar-thin whitespace-pre-wrap leading-relaxed">
          {consoleOutput}
        </pre>
      </div>

      {/* Java Syllabus & Academic Topics Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">
            Semester 3 Java Topics Implementation Map
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {javaConcepts.map((group) => {
            const Icon = group.icon;
            return (
              <div 
                key={group.title}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${group.color} border`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {group.title}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {group.lecture}
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-slate-400">
                  {group.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
