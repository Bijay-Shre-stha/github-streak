"use client";

import { useEffect, useRef, useState, type SubmitEvent, type ReactElement } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Share2, Trophy, Users } from "lucide-react";
import type { StreakStats } from "@/lib/github";
import { ApiRequestError, getJson, isAbortError, rateLimitMessage } from "@/lib/apiClient";
import { MAX_LEADERBOARD_USERS, parseUsernameList } from "@/lib/validation";
import { leaderboardUrl } from "@/lib/share";
import { CopyButton } from "../components/CopyButton";
import { ShareButtons } from "../components/ShareButtons";

type Metric = "currentStreak" | "longestStreak" | "totalContributions";

const METRICS: { key: Metric; label: string }[] = [
  { key: "currentStreak", label: "Current streak" },
  { key: "longestStreak", label: "Longest streak" },
  { key: "totalContributions", label: "Total contributions" },
];

interface Row {
  username: string;
  stats?: StreakStats;
  error?: string;
}

const BUTTON =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800";

export default function LeaderboardPage(): ReactElement {
  const [input, setInput] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [metric, setMetric] = useState<Metric>("currentStreak");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [rateLimited, setRateLimited] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const load = async (names: string[]): Promise<void> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setUsernames(names);
    setIsLoading(true);
    setRateLimited("");
    setRows([]);
    window.history.replaceState({}, "", `/leaderboard?users=${names.map(encodeURIComponent).join(",")}`);

    const results = await Promise.allSettled(
      names.map((name) =>
        getJson<StreakStats>(
          `/api/streak?username=${encodeURIComponent(name)}`,
          controller.signal,
        ),
      ),
    );
    if (controller.signal.aborted) return;

    let retryAfter: number | undefined;
    let limited = false;
    setRows(
      results.map((result, i): Row => {
        if (result.status === "fulfilled") return { username: result.value.username, stats: result.value };
        const err = result.reason;
        if (isAbortError(err)) return { username: names[i], error: "Cancelled" };
        if (err instanceof ApiRequestError && err.status === 429) {
          limited = true;
          retryAfter = Math.max(retryAfter ?? 0, err.retryAfter ?? 0) || undefined;
          return { username: names[i], error: "Rate limited" };
        }
        return {
          username: names[i],
          error: err instanceof ApiRequestError && err.status === 404 ? "User not found" : "Couldn't load",
        };
      }),
    );
    if (limited) setRateLimited(rateLimitMessage(retryAfter));
    setIsLoading(false);
  };

  const submit = (raw: string): void => {
    const parsed = parseUsernameList(raw);
    const problems: string[] = [];
    if (parsed.invalid.length) {
      problems.push(`Not valid GitHub usernames: ${parsed.invalid.join(", ")}.`);
    }
    if (parsed.tooMany) {
      problems.push(`Only the first ${MAX_LEADERBOARD_USERS} usernames are used.`);
    }
    if (parsed.usernames.length < 2) {
      problems.push("Add at least two different usernames.");
      setFormError(problems.join(" "));
      return;
    }
    setFormError(problems.join(" "));
    void load(parsed.usernames);
  };

  // Load a shared leaderboard from ?users=a,b,c after mount.
  useEffect(() => {
    const users = new URLSearchParams(window.location.search).get("users") ?? "";
    if (users) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInput(users.split(",").join(", "));
      submit(users);
    }
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>): void => {
    e.preventDefault();
    submit(input);
  };

  const ranked = rows
    .filter((r): r is Row & { stats: StreakStats } => Boolean(r.stats))
    .sort((a, b) => b.stats[metric] - a.stats[metric]);
  const failed = rows.filter((r) => !r.stats);
  // Standard competition ranking: ties share a rank (1, 1, 3).
  const rankOf = (i: number): number => {
    while (i > 0 && ranked[i - 1].stats[metric] === ranked[i].stats[metric]) i--;
    return i + 1;
  };
  const shareUrl = usernames.length ? leaderboardUrl(usernames) : "";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <main className="relative flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl mx-auto w-full">
        <nav aria-label="Breadcrumb" className="w-full mb-6">
          <Link href="/" className={BUTTON}>
            <ArrowLeft size={14} aria-hidden />
            Home
          </Link>
        </nav>

        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Create a streak leaderboard
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-700 dark:text-zinc-300">
            Rank your team, classmates or friends by GitHub streak. Add up to{" "}
            {MAX_LEADERBOARD_USERS} usernames and share the link. Nothing is
            stored: the list lives in the URL and stats are fetched live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl" noValidate>
          <label htmlFor="usernames" className="block font-semibold mb-2">
            GitHub usernames
          </label>
          <textarea
            id="usernames"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="torvalds, gaearon, sindresorhus"
            aria-describedby="usernames-help"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 font-mono text-sm placeholder:text-zinc-500"
            spellCheck={false}
            autoCapitalize="none"
          />
          <p id="usernames-help" className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Separate with commas, spaces or new lines. Duplicates are removed.
          </p>
          {formError && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
              {formError}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-sm disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Share2 size={14} aria-hidden />}
              Generate Leaderboard Link
            </button>
            {!input.trim() && (
              <button
                type="button"
                className={BUTTON}
                onClick={() => {
                  setInput("torvalds, gaearon, sindresorhus");
                  submit("torvalds, gaearon, sindresorhus");
                }}
              >
                Try an example
              </button>
            )}
          </div>
        </form>

        <div role="status" aria-live="polite" className="sr-only">
          {isLoading
            ? `Loading ${usernames.length} profiles…`
            : rows.length
              ? `Leaderboard ready with ${ranked.length} of ${rows.length} profiles.`
              : ""}
        </div>

        {rateLimited && (
          <p role="alert" className="mt-6 w-full max-w-2xl rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 px-4 py-3 text-amber-900 dark:text-amber-200">
            {rateLimited} Profiles marked “Rate limited” were skipped.
          </p>
        )}

        {shareUrl && !isLoading && (
          <section aria-labelledby="share-heading" className="mt-8 w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4">
            <h2 id="share-heading" className="font-semibold mb-2">Your leaderboard link</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="share-url" className="sr-only">Leaderboard link</label>
              <input
                id="share-url"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 font-mono text-xs"
              />
              <CopyButton text={shareUrl} label="Copy link" />
            </div>
            <div className="mt-3">
              <ShareButtons url={shareUrl} title="GitHub Streak Leaderboard" text="Who has the longest GitHub streak?" />
            </div>
          </section>
        )}

        {isLoading && (
          <div className="mt-10 flex items-center gap-3 text-zinc-600 dark:text-zinc-400" aria-hidden>
            <Loader2 className="animate-spin" size={20} />
            Loading {usernames.length} profiles…
          </div>
        )}

        {!isLoading && rows.length > 0 && (
          <section aria-labelledby="board-heading" className="mt-10 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 id="board-heading" className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="text-amber-500" size={22} aria-hidden />
                Leaderboard
              </h2>
              <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1" role="group" aria-label="Rank by">
                {METRICS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMetric(m.key)}
                    aria-pressed={metric === m.key}
                    className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${metric === m.key
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {ranked.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">None of these profiles could be loaded.</p>
            ) : (
              <>
              <div className="hidden sm:grid grid-cols-[2.5rem_1fr_repeat(3,8rem)] gap-x-3 px-4 pb-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400" aria-hidden>
                <span>Rank</span>
                <span>Developer</span>
                {METRICS.map((m) => (
                  <span key={m.key} className="text-right">{m.label}</span>
                ))}
              </div>
              <ol className="flex flex-col gap-2">
                {ranked.map((row, i) => (
                  <li
                    key={row.username}
                    className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[2.5rem_1fr_repeat(3,8rem)] items-center gap-x-3 gap-y-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3"
                  >
                    <span className="text-lg font-black text-zinc-700 dark:text-zinc-300" aria-label={`Rank ${rankOf(i)}`}>
                      #{rankOf(i)}
                    </span>
                    <Link href={`/${encodeURIComponent(row.username)}`} className="font-semibold underline-offset-2 hover:underline truncate">
                      @{row.username}
                    </Link>
                    {METRICS.map((m) => (
                      <span
                        key={m.key}
                        className={`col-start-2 sm:col-start-auto sm:text-right text-sm ${metric === m.key ? "font-bold" : "text-zinc-600 dark:text-zinc-400"}`}
                      >
                        <span className="sm:hidden">{m.label}: </span>
                        {row.stats[m.key].toLocaleString()}
                        {m.key !== "totalContributions" && " days"}
                      </span>
                    ))}
                  </li>
                ))}
              </ol>
              </>
            )}

            {failed.length > 0 && (
              <ul className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                {failed.map((r) => (
                  <li key={r.username}>
                    @{r.username}: {r.error}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {!isLoading && rows.length === 0 && !formError && (
          <div className="mt-12 flex flex-col items-center text-center text-zinc-600 dark:text-zinc-400">
            <Users size={36} className="mb-3" aria-hidden />
            <p>No leaderboard yet. Add a few usernames above to create one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
