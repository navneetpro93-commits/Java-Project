import React from 'react';
import { 
  Trophy, 
  Flame, 
  Target, 
  CheckCircle, 
  Calendar, 
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function ChallengeBoard({ overview }) {
  const challenges = overview?.challenges || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          Savings Goals & Milestones
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated 8-week micro-savings challenges, weekly streaks, and smart target progress.
        </p>
      </div>

      {/* Challenge Cards */}
      {challenges.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/40 border border-slate-800">
          <Trophy className="h-10 w-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-bold">No Active Savings Goals</p>
          <p className="text-xs text-slate-500 mt-1">Open a Savings Account to enroll in automated 8-week goal challenges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {challenges.map((ch, idx) => {
            const isFirst = idx === 0;
            const weeks = ch.weeks || [];

            return (
              <div
                key={ch.account}
                className={`p-6 rounded-3xl border transition-all ${
                  isFirst
                    ? 'bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 border-amber-500/40 shadow-xl'
                    : 'bg-slate-900/70 border-slate-800 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      isFirst 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {isFirst ? <Award className="h-6 w-6 text-amber-400" /> : `#${idx + 1}`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-base">{ch.title}</h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {ch.account}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Flame className="h-3.5 w-3.5 fill-amber-400" />
                          {ch.streak} Week Streak
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3.5 w-3.5 text-cyan-400" />
                          Weekly Target: ₹{ch.target}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium">Goal Progress</div>
                    <div className="text-2xl font-black font-mono text-cyan-400">
                      {Math.round(ch.progress)}%
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, ch.progress)}%` }}
                  />
                </div>

                {/* 8-Week Breakdown Grid */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Weekly Deposit History
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 font-mono text-xs">
                    {weeks.map((amt, wIdx) => {
                      const completed = amt >= ch.target;
                      return (
                        <div
                          key={wIdx}
                          className={`p-3 rounded-2xl border text-center transition ${
                            completed
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                              : amt > 0
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
                              : 'bg-slate-950/70 border-slate-800/80 text-slate-500'
                          }`}
                        >
                          <div className="text-[10px] uppercase font-sans text-slate-400 mb-0.5">
                            W{wIdx + 1}
                          </div>
                          <div>
                            ₹{amt}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
