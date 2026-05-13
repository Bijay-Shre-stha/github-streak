"use client";

import React from "react";
import Image from "next/image";
import type { ComparedStreakStats } from "@/lib/streakCompare";
import { themes } from "@/lib/themes";
import {
    Trophy,
    GitCompareArrows,
    Flame,
    Activity,
    Sparkles,
} from "lucide-react";

function formatNumber(value: number): string {
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function formatDiff(value: number): string {
    if (value === 0) return "0";
    return value > 0 ? `+${formatNumber(value)}` : formatNumber(value);
}

export function CompareStatsCard({
    stats,
    themeName = "default",
}: {
    stats: ComparedStreakStats;
    themeName?: string;
}) {
    const theme = themes[themeName] || themes.default;

    const styles = {
        "--theme-bg": theme.bg,
        "--theme-border": theme.border,
        "--theme-title": theme.title,
        "--theme-text": theme.text,
        "--theme-current": theme.current,
        "--theme-longest": theme.longest,
    } as React.CSSProperties;

    const rows = [
        {
            label: "Total Contributions",
            icon: Activity,
            a: stats.userA.totalContributions,
            b: stats.userB.totalContributions,
            diff: stats.diff.totalContributions,
            leader: stats.leaders.totalContributions,
        },
        {
            label: "Current Streak",
            icon: Flame,
            a: stats.userA.currentStreak,
            b: stats.userB.currentStreak,
            diff: stats.diff.currentStreak,
            leader: stats.leaders.currentStreak,
        },
        {
            label: "Longest Streak",
            icon: Trophy,
            a: stats.userA.longestStreak,
            b: stats.userB.longestStreak,
            diff: stats.diff.longestStreak,
            leader: stats.leaders.longestStreak,
        },
        {
            label: "Active Days",
            icon: Sparkles,
            a: stats.userA.activeDays,
            b: stats.userB.activeDays,
            diff: stats.diff.activeDays,
            leader: stats.leaders.activeDays,
        },
        {
            label: "Average / Day",
            icon: Activity,
            a: stats.userA.averagePerDay,
            b: stats.userB.averagePerDay,
            diff: stats.diff.averagePerDay,
            leader: stats.leaders.averagePerDay,
        },
    ];

    const avatarUrl = (username: string) =>
        `https://github.com/${encodeURIComponent(username)}.png?size=96`;

    return (
        <div
            className="w-full max-w-5xl mx-auto rounded-[30px] p-px shadow-2xl"
            style={{
                background: `linear-gradient(
                    135deg,
                    var(--theme-current),
                    var(--theme-longest)
                )`,
                ...styles,
            }}
        >
            <div
                className="rounded-[29px] overflow-hidden relative"
                style={{
                    background:
                        "linear-gradient(180deg, var(--theme-bg), color-mix(in srgb, var(--theme-bg) 92%, black))",
                }}
            >
                {/* background glow */}
                <div
                    className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-10"
                    style={{ background: "var(--theme-current)" }}
                />

                <div
                    className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-10"
                    style={{ background: "var(--theme-longest)" }}
                />

                <div className="relative z-10 p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="p-2 rounded-xl"
                                    style={{
                                        background:
                                            "color-mix(in srgb, var(--theme-current) 16%, transparent)",
                                    }}
                                >
                                    <GitCompareArrows
                                        size={16}
                                        style={{
                                            color: "var(--theme-current)",
                                        }}
                                    />
                                </div>

                                <p
                                    className="text-xs uppercase tracking-[0.2em] font-semibold"
                                    style={{ color: "var(--theme-text)" }}
                                >
                                    Head To Head
                                </p>
                            </div>

                            <h2
                                className="text-2xl sm:text-3xl font-black"
                                style={{ color: "var(--theme-title)" }}
                            >
                                GitHub Streak Comparison
                            </h2>
                        </div>

                        <div
                            className="flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm"
                            style={{
                                borderColor: "var(--theme-border)",
                                background:
                                    "color-mix(in srgb, var(--theme-text) 6%, transparent)",
                            }}
                        >
                            <Sparkles
                                size={14}
                                style={{ color: "var(--theme-current)" }}
                            />

                            <span
                                className="text-xs font-semibold"
                                style={{ color: "var(--theme-text)" }}
                            >
                                Live Stats
                            </span>
                        </div>
                    </div>

                    {/* User Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {/* User A */}
                        <div
                            className="rounded-2xl border p-5"
                            style={{
                                borderColor: "var(--theme-border)",
                                background:
                                    "linear-gradient(135deg, color-mix(in srgb, var(--theme-current) 14%, transparent), transparent)",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>

                                    <h3
                                        className="text-lg font-black  text-wrap"
                                        style={{
                                            color: "var(--theme-title)",
                                        }}
                                    >
                                        @{stats.userA.username}
                                    </h3>
                                </div>

                                <div
                                    className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-white/10"
                                    style={{
                                        background:
                                            "color-mix(in srgb, var(--theme-current) 12%, transparent)",
                                    }}
                                >
                                    <Image
                                        src={avatarUrl(stats.userA.username)}
                                        alt={`${stats.userA.username} avatar`}
                                        width={48}
                                        height={48}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* User B */}
                        <div
                            className="rounded-xl border p-5"
                            style={{
                                borderColor: "var(--theme-border)",
                                background:
                                    "linear-gradient(135deg, color-mix(in srgb, var(--theme-longest) 14%, transparent), transparent)",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>


                                    <h3
                                        className="text-lg font-black  text-wrap"
                                        style={{
                                            color: "var(--theme-title)",
                                        }}
                                    >
                                        @{stats.userB.username}
                                    </h3>
                                </div>

                                <div
                                    className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-white/10"
                                    style={{
                                        background:
                                            "color-mix(in srgb, var(--theme-longest) 12%, transparent)",
                                    }}
                                >
                                    <Image
                                        src={avatarUrl(stats.userB.username)}
                                        alt={`${stats.userB.username} avatar`}
                                        width={48}
                                        height={48}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div
                        className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-2 mt-8 px-4"
                        style={{ color: "var(--theme-text)" }}
                    >
                        <p className="text-[11px] uppercase tracking-widest font-bold">
                            Metric
                        </p>

                        <p className="text-[11px]  tracking-widest font-bold text-center">
                            @{stats.userA.username}
                        </p>

                        <p className="text-[11px]  tracking-widest font-bold text-center">
                            @{stats.userB.username}
                        </p>

                        <p className="text-[11px] uppercase tracking-widest font-bold text-center">
                            Diff
                        </p>

                        <p className="text-[11px] uppercase tracking-widest font-bold text-center">
                            Leader
                        </p>
                    </div>

                    {/* Stats Rows */}
                    <div className="flex flex-col gap-3 mt-4">
                        {rows.map((row) => {
                            const Icon = row.icon;

                            const winnerLabel =
                                row.leader === "tie"
                                    ? "Tie"
                                    : row.leader === "userA"
                                        ? stats.userA.username
                                        : stats.userB.username;

                            const winnerStyles =
                                row.leader === "tie"
                                    ? {
                                        color: "var(--theme-text)",
                                        background:
                                            "color-mix(in srgb, var(--theme-text) 10%, transparent)",
                                    }
                                    : row.leader === "userA"
                                        ? {
                                            color: "var(--theme-current)",
                                            background:
                                                "color-mix(in srgb, var(--theme-current) 16%, transparent)",
                                        }
                                        : {
                                            color: "var(--theme-longest)",
                                            background:
                                                "color-mix(in srgb, var(--theme-longest) 16%, transparent)",
                                        };

                            return (
                                <div
                                    key={row.label}
                                    className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 items-center rounded-2xl border px-4 py-4 transition-all duration-200 hover:scale-[1.01]"
                                    style={{
                                        borderColor: "var(--theme-border)",
                                        background:
                                            "color-mix(in srgb, var(--theme-text) 4%, transparent)",
                                    }}
                                >
                                    {/* Metric */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{
                                                background:
                                                    "color-mix(in srgb, var(--theme-text) 8%, transparent)",
                                            }}
                                        >
                                            <Icon
                                                size={18}
                                                style={{
                                                    color: "var(--theme-current)",
                                                }}
                                            />
                                        </div>

                                        <p
                                            className="text-sm font-bold"
                                            style={{
                                                color: "var(--theme-title)",
                                            }}
                                        >
                                            {row.label}
                                        </p>
                                    </div>

                                    {/* User A */}
                                    <div
                                        className="text-center text-lg font-black"
                                        style={{
                                            color: "var(--theme-title)",
                                        }}
                                    >
                                        {formatNumber(row.a)}
                                    </div>

                                    {/* User B */}
                                    <div
                                        className="text-center text-lg font-black"
                                        style={{
                                            color: "var(--theme-title)",
                                        }}
                                    >
                                        {formatNumber(row.b)}
                                    </div>

                                    {/* Diff */}
                                    <div
                                        className="text-center text-sm font-bold"
                                        style={{
                                            color:
                                                row.diff === 0
                                                    ? "var(--theme-text)"
                                                    : row.diff > 0
                                                        ? "var(--theme-current)"
                                                        : "var(--theme-longest)",
                                        }}
                                    >
                                        {formatDiff(row.diff)}
                                    </div>

                                    {/* Leader */}
                                    <div className="flex justify-center">
                                        <span
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                                            style={winnerStyles}
                                        >
                                            {row.leader !== "tie" && (
                                                <Trophy size={12} />
                                            )}

                                            {winnerLabel}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}