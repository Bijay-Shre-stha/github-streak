"use client";

import { useState, useEffect, useRef, type SubmitEvent, type ReactElement } from "react";
import {
  Search,
  Loader2,
  Zap,
  FolderGit2,
  Palette,
  GitCompareArrows,
  Trophy,
  Code,
  Globe,
  History,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { StreakCard } from "./components/StreakCard";
import { ExtraStatsCard } from "./components/ExtraStatsCard";
import { CompareStatsCard } from "./components/CompareStatsCard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ShareButtons } from "./components/ShareButtons";
import { CopyButton } from "./components/CopyButton";
import type { ExtendedStreakStats } from "@/lib/github";
import type { ComparedStreakStats } from "@/lib/streakCompare";
import { themes } from "@/lib/themes";
import {
  normalizeUsername,
  resolveTheme,
  validateGitHubUsername,
} from "@/lib/validation";
import { getJson, isAbortError } from "@/lib/apiClient";
import { loadRecent, mergeRecent, saveRecent } from "@/lib/recentSearches";
import { SITE_URL, compareUrl, profileUrl, readmeMarkdown } from "@/lib/share";

type ViewMode = "single" | "compare";

interface Query {
  username?: string;
  userA?: string;
  userB?: string;
}

const FAQ = [
  {
    q: "Are private contributions included?",
    a: "Only when GitHub exposes them. Counts come from the GitHub contribution calendar, which includes private contributions when the user has enabled “Include private contributions on my profile” in their GitHub settings, or when this site's GitHub token has access to those repositories. Otherwise only public contributions are counted.",
  },
  {
    q: "How is the current streak calculated?",
    a: "A streak is a run of consecutive days with at least one contribution, using UTC calendar dates. If today has no contributions yet, a streak that reached yesterday still counts as current.",
  },
  {
    q: "How do I add the streak card to my README?",
    a: "Search your username, then use “Copy README Markdown” and paste the snippet into your profile README.md. The image updates automatically; responses may be cached for up to an hour.",
  },
  {
    q: "Do you store my searches?",
    a: "No account is needed. Recent searches are saved only in your browser's local storage so you can view them again, and you can clear them at any time.",
  },
];

const SINGLE_EXAMPLES = ["torvalds", "gaearon", "sindresorhus"];
const COMPARE_EXAMPLES = [
  ["torvalds", "gaearon"],
  ["getify", "sindresorhus"],
] as const;

const CHIP =
  "px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors";
const SECONDARY_BUTTON =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800";

export default function Home(): ReactElement {
  const [mode, setMode] = useState<ViewMode>("single");
  const [username, setUsername] = useState("");
  const [userA, setUserA] = useState("");
  const [userB, setUserB] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<ExtendedStreakStats | null>(null);
  const [compareStats, setCompareStats] = useState<ComparedStreakStats | null>(
    null,
  );
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("default");
  const [query, setQuery] = useState<Query>({});
  const [recent, setRecent] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const userAInputRef = useRef<HTMLInputElement>(null);

  /** Cancel any in-flight request and start a new one. */
  const startRequest = (): AbortSignal => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    return abortRef.current.signal;
  };

  const runSingle = async (input: string): Promise<void> => {
    const name = normalizeUsername(input);
    if (!name) return;
    setUsername(name);

    if (!validateGitHubUsername(name).valid) {
      setError(
        "That doesn't look like a GitHub username. Use letters, numbers and single hyphens (max 39 characters).",
      );
      return;
    }
    if (stats && stats.username.toLowerCase() === name.toLowerCase()) return;

    const signal = startRequest();
    setQuery({ username: name });
    setIsLoading(true);
    setError("");
    setStats(null);
    setCompareStats(null);

    try {
      const data = await getJson<ExtendedStreakStats>(
        `/api/streak?username=${encodeURIComponent(name)}&variant=extended`,
        signal,
      );
      setStats(data);
      setRecent((prev) => {
        const next = mergeRecent(prev, data.username);
        saveRecent(next);
        return next;
      });
    } catch (err) {
      if (isAbortError(err)) return;
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  };

  const runCompare = async (inputA: string, inputB: string): Promise<void> => {
    const a = normalizeUsername(inputA);
    const b = normalizeUsername(inputB);
    setUserA(a);
    setUserB(b);
    if (!a || !b) {
      setError("Enter two GitHub usernames to compare.");
      return;
    }
    for (const [label, name] of [["first", a], ["second", b]] as const) {
      if (!validateGitHubUsername(name).valid) {
        setError(`The ${label} username "${name}" isn't a valid GitHub username.`);
        return;
      }
    }
    if (a.toLowerCase() === b.toLowerCase()) {
      setError("Those are the same user. Enter two different GitHub usernames.");
      return;
    }
    if (
      compareStats &&
      compareStats.userA.username.toLowerCase() === a.toLowerCase() &&
      compareStats.userB.username.toLowerCase() === b.toLowerCase()
    ) {
      return;
    }

    const signal = startRequest();
    setQuery({ userA: a, userB: b });
    setIsLoading(true);
    setError("");
    setStats(null);
    setCompareStats(null);

    try {
      const data = await getJson<ComparedStreakStats>(
        `/api/streak-compare?userA=${encodeURIComponent(a)}&userB=${encodeURIComponent(b)}`,
        signal,
      );
      setCompareStats(data);
    } catch (err) {
      if (isAbortError(err)) return;
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  };

  // Read URL + localStorage after mount (see CLAUDE.md: avoids hydration mismatch)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialMode: ViewMode =
      searchParams.get("mode") === "compare" ? "compare" : "single";
    let savedTheme = "";
    try {
      savedTheme = window.localStorage.getItem("streak-theme") ?? "";
    } catch {
      // storage unavailable
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    setMode(initialMode);
    setTheme(resolveTheme(searchParams.get("theme") ?? savedTheme));
    setRecent(loadRecent());
    setIsInitialized(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (initialMode === "single" && searchParams.get("username")) {
      void runSingle(searchParams.get("username") ?? "");
    } else if (initialMode === "compare") {
      const a = searchParams.get("userA") ?? "";
      const b = searchParams.get("userB") ?? "";
      if (a && b) void runCompare(a, b);
      else {
        setUserA(a);
        setUserB(b);
      }
    }
    return () => abortRef.current?.abort();
    // Runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL shareable: it reflects the last submitted query + theme.
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();
    if (mode === "compare") params.set("mode", "compare");
    if (mode === "single" && query.username) params.set("username", query.username);
    if (mode === "compare" && query.userA && query.userB) {
      params.set("userA", query.userA);
      params.set("userB", query.userB);
    }
    if (theme !== "default") params.set("theme", theme);

    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `/?${qs}` : "/");
    try {
      window.localStorage.setItem("streak-theme", theme);
    } catch {
      // storage unavailable
    }
  }, [mode, query, theme, isInitialized]);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (mode === "single") void runSingle(username);
    else void runCompare(userA, userB);
  };

  const switchMode = (next: ViewMode): void => {
    if (next === mode) return;
    abortRef.current?.abort();
    setIsLoading(false);
    setMode(next);
    setError("");
    setQuery({});
    setStats(null);
    setCompareStats(null);
  };

  const trackAnother = (): void => {
    abortRef.current?.abort();
    setIsLoading(false);
    setStats(null);
    setUsername("");
    setQuery({});
    setError("");
    usernameInputRef.current?.focus();
  };

  const compareAgain = (): void => {
    abortRef.current?.abort();
    setIsLoading(false);
    setCompareStats(null);
    setUserA("");
    setUserB("");
    setQuery({});
    setError("");
    userAInputRef.current?.focus();
  };

  const clearRecent = (): void => {
    setRecent([]);
    saveRecent([]);
  };

  const hasResults = mode === "single" ? Boolean(stats) : Boolean(compareStats);
  const statusMessage = isLoading
    ? mode === "single"
      ? "Calculating streak…"
      : "Comparing users…"
    : stats
      ? `Loaded streak for ${stats.username}: current streak ${stats.currentStreak} days, longest ${stats.longestStreak} days.`
      : compareStats
        ? `Loaded comparison of ${compareStats.userA.username} and ${compareStats.userB.username}.`
        : "";

  const modeButton = (active: boolean): string =>
    `inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
      active
        ? "bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white"
        : "bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 selection:bg-green-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "GitHub Streak Stats",
              url: SITE_URL,
              description:
                "See a GitHub user's current and longest contribution streak and embed a streak card in a README.",
              isPartOf: { "@type": "WebSite", name: "GitHub Streak Stats", url: SITE_URL },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            },
          ]),
        }}
      />

      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <main className="relative flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between min-h-[90vh] px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl mx-auto w-full gap-12 lg:gap-8">

        {/* Left Column: Hero & Search */}
        <div className="w-full lg:w-[45%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">

          {/* Hero Section */}
          <div className="w-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 bg-clip-text text-transparent bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-400 pb-2">
              Your GitHub streak, ready for your README
            </h1>
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Enter a GitHub username to see the{" "}
              <span className="font-semibold text-green-700 dark:text-green-400">current streak</span>,{" "}
              <span className="font-semibold text-amber-700 dark:text-amber-400">longest streak</span>{" "}
              and total contributions, then copy a card into your profile README.
            </p>
          </div>

          <div className="w-full flex items-center justify-center lg:justify-start gap-3" role="group" aria-label="Mode">
            <button type="button" onClick={() => switchMode("single")} aria-pressed={mode === "single"} className={modeButton(mode === "single")}>
              <UserRound size={15} aria-hidden />
              Single user
            </button>
            <button type="button" onClick={() => switchMode("compare")} aria-pressed={mode === "compare"} className={modeButton(mode === "compare")}>
              <GitCompareArrows size={15} aria-hidden />
              Compare two
            </button>
          </div>

          {/* Search Form */}
          <div className="w-full max-w-xl mx-auto lg:mx-0">
            <form onSubmit={handleSubmit} className="relative group" noValidate>
              <div className="absolute -inset-1 bg-linear-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex items-center bg-white dark:bg-zinc-950 p-2 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800 gap-2 focus-within:ring-2 focus-within:ring-green-600">
                {mode === "single" ? (
                  <>
                    <div className="pl-3 pr-1 text-zinc-500" aria-hidden>
                      <FolderGit2 size={22} />
                    </div>
                    <label htmlFor="username" className="sr-only">
                      GitHub username
                    </label>
                    <input
                      id="username"
                      ref={usernameInputRef}
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="GitHub username, e.g. torvalds"
                      className="flex-1 min-w-0 w-full bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none text-lg font-medium py-3 px-2 placeholder:text-zinc-500"
                      spellCheck={false}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoFocus
                    />
                    {username && (
                      <button
                        type="button"
                        onClick={trackAnother}
                        aria-label="Clear username"
                        className="mr-1 p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                      >
                        <X size={18} aria-hidden />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="pl-3 text-zinc-500" aria-hidden>
                      <GitCompareArrows size={22} />
                    </div>
                    <label htmlFor="userA" className="sr-only">
                      First GitHub username
                    </label>
                    <input
                      id="userA"
                      ref={userAInputRef}
                      type="text"
                      value={userA}
                      onChange={(e) => setUserA(e.target.value)}
                      placeholder="first user"
                      className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-base font-medium py-3 px-2 placeholder:text-zinc-500"
                      spellCheck={false}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoFocus
                    />
                    <span className="text-zinc-500 font-semibold text-xs" aria-hidden>vs</span>
                    <label htmlFor="userB" className="sr-only">
                      Second GitHub username
                    </label>
                    <input
                      id="userB"
                      type="text"
                      value={userB}
                      onChange={(e) => setUserB(e.target.value)}
                      placeholder="second user"
                      className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-base font-medium py-3 px-2 placeholder:text-zinc-500"
                      spellCheck={false}
                      autoCapitalize="none"
                      autoComplete="off"
                    />
                  </>
                )}
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    (mode === "single"
                      ? username.trim() === ""
                      : userA.trim() === "" || userB.trim() === "")
                  }
                  aria-label={mode === "single" ? "Get streak" : "Compare streaks"}
                  className="flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-black py-3 px-5 rounded-xl font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 mr-1 gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} aria-hidden />
                  ) : (
                    <>
                      <span className="hidden sm:inline">{mode === "single" ? "Get streak" : "Compare"}</span>
                      <Search size={20} className="sm:hidden" aria-hidden />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div role="status" aria-live="polite" className="sr-only">
              {statusMessage}
            </div>
            {error && (
              <p role="alert" className="mt-4 text-center lg:text-left text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            )}

            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Private contributions are counted only when the user shows them on
              their GitHub profile or the server&apos;s GitHub token can access
              them. Dates use UTC.
            </p>

            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              <span>Try:</span>
              {mode === "single"
                ? SINGLE_EXAMPLES.map((user) => (
                    <button key={user} type="button" onClick={() => void runSingle(user)} className={CHIP}>
                      {user}
                    </button>
                  ))
                : COMPARE_EXAMPLES.map(([a, b]) => (
                    <button key={`${a}-${b}`} type="button" onClick={() => void runCompare(a, b)} className={CHIP}>
                      {a} vs {b}
                    </button>
                  ))}
            </div>

            {/* Recent searches (local only) */}
            {mode === "single" && recent.length > 0 && (
              <section aria-labelledby="recent-heading" className="mt-6 text-sm">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <History size={14} className="text-zinc-500" aria-hidden />
                  <h2 id="recent-heading" className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Recent searches
                  </h2>
                  <button
                    type="button"
                    onClick={clearRecent}
                    className="ml-1 text-xs underline text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    Clear
                  </button>
                </div>
                <ul className="flex flex-wrap justify-center lg:justify-start gap-2">
                  {recent.map((name) => (
                    <li key={name}>
                      <button
                        type="button"
                        onClick={() => void runSingle(name)}
                        className={CHIP}
                        aria-label={`View ${name} again`}
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Saved only in this browser. Nothing is stored on our server.
                </p>
              </section>
            )}

            {/* Theme Selector */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2" role="group" aria-label="Card theme">
              <div className="flex items-center gap-1.5 mr-1 text-zinc-600 dark:text-zinc-400" aria-hidden>
                <Palette size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Theme</span>
              </div>
              {Object.keys(themes).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  aria-pressed={theme === t}
                  className={`text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${theme === t
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                    }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Stats Result or Empty State */}
        <div className="w-full lg:w-[55%] min-h-100 flex items-center justify-center lg:justify-end">
          {isLoading && !hasResults ? (
            <div className="flex flex-col items-center justify-center opacity-80" aria-hidden>
              <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                <Zap className="text-zinc-500 animate-pulse" size={28} />
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 font-medium">{statusMessage}</p>
            </div>
          ) : mode === "single" && stats ? (
            <ErrorBoundary>
              <div className="w-full flex flex-col gap-5">
                <StreakCard stats={stats} themeName={theme} />

                <div className="flex flex-wrap items-center gap-2">
                  <CopyButton
                    text={readmeMarkdown(stats.username, theme)}
                    label="Copy README Markdown"
                    className="bg-green-700 text-white hover:bg-green-800 dark:bg-green-500 dark:text-black dark:hover:bg-green-400"
                  />
                  <Link
                    href={`/${encodeURIComponent(stats.username)}${theme !== "default" ? `?theme=${theme}` : ""}`}
                    className={SECONDARY_BUTTON}
                  >
                    <UserRound size={14} aria-hidden />
                    Open profile page
                  </Link>
                  <button type="button" onClick={trackAnother} className={SECONDARY_BUTTON}>
                    <RotateCcw size={14} aria-hidden />
                    Track another profile
                  </button>
                </div>

                <ExtraStatsCard stats={stats} themeName={theme} />

                <ShareButtons
                  url={profileUrl(stats.username, theme)}
                  text={`${stats.username}'s GitHub streak: ${stats.currentStreak} days current, ${stats.longestStreak} days longest`}
                />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Want to check back daily? Bookmark the profile page. The README
                  card refreshes on its own (cached for up to an hour).
                </p>
              </div>
            </ErrorBoundary>
          ) : mode === "compare" && compareStats ? (
            <ErrorBoundary>
              <div className="w-full flex flex-col gap-5">
                <CompareStatsCard stats={compareStats} themeName={theme} />
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={compareAgain} className={SECONDARY_BUTTON}>
                    <RotateCcw size={14} aria-hidden />
                    Compare again
                  </button>
                </div>
                <ShareButtons
                  url={compareUrl(compareStats.userA.username, compareStats.userB.username, theme)}
                  text={`GitHub streak comparison: ${compareStats.userA.username} vs ${compareStats.userB.username}`}
                />
              </div>
            </ErrorBoundary>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-400 select-none">
              <div className="w-32 h-32 border-4 border-dashed border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center mb-6 bg-zinc-50 dark:bg-zinc-900/50">
                <Search size={40} className="text-zinc-400 dark:text-zinc-500" aria-hidden />
              </div>
              <p className="font-medium text-center">
                {mode === "single"
                  ? "Enter a username to see their streak."
                  : "Enter two usernames to compare their streaks."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* FAQ (mirrors the FAQPage structured data above) */}
      <section aria-labelledby="faq-heading" className="relative w-full max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <h2 id="faq-heading" className="text-2xl font-bold mb-4">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full py-6 flex items-center justify-center border-t border-zinc-200 dark:border-zinc-800/50 mt-auto bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
        <nav aria-label="Footer" className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 px-4">
          <a
            href="https://github.com/Bijay-Shre-stha/github-streak"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all font-medium text-sm"
          >
            <FolderGit2 size={18} aria-hidden />
            <span>Source on GitHub</span>
          </a>
          <a
            href="https://www.bijayshrestha0817.com.np/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all font-medium text-sm"
          >
            <Globe size={18} aria-hidden />
            <span>Created by Bijay Shrestha</span>
          </a>
          <Link href="/themes" className="flex items-center gap-2 px-3 py-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all font-medium text-sm">
            <Palette size={16} aria-hidden />
            <span>Themes</span>
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-2 px-3 py-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all font-medium text-sm">
            <Trophy size={16} aria-hidden />
            <span>Leaderboard</span>
          </Link>
          <Link href="/api-playground" className="flex items-center gap-2 px-3 py-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all font-medium text-sm">
            <Code size={16} aria-hidden />
            <span>API</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}
