"use client";

import { useEffect, useRef, useState, type SubmitEvent, type ReactElement } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Palette } from "lucide-react";
import { StreakCard } from "../components/StreakCard";
import { CopyButton } from "../components/CopyButton";
import { themes } from "@/lib/themes";
import type { StreakStats } from "@/lib/github";
import { getJson, isAbortError } from "@/lib/apiClient";
import { normalizeUsername, validateGitHubUsername } from "@/lib/validation";
import { profileUrl, readmeMarkdown, streakImageUrl } from "@/lib/share";

// Sample data for previews before a username is entered (labeled in the UI).
const sampleStats: StreakStats = {
  username: "sample-user",
  totalContributions: 2450,
  currentStreak: 12,
  longestStreak: 45,
  joinedYear: 2020,
  totalContributionsStart: "2020-03-10",
  currentStreakStart: "2024-08-10",
  currentStreakEnd: "2024-08-21",
  longestStreakStart: "2024-01-01",
  longestStreakEnd: "2024-02-14",
};

const PLACEHOLDER = "YOUR_USERNAME";
const BUTTON =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800";

export default function ThemeGalleryPage(): ReactElement {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const preview = async (raw: string): Promise<void> => {
    const name = normalizeUsername(raw);
    setInput(name);
    if (!validateGitHubUsername(name).valid) {
      setError("Enter a valid GitHub username.");
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError("");
    try {
      const data = await getJson<StreakStats>(
        `/api/streak?username=${encodeURIComponent(name)}`,
        controller.signal,
      );
      setStats(data);
      window.history.replaceState({}, "", `/themes?username=${encodeURIComponent(data.username)}`);
    } catch (err) {
      if (isAbortError(err)) return;
      setStats(null);
      setError(err instanceof Error ? err.message : "Couldn't load that user");
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  useEffect(() => {
    const username = new URLSearchParams(window.location.search).get("username");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (username) void preview(username);
    return () => abortRef.current?.abort();
  }, []);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void preview(input);
  };

  const shown = stats ?? sampleStats;
  const embedUser = stats?.username ?? PLACEHOLDER;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <main className="relative flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 max-w-7xl mx-auto w-full">
        <nav aria-label="Breadcrumb" className="w-full mb-6">
          <Link href="/" className={BUTTON}>
            <ArrowLeft size={14} aria-hidden />
            Home
          </Link>
        </nav>

        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Theme Gallery
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-700 dark:text-zinc-300">
            Preview every streak card theme with your own stats, then copy the
            README Markdown for the one you like.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex gap-2 mb-2" noValidate>
          <label htmlFor="preview-username" className="sr-only">GitHub username to preview</label>
          <input
            id="preview-username"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your GitHub username"
            className="flex-1 min-w-0 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2 placeholder:text-zinc-500"
            spellCheck={false}
            autoCapitalize="none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold disabled:opacity-50"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Preview
          </button>
        </form>
        <div role="status" aria-live="polite" className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 min-h-5">
          {isLoading
            ? "Loading your stats…"
            : stats
              ? `Showing real stats for @${stats.username}.`
              : "Previews show sample data until you enter a username."}
        </div>
        {error && (
          <p role="alert" className="-mt-6 mb-8 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {Object.keys(themes).map((themeName) => {
            const displayName = themeName.charAt(0).toUpperCase() + themeName.slice(1);
            return (
              <section
                key={themeName}
                aria-labelledby={`theme-${themeName}`}
                className="flex flex-col bg-white dark:bg-zinc-950 rounded-3xl p-5 shadow-xl border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 id={`theme-${themeName}`} className="text-xl font-bold">{displayName}</h2>
                  {!stats && (
                    <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                      Sample data
                    </span>
                  )}
                </div>
                <StreakCard stats={shown} themeName={themeName} showEmbed={false} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyButton
                    text={readmeMarkdown(embedUser, themeName)}
                    label="Copy README Markdown"
                    ariaLabel={`Copy README Markdown for the ${displayName} theme`}
                  />
                  {stats && (
                    <Link href={`/${encodeURIComponent(stats.username)}?theme=${themeName}`} className={BUTTON}>
                      Open profile with {displayName}
                    </Link>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-16 w-full max-w-3xl">
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Palette className="text-purple-500" size={20} aria-hidden />
              How to use these themes
            </h2>
            <div className="grid gap-4">
              <div>
                <p className="font-semibold mb-1">README image (Markdown):</p>
                <code className="block w-full p-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-sm font-mono overflow-x-auto whitespace-pre">
                  {readmeMarkdown(embedUser, "radical")}
                </code>
              </div>
              <div>
                <p className="font-semibold mb-1">Image URL only:</p>
                <code className="block w-full p-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-sm font-mono overflow-x-auto whitespace-pre">
                  {streakImageUrl(embedUser, "radical")}
                </code>
              </div>
              <div>
                <p className="font-semibold mb-1">Shareable profile page:</p>
                <code className="block w-full p-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-sm font-mono overflow-x-auto whitespace-pre">
                  {profileUrl(embedUser, "radical")}
                </code>
              </div>
              {!stats && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Replace {PLACEHOLDER} with your GitHub username. Valid themes:{" "}
                  {Object.keys(themes).join(", ")}.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
