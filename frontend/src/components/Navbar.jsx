import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Layers, 
  ArrowLeftRight, 
  Lock, 
  ReceiptText, 
  PieChart, 
  Trophy, 
  Cpu, 
  User, 
  RefreshCw 
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  tick, 
  isOnline, 
  customers, 
  activeCustomer, 
  setActiveCustomer,
  cooldownCount,
  onRefresh,
  loading
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
    { 
      id: 'cooldown', 
      label: 'Cooldown Vault', 
      icon: Lock, 
      badge: cooldownCount > 0 ? cooldownCount : null 
    },
    { id: 'statements', label: 'Ledger & Audit', icon: ReceiptText },
    { id: 'spending', label: 'Spending Intel', icon: PieChart },
    { id: 'challenges', label: 'Savings Board', icon: Trophy },
    { id: 'labs', label: 'Java Concurrency Lab', icon: Cpu, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  FinGuard
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Java Core
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Intelligent Banking Safety Console</p>
            </div>
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center gap-3">
            {/* Live Bank Clock */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <Clock className="h-3.5 w-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-slate-400">Bank Clock:</span>
              <span className="font-mono font-semibold text-cyan-300">
                Tick #{tick !== null ? tick : '--'}
              </span>
            </div>

            {/* Online Status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="hidden md:inline">{isOnline ? 'Backend Connected' : 'Connecting...'}</span>
            </div>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Customer Switcher */}
            {customers && customers.length > 0 && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <User className="h-4 w-4 text-slate-400 hidden sm:block" />
                <select
                  value={activeCustomer?.id || ''}
                  onChange={(e) => {
                    const selected = customers.find(c => c.id === e.target.value);
                    if (selected) setActiveCustomer(selected);
                  }}
                  className="bg-slate-900 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : item.highlight
                    ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-cyan-400' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
