"use client";

import { useState } from "react";
import { Search, Loader2, Zap, FolderGit2 } from "lucide-react";
import { StreakCard } from "./components/StreakCard";
import type { StreakStats } from "@/lib/github";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError("");
    setStats(null);

    try {
      const res = await fetch(`/api/streak?username=${encodeURIComponent(username.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch streak data");
      }

      setStats(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 selection:bg-green-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <main className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 sm:px-6 lg:px-8 py-20 pb-32 max-w-5xl mx-auto w-full">

        {/* Hero Section */}
        <div className="text-center w-full mb-12 sm:mb-16">

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-500 pb-2">
            GitHub Streak Stats
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
            Generate beautiful, highly accurate contribution streaks and embed them directly into your GitHub README.
          </p>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-xl mx-auto mb-16">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-white dark:bg-zinc-950 p-2 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800">
              <div className="pl-4 pr-1 text-zinc-400">
                <FolderGit2 size={24} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
                className="flex-1 w-full bg-transparent border-none focus:outline-none focus:ring-0 text-lg font-medium py-3 px-3 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={isLoading || !username.trim()}
                className="flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-black py-3 px-6 rounded-xl font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 mr-1 gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span className="hidden sm:inline">Calculate</span>
                    <Search size={20} className="sm:hidden" />
                  </>
                )}
              </button>
            </div>
          </form>
          {error && (
            <p className="mt-4 text-center text-red-500 font-medium transition-opacity animate-in fade-in slide-in-from-top-2">
              {error}
            </p>
          )}
        </div>

        {/* Stats Result or Empty State */}
        <div className="w-full min-h-[400px] flex items-center justify-center">
          {stats ? (
            <div className="w-full animate-in fade-in zoom-in-95 duration-500">
              <StreakCard stats={stats} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center opacity-50 dark:opacity-30 user-select-none">
              <div className="w-32 h-32 border-4 border-dashed border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center mb-6">
                <FolderGit2 size={48} className="text-zinc-400 dark:text-zinc-600" />
              </div>
              <p className="text-zinc-500 font-medium">Waiting for a github username...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
