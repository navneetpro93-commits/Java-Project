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
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          Savings Challenge Leaderboard
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Gamified 8-week automated micro-savings tracker ranked with Java Comparator & Collections.sort().
        </p>
      </div>

      {/* Challenge Cards */}
      {challenges.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <Trophy className="h-10 w-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-semibold">No Challenges Enrolled Yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {challenges.map((ch, idx) => {
            const isFirst = idx === 0;
            const weeks = ch.weeks || [];

            return (
              <div
                key={ch.account}
                className={`p-5 rounded-2xl border transition-all ${
                  isFirst
                    ? 'bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 border-amber-500/40 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isFirst 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {isFirst ? <Award className="h-6 w-6 text-amber-400" /> : `#${idx + 1}`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{ch.title}</h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          Account: {ch.account}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
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
                    <div className="text-xs text-slate-400">Total Completion</div>
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
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    8-Week Contribution Tracker
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 font-mono text-xs">
                    {weeks.map((amt, wIdx) => {
                      const completed = amt >= ch.target;
                      return (
                        <div
                          key={wIdx}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            completed
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : amt > 0
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                          }`}
                        >
                          <div className="text-[10px] uppercase font-sans text-slate-400 mb-0.5">
                            W{wIdx + 1}
                          </div>
                          <div className="font-bold">
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

      {/* Java Architecture Note */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-1">
        <span className="font-semibold text-slate-300">Java Concept Highlights:</span>
        <p>• Uses arrays for week buckets: <span className="font-mono text-slate-200">double[] weeks = new double[8]</span>.</p>
        <p>• Ranks accounts dynamically using a custom <span className="font-mono text-slate-200">Comparator&lt;SavingsChallenge&gt;</span> prioritizing highest streaks and progress percent.</p>
      </div>

    </div>
  );
}
