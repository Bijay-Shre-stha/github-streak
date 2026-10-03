"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  MapPin,
  Palette,
  RotateCw,
  Users,
  FolderGit2,
} from "lucide-react";
import { StreakCard } from "../components/StreakCard";
import { ExtraStatsCard } from "../components/ExtraStatsCard";
import { ShareButtons } from "../components/ShareButtons";
import { CopyButton } from "../components/CopyButton";
import type { ExtendedStreakStats, GitHubUserProfile } from "@/lib/github";
import { themes } from "@/lib/themes";
import { ApiRequestError, getJson, isAbortError } from "@/lib/apiClient";
import { loadRecent, mergeRecent, saveRecent } from "@/lib/recentSearches";
import { profileUrl, readmeMarkdown } from "@/lib/share";

interface ProfileViewProps {
  username: string;
  initialTheme: string;
}

interface LoadState {
  stats: ExtendedStreakStats | null;
  profile: GitHubUserProfile | null;
  error: { status: number; message: string } | null;
  isLoading: boolean;
}

const BUTTON =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800";

export function ProfileView({ username, initialTheme }: ProfileViewProps): ReactElement {
  const [theme, setTheme] = useState(initialTheme);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>({
    stats: null,
    profile: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    // Abort on unmount / username change so a slow response can't
    // overwrite a newer one.
    const controller = new AbortController();
    const encoded = encodeURIComponent(username);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((s) => ({ ...s, isLoading: true, error: null }));

    const load = async (): Promise<void> => {
      // Profile details are optional decoration; a failure there must not hide the stats.
      const profilePromise = getJson<GitHubUserProfile>(
        `/api/profile?username=${encoded}`,
        controller.signal,
      ).catch(() => null);

      try {
        const stats = await getJson<ExtendedStreakStats>(
          `/api/streak?username=${encoded}&variant=extended`,
          controller.signal,
        );
        const profile = await profilePromise;
        setState({ stats, profile, error: null, isLoading: false });
        saveRecent(mergeRecent(loadRecent(), stats.username));
      } catch (err) {
        if (isAbortError(err)) return;
        setState({
          stats: null,
          profile: null,
          isLoading: false,
          error: {
            status: err instanceof ApiRequestError ? err.status : 500,
            message: err instanceof Error ? err.message : "Something went wrong",
          },
        });
      }
    };

    void load();
    return () => controller.abort();
  }, [username, attempt]);

  const changeTheme = (next: string): void => {
    setTheme(next);
    const url = new URL(window.location.href);
    if (next === "default") url.searchParams.delete("theme");
    else url.searchParams.set("theme", next);
    window.history.replaceState({}, "", url);
  };

  const { stats, profile, error, isLoading } = state;
  const displayName = profile?.login ?? stats?.username ?? username;

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

        <div role="status" aria-live="polite" className="sr-only">
          {isLoading ? `Loading ${username}'s streak…` : stats ? `Loaded ${displayName}'s streak.` : ""}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24" aria-hidden>
            <Loader2 className="animate-spin" size={40} />
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading @{username}…</p>
          </div>
        ) : error || !stats ? (
          <div className="text-center max-w-md py-16" role="alert">
            <h1 className="text-2xl font-bold mb-4">
              {error?.status === 404
                ? "User not found"
                : error?.status === 429
                  ? "Too many requests"
                  : "Couldn't load this profile"}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {error?.message ?? "Could not load profile data"}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {error?.status !== 404 && (
                <button type="button" onClick={() => setAttempt((n) => n + 1)} className={BUTTON}>
                  <RotateCw size={14} aria-hidden />
                  Try again
                </button>
              )}
              <Link href="/" className={BUTTON}>
                Search another username
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Image
                  src={profile?.avatarUrl ?? `https://github.com/${encodeURIComponent(stats.username)}.png?size=128`}
                  alt={`${displayName}'s avatar`}
                  width={128}
                  height={128}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-lg"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold">
                        {profile?.name || `@${displayName}`}
                      </h1>
                      {profile?.name && (
                        <p className="text-zinc-600 dark:text-zinc-400">@{displayName}</p>
                      )}
                    </div>
                    <a
                      href={profile?.htmlUrl ?? `https://github.com/${encodeURIComponent(stats.username)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={BUTTON}
                    >
                      View on GitHub <ExternalLink size={14} aria-hidden />
                    </a>
                  </div>
                  {profile?.bio && (
                    <p className="text-zinc-700 dark:text-zinc-300 mt-3 max-w-2xl wrap-break-word">{profile.bio}</p>
                  )}
                  {profile && (
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                      <li className="inline-flex items-center gap-1">
                        <Users size={14} aria-hidden />
                        {profile.followers.toLocaleString()} followers
                      </li>
                      <li className="inline-flex items-center gap-1">
                        <FolderGit2 size={14} aria-hidden />
                        {profile.publicRepos.toLocaleString()} public repos
                      </li>
                      {profile.location && (
                        <li className="inline-flex items-center gap-1">
                          <MapPin size={14} aria-hidden />
                          {profile.location}
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Theme picker */}
            <div className="w-full flex flex-wrap items-center gap-2 mb-4" role="group" aria-label="Card theme">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                <Palette size={14} aria-hidden /> Theme
              </span>
              {Object.keys(themes).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => changeTheme(t)}
                  aria-pressed={theme === t}
                  className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-full border transition-colors ${theme === t
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent"
                    : "bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="w-full space-y-6">
              <StreakCard stats={stats} themeName={theme} />
              <div className="flex flex-wrap gap-2">
                <CopyButton
                  text={readmeMarkdown(stats.username, theme)}
                  label="Copy README Markdown"
                  className="bg-green-700 text-white hover:bg-green-800 dark:bg-green-500 dark:text-black dark:hover:bg-green-400"
                />
                <Link
                  href={`/?mode=compare&userA=${encodeURIComponent(stats.username)}`}
                  className={BUTTON}
                >
                  Compare with someone
                </Link>
              </div>
              <ExtraStatsCard stats={stats} themeName={theme} />
              <ShareButtons
                url={profileUrl(stats.username, theme)}
                text={`${stats.username}'s GitHub streak: ${stats.currentStreak} days current, ${stats.longestStreak} days longest`}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
