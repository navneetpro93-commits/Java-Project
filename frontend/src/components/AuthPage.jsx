import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  Sun, 
  Moon, 
  ChevronDown, 
  Check, 
  CreditCard, 
  Sparkles,
  Zap,
  Activity,
  Shield,
  Layers,
  ArrowUpRight,
  Wifi
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function AuthPage({ onLoginSuccess }) {
  // Start on 'signup' mode so user can create account first as requested
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  
  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupAccountType, setSignupAccountType] = useState('SAVINGS');
  const [signupDeposit, setSignupDeposit] = useState('15000');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t, supportedLanguages, currentLanguageObj } = useLanguage();

  // 1. SIGN UP: Saves directly to MySQL database, then switches to Sign In
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const user = signupUsername.trim();
    const pass = signupPassword.trim();

    if (!user || user.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!pass || pass.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (pass.toLowerCase() !== signupConfirmPassword.trim().toLowerCase()) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        username: user,
        password: pass,
        name: signupName.trim() || user,
        accountType: signupAccountType,
        deposit: Number(signupDeposit) || 10000,
      });

      setSuccessMessage(`✔ Account created successfully! Please sign in with your username "${user}".`);
      setLoginUsername(user);
      setLoginPassword('');
      setMode('login');
    } catch (err) {
      setError(err.message || 'Failed to register account in database.');
    } finally {
      setLoading(false);
    }
  };

  // 2. SIGN IN: Verifies username and password against MySQL database
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const user = loginUsername.trim();
    const pass = loginPassword.trim();

    if (!user) {
      setError('Please enter your Username.');
      return;
    }
    if (!pass) {
      setError('Please enter your Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(user, pass);
      if (res && res.customer) {
        onLoginSuccess(res.customer);
      } else {
        throw new Error('Authentication failed.');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-200">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Controls (Theme & Multilingual API) */}
      <header className="relative z-50 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between">
        
        {/* Brand Logo Pill */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
            <div className="h-full w-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
              FinGuard
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live MySQL Core
            </span>
          </div>
        </div>

        {/* Floating Language & Theme Controls */}
        <div className="flex items-center gap-2">
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md transition hover:border-slate-300 dark:hover:border-slate-700"
            >
              <span className="text-sm">{currentLanguageObj.flag}</span>
              <span className="hidden sm:inline">{currentLanguageObj.name}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-fade-in">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition ${
                      language === lang.code
                        ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    {language === lang.code && <Check className="h-3.5 w-3.5 text-cyan-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm backdrop-blur-md hover:text-slate-900 dark:hover:text-white transition"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>
        </div>

      </header>

      {/* Main Expansive 2-Column Responsive Layout */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">
          
          {/* Left Column: Brand Showcase, Visual Pillars & Virtual Card Mockup */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 lg:pr-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              Autonomous Banking Safety & Enterprise Security
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Intelligent Banking With{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600">
                Real-Time MySQL Protection
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Engineered with ACID atomic ledger isolation, multi-threaded priority clearing, and automatic fraud quarantine for complete financial peace of mind.
            </p>

            {/* Visual Feature Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Fraud Quarantine Vault</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  High-risk payments and new payees are held with instant 1-click recall.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <Zap className="h-4 w-4 text-cyan-500" />
                  <span>Zero-Drift Atomic Isolation</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Simultaneous multi-threaded debits maintain 100% mathematical balance parity.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  <span>Live Database Persistence</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Every deposit, withdrawal, and transfer commits immediately to local MySQL.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <Lock className="h-4 w-4 text-purple-500" />
                  <span>Case-Insensitive Sign In</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Seamless universal credentials recognition without capital letter friction.
                </p>
              </div>
            </div>

            {/* Interactive Sleek Debit Card Mockup */}
            <div className="hidden sm:block pt-2">
              <div className="max-w-md p-5 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">FinGuard Platinum</div>
                    <div className="text-xs font-semibold text-cyan-400">Debit SmartCard</div>
                  </div>
                  <Wifi className="h-5 w-5 text-slate-400 rotate-90" />
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-200 to-amber-400 border border-amber-300/40 shadow-sm" />
                  <span className="font-mono text-sm tracking-widest text-slate-300">•••• •••• •••• 1001</span>
                </div>

                <div className="flex justify-between items-end text-xs">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500">Account Holder</div>
                    <div className="font-bold tracking-wide">
                      {signupName || signupUsername || 'Authorized Customer'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wider text-slate-500">Security Core</div>
                    <div className="font-mono font-bold text-emerald-400 text-[11px]">256-Bit SSL Active</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Spacious, Enhanced & Balanced Responsive Form Card */}
          <div className="lg:col-span-6 xl:col-span-5 w-full">
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-colors">
              
              {/* Card Header & Tab Switcher */}
              <div className="mb-6 space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {mode === 'signup' ? 'Open Your Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {mode === 'signup' 
                      ? 'Register in seconds and connect directly to your secure MySQL ledger'
                      : 'Sign in to access your accounts, transfers, and safety vault'}
                  </p>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
                    className={`py-2 text-xs font-bold rounded-xl transition ${
                      mode === 'signup'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    1. Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className={`py-2 text-xs font-bold rounded-xl transition ${
                      mode === 'login'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    2. Sign In
                  </button>
                </div>
              </div>

              {/* Success Banner */}
              {successMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. SIGN UP FORM */}
              {mode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  
                  {/* Row 1: Username & Full Name Side-by-Side on Tablet/Desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Choose Username *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. navneet18"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 font-medium transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Navneet Kumar"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                      />
                    </div>
                  </div>

                  {/* Row 2: Password & Confirm Password Side-by-Side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Password *
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Account Type & Opening Deposit Side-by-Side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Account Type
                      </label>
                      <select
                        value={signupAccountType}
                        onChange={(e) => setSignupAccountType(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 font-medium transition"
                      >
                        <option value="SAVINGS">Savings Account (4.5% APY)</option>
                        <option value="CURRENT">Current Account (₹5,000 Overdraft)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Opening Deposit (₹)
                      </label>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={signupDeposit}
                        onChange={(e) => setSignupDeposit(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setError(null); }}
                        className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                      >
                        Sign In here
                      </button>
                    </span>
                  </div>
                </form>
              )}

              {/* 2. SIGN IN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your Username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 font-medium transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Enter your Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 tracking-wider transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Need a new account?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('signup'); setError(null); }}
                        className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                      >
                        Create one here
                      </button>
                    </span>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Subtle Bottom Trust Badges */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>FinGuard Banking Core v2.0 • ISO 27001 Certified System Protocol</span>
        </div>
        <div>
          <span>256-Bit SSL End-to-End Cryptographic Security</span>
        </div>
      </footer>

    </div>
  );
}
