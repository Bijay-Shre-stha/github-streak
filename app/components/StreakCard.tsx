import { StreakStats } from "@/lib/github";
import { Flame, Trophy, Activity, Calendar } from "lucide-react";

export function StreakCard({ stats }: { stats: StreakStats }) {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl p-[1px] bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-400 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 shadow-xl transition-all duration-500 hover:shadow-2xl">
      <div className="bg-white dark:bg-black rounded-[23px] overflow-hidden h-full w-full">
        <div className="p-8 sm:p-10 flex flex-col gap-8 relative overflow-hidden">
          
          {/* Subtle background glow effect (dark mode) */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-green-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-yellow-500/10 blur-3xl rounded-full" />

          {/* Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <img 
                  src={`https://github.com/${stats.username}.png`} 
                  alt={stats.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {stats.username}
                </h3>
                <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 gap-1 font-medium">
                  <Activity size={14} /> Git Streak
                </div>
              </div>
            </div>
            
            {stats.joinedYear && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <Calendar size={14} />
                Since {stats.joinedYear}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            
            {/* Total Contributions */}
            <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 group transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
              <span className="text-5xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter mb-2 group-hover:scale-110 transition-transform duration-300">
                {stats.totalContributions}
              </span>
              <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
                Total
              </span>
            </div>

            {/* Current Streak */}
            <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl bg-gradient-to-b from-green-500/10 to-transparent dark:from-green-500/20 border border-green-200 dark:border-green-500/20 group relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/5 dark:bg-green-500/10 transform scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Flame className="text-green-600 dark:text-green-500 fill-green-500/20" size={32} />
                <span className="text-5xl font-black text-green-700 dark:text-green-400 tracking-tighter group-hover:scale-110 transition-transform duration-300">
                  {stats.currentStreak}
                </span>
              </div>
              <span className="text-sm font-semibold text-green-700/70 dark:text-green-400/70 uppercase tracking-widest relative z-10">
                Current
              </span>
            </div>

            {/* Longest Streak */}
            <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl bg-gradient-to-b from-yellow-500/10 to-transparent dark:from-yellow-400/20 border border-yellow-200 dark:border-yellow-500/20 group relative overflow-hidden">
              <div className="absolute inset-0 bg-yellow-500/5 dark:bg-yellow-400/10 transform scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Trophy className="text-yellow-600 dark:text-yellow-500 fill-yellow-500/20" size={32} />
                <span className="text-5xl font-black text-yellow-700 dark:text-yellow-400 tracking-tighter group-hover:scale-110 transition-transform duration-300">
                  {stats.longestStreak}
                </span>
              </div>
              <span className="text-sm font-semibold text-yellow-700/70 dark:text-yellow-400/70 uppercase tracking-widest relative z-10">
                Longest
              </span>
            </div>

          </div>

          {/* Footer markdown link utility */}
          <div className="flex flex-col items-center gap-2 mt-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Embed in your README</span>
            <div className="w-full sm:w-auto relative group">
              <code className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 font-mono transition-colors group-hover:border-zinc-300 dark:group-hover:border-zinc-700">
                ![GitHub Streak](https://{typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/api/streak-image?username={stats.username})
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
