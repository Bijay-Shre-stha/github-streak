"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StreakCard } from "../../app/components/StreakCard";
import { ExtraStatsCard } from "../../app/components/ExtraStatsCard";
import { ShareButtons } from "../../app/components/ShareButtons";
import type { ExtendedStreakStats, GitHubUserProfile } from "../../lib/github";
import { Loader2, ExternalLink, Stars } from "lucide-react";
import nextImage from "next/image";

const Image = nextImage;

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const username = params?.username || "";

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ExtendedStreakStats | null>(null);
  const [profile, setProfile] = useState<GitHubUserProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) {
      router.replace("/");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [statsRes, profileRes] = await Promise.all([
          fetch(`/api/streak?username=${username}&variant=extended`),
          fetch(`/api/profile?username=${username}`),
        ]);

        const statsData = await statsRes.json();
        if (!statsRes.ok) {
          throw new Error(statsData.error || "Failed to fetch stats");
        }
        setStats(statsData);

        const profileData = await profileRes.json();
        if (profileRes.ok) {
          setProfile(profileData);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
        <p className="mt-4 text-zinc-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-zinc-500 mb-6">{error || "Could not load profile data"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold hover:scale-105 transition-transform"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <main className="relative flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto w-full">
        {/* Profile Header */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Image
                src={`https://github.com/${stats.username}.png?size=96`}
                alt={stats.username}
                width={96}
                height={96}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-zinc-900 shadow-lg"
                unoptimized
              />
              <div className="absolute -bottom-2 -right-2 bg-zinc-900 dark:bg-white rounded-full p-1">
                <Stars size={16} className="text-yellow-400" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  @{stats.username}
                </h1>
                <a
                  href={`https://github.com/${stats.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  GitHub <ExternalLink size={14} />
                </a>
              </div>

              {profile?.bio && (
                <p className="text-zinc-700 dark:text-zinc-300 mt-2 max-w-2xl break-words">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Streak Stats */}
        <div className="w-full space-y-6">
          <StreakCard stats={stats} themeName="radical" />
          <ExtraStatsCard stats={stats} themeName="radical" />

          <div className="flex justify-between items-center">
            <ShareButtons
              themeName="radical"
              username={stats.username}
              text={`My GitHub streak: ${stats.currentStreak} days`}
            />
            <Link href="/" className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              ← Back to Search
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}