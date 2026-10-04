"use client";

import type { ReactElement } from "react";
import type { StreakStats } from "@/lib/github";
import { themes } from "@/lib/themes";
import { formatUtcDate as formatDate } from "@/lib/dates";
import { readmeMarkdown } from "@/lib/share";
import { resolveTheme } from "@/lib/validation";
import { Flame, Activity } from "lucide-react";
import { CopyButton } from "./CopyButton";

interface StreakCardProps {
  stats: StreakStats;
  themeName?: string;
  /** Show the README embed snippet + copy button (off for sample previews). */
  showEmbed?: boolean;
}

export function StreakCard({
  stats,
  themeName = "default",
  showEmbed = true,
}: StreakCardProps): ReactElement {
  const theme = themes[themeName] || themes.default;
  const embedCode = readmeMarkdown(stats.username, resolveTheme(themeName));

  // We assign css variables so we can use color-mix for opacities natively via inline styles
  const styles = {
    "--theme-bg": theme.bg,
    "--theme-border": theme.border,
    "--theme-title": theme.title,
    "--theme-text": theme.text,
    "--theme-current": theme.current,
    "--theme-longest": theme.longest,
    "--theme-total": theme.total || theme.title,
  } as React.CSSProperties;

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-3xl p-px shadow-xl transition-all duration-500 hover:shadow-2xl"
      style={{ ...styles }}
    >
      <div
        className="rounded-[23px] overflow-hidden h-full w-full relative"
        style={{ backgroundColor: "var(--theme-bg)" }}
      >
        <div className="p-8 sm:p-10 flex flex-col gap-8 relative overflow-hidden">

          <div className="absolute top-4 left-6 flex items-center gap-2 opacity-80">
            <Activity size={14} style={{ color: "var(--theme-text)" }} />
            <h3 className="text-xs font-semibold tracking-wide" style={{ color: "var(--theme-text)" }}>
              @{stats.username}
            </h3>
          </div>

          {/* Stats Flex Layout */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full relative z-10 pt-4">

            {/* Total Contributions */}
            <div className="flex-1 w-full flex flex-col items-center justify-center p-2">
              <span
                className="text-4xl font-bold tracking-tight mb-2 transition-transform duration-300 transform hover:scale-110"
                style={{ color: "var(--theme-total)" }}
              >
                {stats.totalContributions.toLocaleString()}
              </span>
              <span className="text-[13px] font-medium mb-2 tracking-wide" style={{ color: "var(--theme-total)" }}>
                Total Contributions
              </span>
              {(stats.totalContributionsStart || stats.joinedYear) && (
                <span className="text-[11px] font-medium tracking-wide" style={{ color: "var(--theme-text)" }}>
                  {stats.totalContributionsStart ? formatDate(stats.totalContributionsStart) : stats.joinedYear} - Present
                </span>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block w-[1.5px] h-24 opacity-60" style={{ backgroundColor: "var(--theme-border)" }} />

            {/* Current Streak */}
            <div className="flex-1 w-full flex flex-col items-center justify-center p-2 relative">
              <div className="relative flex items-center justify-center w-[110px] h-[110px] mb-2 transform hover:scale-105 transition-transform duration-300">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <path
                    d="M 27.5,14 A 43,43 0 1,0 72.5,14"
                    fill="none"
                    stroke="var(--theme-current)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute top-0 -mt-2.5 bg-[var(--theme-bg)] px-2 rounded-full flex items-center justify-center">
                  <Flame color="var(--theme-current)" size={26} className="drop-shadow-sm" />
                </div>
                <span
                  className="text-3xl font-bold tracking-tight mt-1"
                  style={{ color: "var(--theme-longest)" }} // Image uses this specific yellow/accent scheme
                >
                  {stats.currentStreak}
                </span>
              </div>
              <span className="text-[13px] font-bold mb-2 tracking-wide text-center" style={{ color: "var(--theme-longest)" }}>
                Current Streak
              </span>
              {stats.currentStreakStart && stats.currentStreakEnd && (
                <span className="text-[11px] font-medium tracking-wide text-center" style={{ color: "var(--theme-text)" }}>
                  {formatDate(stats.currentStreakStart)} - {formatDate(stats.currentStreakEnd)}
                </span>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block w-[1.5px] h-24 opacity-60" style={{ backgroundColor: "var(--theme-border)" }} />

            {/* Longest Streak */}
            <div className="flex-1 w-full flex flex-col items-center justify-center p-2">
              <div className="flex items-center gap-2 mb-2 transition-transform duration-300 transform hover:scale-110">
                <span
                  className="text-4xl font-bold tracking-tight"
                  style={{ color: "var(--theme-title)" }}
                >
                  {stats.longestStreak}
                </span>
              </div>
              <span className="text-[13px] font-medium mb-2 tracking-wide" style={{ color: "var(--theme-title)" }}>
                Longest Streak
              </span>
              {stats.longestStreakStart && stats.longestStreakEnd && (
                <span className="text-[11px] font-medium tracking-wide" style={{ color: "var(--theme-text)" }}>
                  {formatDate(stats.longestStreakStart)} - {formatDate(stats.longestStreakEnd)}
                </span>
              )}
            </div>

          </div>

          {/* Footer markdown link utility */}
          {showEmbed && (
            <div
              className="flex flex-col items-start w-full gap-2 mt-4 pt-6 border-t"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <div className="flex w-full flex-wrap items-center justify-between gap-2 px-1">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--theme-text)" }}>
                  Embed in your README
                </span>
                <CopyButton
                  text={embedCode}
                  label="Copy README Markdown"
                  className="hover:bg-zinc-500/10 border"
                  style={{ color: "var(--theme-title)", borderColor: "var(--theme-border)" }}
                />
              </div>
              <code
                className="block w-full overflow-x-auto whitespace-pre border rounded-lg px-4 py-3 text-xs font-mono"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--theme-text) 5%, transparent)",
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-text)",
                }}
              >
                {embedCode}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
