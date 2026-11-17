import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  KeyRound,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  
  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPin, setLoginPin] = useState('');

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupPin, setSignupPin] = useState('');
  const [signupAccountType, setSignupAccountType] = useState('SAVINGS');
  const [signupDeposit, setSignupDeposit] = useState('25000');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quick Demo Logins
  const demoAccounts = [
    { id: 'C101', name: 'Navneet', pin: '1234', role: 'Premier Account', accounts: 'FG1001, FG1002' },
    { id: 'C102', name: 'Aarav', pin: '2345', role: 'Savings Account', accounts: 'FG1003' },
    { id: 'C103', name: 'Meera', pin: '3456', role: 'Smart Investor', accounts: 'FG1004' },
  ];

  const handleQuickLogin = async (demo) => {
    setLoginId(demo.id);
    setLoginPin(demo.pin);
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(demo.id, demo.pin);
      if (res && res.customer) {
        onLoginSuccess(res.customer);
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !loginPin.trim()) {
      setError('Please provide both Customer ID and Security PIN.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.login(loginId.trim(), loginPin.trim());
      if (res && res.customer) {
        onLoginSuccess(res.customer);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your Customer ID and PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupName.trim()) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!signupPin.trim() || signupPin.length < 4) {
      setError('Security PIN must be at least 4 digits.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Create Customer
      const custRes = await api.createCustomer(signupName.trim(), signupPin.trim());
      const newCustomer = custRes?.customer;

      if (!newCustomer || !newCustomer.id) {
        throw new Error('Registration failed. Please try again.');
      }

      // 2. Open Primary Account for this customer
      const opening = Number(signupDeposit) || 10000;
      await api.createAccount(newCustomer.id, signupAccountType, opening);

      // 3. Complete authentication
      onLoginSuccess(newCustomer);
    } catch (err) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/20 mb-3">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            FinGuard
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Next-Generation Smart Banking & Real-Time Fraud Protection
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                mode === 'login'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                mode === 'signup'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Customer ID
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. C101"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Security PIN
                  </label>
                  <span className="text-[11px] text-slate-500">4-6 Digits</span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••"
                    maxLength={6}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono tracking-widest"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Secure Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Aryan Malhotra"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Create Security PIN (4-6 digits)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Enter 4-digit PIN"
                    maxLength={6}
                    value={signupPin}
                    onChange={(e) => setSignupPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono tracking-widest"
                  />
                </div>
              </div>

              {/* Account Type Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupAccountType('SAVINGS')}
                    className={`p-3 rounded-xl border text-left transition ${
                      signupAccountType === 'SAVINGS'
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">Savings Account</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Auto-vault savings + 4.5% yield</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupAccountType('CURRENT')}
                    className={`p-3 rounded-xl border text-left transition ${
                      signupAccountType === 'CURRENT'
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">Current Account</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">₹5,000 Overdraft limit</div>
                  </button>
                </div>
              </div>

              {/* Initial Deposit */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Initial Deposit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    value={signupDeposit}
                    onChange={(e) => setSignupDeposit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Open Bank Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* QUICK DEMO LOGIN PRESETS */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Instant Demo Access
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Sign In</span>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  disabled={loading}
                  className="w-full p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono">
                      {demo.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                        {demo.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {demo.role} • <span className="font-mono text-slate-500">{demo.id}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono group-hover:border-cyan-500/30 group-hover:text-cyan-300 transition">
                    PIN: {demo.pin} →
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
          <span>Protected with 256-bit encryption & multi-threaded fraud shield</span>
        </div>

      </div>

    </div>
  );
}
