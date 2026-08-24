


"use client";

import { useState } from "react";
import { Trophy, Users, Flame, TrendingUp, Share2 } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  activeDays: number;
  rank: number;
  change: number;
}

// Mock leaderboard data - in production, this would come from a database
const MOCK_LEADERBOARD: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => ({
  username: `developer_${20 - i}`,
  currentStreak: Math.floor(Math.random() * 100) + 10,
  longestStreak: Math.floor(Math.random() * 200) + 50,
  totalContributions: Math.floor(Math.random() * 5000) + 500,
  activeDays: Math.floor(Math.random() * 365) + 100,
  rank: i + 1,
  change: i < 5 ? 0 : i < 10 ? 1 : -1,
}));

type TimeRange = "daily" | "weekly" | "all";

export default function LeaderboardPage() {
  const [leaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-400" size={18} />;
      case 2:
        return <Trophy className="text-gray-400" size={18} />;
      case 3:
        return <Trophy className="text-amber-600" size={18} />;
      default:
        return <span className="text-zinc-400 font-bold">{rank}</span>;
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change === 0) return null;
    if (change > 0) return <TrendingUp className="text-green-400" size={14} />;
    return <Flame className="text-red-400" size={14} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <main className="relative flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-500 pb-2">
            GitHub Streak Leaderboard
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
            Top developers by contribution streak. Check if you can make it to the top!
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Period:</span>
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
            {["all", "weekly", "daily"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as TimeRange)}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                  timeRange === range
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-200 dark:bg-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                  Developer
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                  Streak
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                  Longest
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                  Contributions
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr
                  key={entry.username}
                  className={`border-t border-zinc-200 dark:border-zinc-800 ${
                    index < 3 ? "bg-zinc-50 dark:bg-zinc-950" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {entry.rank}
                      </div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        @{entry.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {entry.currentStreak}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400"> days</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-lg font-bold text-yellow-500 dark:text-yellow-400">
                      {entry.longestStreak}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400"> days</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {entry.totalContributions.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getChangeIndicator(entry.change)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Your Own Leaderboard */}
        <div className="mt-12 w-full max-w-2xl">
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-purple-500" size={20} />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Create Your Own Leaderboard
              </h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Want to track your own developers or team? Create a custom leaderboard with your own metrics.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-sm hover:scale-105 transition-transform">
              <Share2 size={14} />
              <span>Generate Leaderboard Link</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
