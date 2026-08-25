"use client";

import { useState } from "react";
import { Palette, Copy, Check, Send } from "lucide-react";
import { StreakCard } from "../components/StreakCard";
import { themes } from "../../lib/themes";
import type { ExtendedStreakStats } from "../../lib/github";

// Mock sample data for theme previews
const sampleStats: ExtendedStreakStats = {
  username: "demo_user",
  totalContributions: 2450,
  currentStreak: 12,
  longestStreak: 45,
  activeDays: 365,
  averagePerDay: 6.72,
  bestDay: {
    date: "2024-01-15",
    contributionCount: 35
  },
  joinedYear: 2020,
  totalContributionsStart: "2020-03-10",
  currentStreakStart: "2024-08-10",
  currentStreakEnd: "2024-08-21",
  longestStreakStart: "2024-01-01",
  longestStreakEnd: "2024-02-14"
};

export default function ThemeGalleryPage() {
  const [copied, setCopied] = useState(false);
  const [copiedTheme, setCopiedTheme] = useState("");

  const handleCopyTheme = (themeName: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const embedCode = `[![GitHub Streak](${origin}/api/streak-image?username=YOUR_USERNAME&theme=${themeName})](${origin}/themes)`;

    navigator.clipboard.writeText(embedCode);
    setCopiedTheme(themeName);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setCopiedTheme("");
    }, 2000);
  };

  const shareOnSocial = (platform: string, themeName: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = `${origin}/api/streak-image?username=YOUR_USERNAME&theme=${themeName}`;
    const text = "Check out this beautiful GitHub streak card theme!";

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent("GitHub Streak Theme")}&body=${encodeURIComponent(`Check out this GitHub streak theme: ${url}`)}`;
        break;
      case "default":
        if (navigator.share) {
          navigator.share({
            title: "GitHub Streak Theme",
            text: text,
            url: url,
          });
        }
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const themeEntries = Object.entries(themes);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <main className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 sm:px-6 lg:px-8 py-20 pb-32 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-500 pb-2">
            Theme Gallery
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400 font-medium">
            Choose from our curated collection of beautiful themes. Each theme is designed to match your style and GitHub profile.
          </p>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {themeEntries.map(([themeName]) => {
            const displayName = themeName.charAt(0).toUpperCase() + themeName.slice(1);

            return (
              <div
                key={themeName}
                className="group flex flex-col items-center bg-white dark:bg-zinc-950 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-zinc-200 dark:border-zinc-800"
              >
                {/* Theme Preview Streak Card */}
                <div className="w-full mb-6">
                  <StreakCard stats={sampleStats} themeName={themeName} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <button
                    onClick={() => handleCopyTheme(themeName)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {copied && copiedTheme === themeName ? (
                      <>
                        <Check size={14} className="text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => shareOnSocial("twitter", themeName)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/30"
                  >
                    <Send size={14} />
                    Share
                  </button>
                </div>

                {/* Theme Info */}
                <div className="w-full text-center">
                  <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
                    {displayName}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    A stunning theme for your GitHub streak badge
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to Use Section */}
        <div className="mt-16 w-full max-w-3xl">
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Palette className="text-purple-500" size={20} />
              How to Use These Themes
            </h3>
            <div className="grid gap-4">
              <div>
                <p className="font-semibold mb-1">For Embedding in README:</p>
                <code className="block w-full p-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-sm font-mono overflow-x-auto">
                  {`![GitHub Streak](https://your-domain.com/api/streak-image?username=YOUR_USERNAME&theme=radical)`}
                </code>
              </div>
              <div>
                <p className="font-semibold mb-1">For Custom Theme URL:</p>
                <code className="block w-full p-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-sm font-mono overflow-x-auto">
                  {`https://your-domain.com/themes?theme=radical&username=YOUR_USERNAME`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
