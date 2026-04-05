"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Loader2, Zap, FolderGit2, Palette } from "lucide-react";
import { StreakCard } from "./components/StreakCard";
import type { StreakStats } from "@/lib/github";
import { themes } from "@/lib/themes";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    setMounted(true);
  }, []);

  const lastFetchedUsername = useRef("");

  const fetchStreak = useCallback(async (targetUsername: string) => {
    if (!targetUsername.trim()) return;

    if (lastFetchedUsername.current === targetUsername.trim() && stats) {
      return;
    }

    setIsLoading(true);
    setError("");
    setStats(null);

    try {
      const res = await fetch(`/api/streak?username=${encodeURIComponent(targetUsername.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch streak data");
      }

      setStats(data);
      lastFetchedUsername.current = targetUsername.trim();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const target = username.trim();
      if (target) {
        fetchStreak(target);
      } else {
        setStats(null);
        setError("");
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [username, fetchStreak]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      fetchStreak(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 selection:bg-green-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <main className="relative flex flex-col lg:flex-row items-center justify-center lg:justify-between min-h-[90vh] px-4 sm:px-6 lg:px-8 py-20 pb-32 max-w-7xl mx-auto w-full gap-12 lg:gap-8">

        {/* Left Column: Hero & Search */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">

          {/* Hero Section */}
          <div className="w-full">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-500 pb-2">
              GitHub Streak Stats
            </h1>
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              Generate beautiful, highly accurate contribution streaks and embed them directly into your GitHub README.
            </p>
          </div>

          {/* Search Form */}
          <div className="w-full max-w-xl mx-auto lg:mx-0">
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
                  autoFocus
                />
                {username && (
                  <button
                    type="button"
                    onClick={() => { setUsername(""); setStats(null); setError(""); }}
                    className="mr-2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!mounted || isLoading || username.trim() === ""}
                  suppressHydrationWarning
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
              <p className="mt-4 text-center lg:text-left text-red-500 font-medium transition-opacity animate-in fade-in slide-in-from-top-2">
                {error}
              </p>
            )}

            {/* Quick Suggestions */}
            <div className="mt-4 flex items-center justify-center lg:justify-start gap-2 text-sm text-zinc-500 font-medium">
              <span>Try:</span>
              {["torvalds", "getify", "bijay-shre-stha"].map(user => (
                <button
                  key={user}
                  type="button"
                  onClick={() => {
                    setUsername(user);
                  }}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                >
                  {user}
                </button>
              ))}
            </div>
            
            {/* Theme Selector */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="flex items-center gap-1.5 mr-1 bg-zinc-100 dark:bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800/50 text-zinc-500 shadow-sm">
                <Palette size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Theme</span>
              </div>
              {Object.keys(themes).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${theme === t
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md scale-105 ring-2 ring-zinc-900/10 dark:ring-white/10"
                      : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:scale-105"
                    }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Stats Result or Empty State */}
        <div className="w-full lg:w-[55%] xl:w-1/2 min-h-[400px] flex items-center justify-center lg:justify-end">
          {isLoading && !stats ? (
            <div className="flex flex-col items-center justify-center opacity-70 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                <Zap className="text-zinc-400 dark:text-zinc-500 animate-pulse" size={28} />
              </div>
              <p className="text-zinc-500 font-medium animate-pulse">Calculating streak...</p>
            </div>
          ) : stats ? (
            <div className="w-full animate-in fade-in flex flex-col gap-6 zoom-in-95 duration-500">
              <StreakCard stats={stats} themeName={theme} />
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">Tip:</span> You can embed this in your GitHub README!
                </div>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center opacity-50 dark:opacity-40 user-select-none transition-opacity duration-300 hover:opacity-70 dark:hover:opacity-60">
              <div className="w-32 h-32 border-4 border-dashed border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center mb-6 bg-zinc-50 dark:bg-zinc-900/50">
                <Search size={40} className="text-zinc-400 dark:text-zinc-500" />
              </div>
              <p className="text-zinc-500 font-medium">Search for a username to see their streak.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
