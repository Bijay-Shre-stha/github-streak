"use client";

import { ExtendedStreakStats } from "@/lib/github";
import { themes } from "@/lib/themes";
import { BarChart3 } from "lucide-react";

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export function ExtraStatsCard({
    stats,
    themeName = "default",
}: {
    stats: ExtendedStreakStats;
    themeName?: string;
}) {
    const theme = themes[themeName] || themes.default;

    const bestDayLabel = stats.bestDay
        ? `${stats.bestDay.contributionCount} on ${formatDate(stats.bestDay.date)}`
        : "No contributions yet";

    const styles = {
        "--theme-bg": theme.bg,
        "--theme-border": theme.border,
        "--theme-title": theme.title,
        "--theme-text": theme.text,
    } as React.CSSProperties;

    return (
        <div
            className="w-full max-w-2xl mx-auto rounded-3xl p-px shadow-xl transition-all duration-500 hover:shadow-2xl"
            style={styles}
        >
            <div
                className="rounded-[23px] overflow-hidden h-full w-full relative"
                style={{ backgroundColor: "var(--theme-bg)" }}
            >
                <div className="p-6 sm:p-8 flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute top-4 left-6 flex items-center gap-2 opacity-60">
                        <BarChart3 size={14} style={{ color: "var(--theme-text)" }} />
                        <h3
                            className="text-xs font-semibold tracking-wide"
                            style={{ color: "var(--theme-text)" }}
                        >
                            @{stats.username} extra stats
                        </h3>
                    </div>

                    <div
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4"
                        style={{ color: "var(--theme-text)" }}
                    >
                        <div
                            className="rounded-xl px-4 py-3 border"
                            style={{
                                borderColor: "var(--theme-border)",
                                backgroundColor:
                                    "color-mix(in srgb, var(--theme-text) 6%, transparent)",
                            }}
                        >
                            <p className="text-[11px] uppercase tracking-wider font-semibold opacity-80">
                                Active Days
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{ color: "var(--theme-title)" }}
                            >
                                {stats.activeDays.toLocaleString()}
                            </p>
                        </div>
                        <div
                            className="rounded-xl px-4 py-3 border"
                            style={{
                                borderColor: "var(--theme-border)",
                                backgroundColor:
                                    "color-mix(in srgb, var(--theme-text) 6%, transparent)",
                            }}
                        >
                            <p className="text-[11px] uppercase tracking-wider font-semibold opacity-80">
                                Average / Day
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{ color: "var(--theme-title)" }}
                            >
                                {stats.averagePerDay.toLocaleString(undefined, {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                        </div>
                        <div
                            className="rounded-xl px-4 py-3 border"
                            style={{
                                borderColor: "var(--theme-border)",
                                backgroundColor:
                                    "color-mix(in srgb, var(--theme-text) 6%, transparent)",
                            }}
                        >
                            <p className="text-[11px] uppercase tracking-wider font-semibold opacity-80">
                                Best Day
                            </p>
                            <p
                                className="text-sm font-semibold mt-2 leading-snug"
                                style={{ color: "var(--theme-title)" }}
                            >
                                {bestDayLabel}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
