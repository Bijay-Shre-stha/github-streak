"use client";

import { useState } from "react";
import Link from "next/link";
import { Code, AlertCircle, Copy, Play, RotateCw } from "lucide-react";

interface ApiResponse<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export default function ApiPlaygroundPage() {
  const [username, setUsername] = useState("torvalds");
  const [theme, setTheme] = useState("radical");
  const [userA, setUserA] = useState("torvalds");
  const [userB, setUserB] = useState("gaearon");
  const [responses, setResponses] = useState<{
    streak: ApiResponse;
    compare: ApiResponse;
    image: string;
  }>({
    streak: { data: null, loading: false, error: null },
    compare: { data: null, loading: false, error: null },
    image: "",
  });

  const testStreak = async () => {
    setResponses((prev) => ({
      ...prev,
      streak: { ...prev.streak, loading: true, error: null },
    }));

    try {
      const res = await fetch(`/api/streak?username=${username}&variant=extended`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch");
      }

      setResponses((prev) => ({
        ...prev,
        streak: { data, loading: false, error: null },
      }));
    } catch (err: unknown) {
      setResponses((prev) => ({
        ...prev,
        streak: { data: null, loading: false, error: err instanceof Error ? err.message : String(err) },
      }));
    }
  };

  const testCompare = async () => {
    setResponses((prev) => ({
      ...prev,
      compare: { ...prev.compare, loading: true, error: null },
    }));

    try {
      const res = await fetch(`/api/streak-compare?userA=${userA}&userB=${userB}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to compare");
      }

      setResponses((prev) => ({
        ...prev,
        compare: { data, loading: false, error: null },
      }));
    } catch (err: unknown) {
      setResponses((prev) => ({
        ...prev,
        compare: { data: null, loading: false, error: err instanceof Error ? err.message : String(err) },
      }));
    }
  };

  const getImageLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    return `${origin}/api/streak-image?username=${username}&theme=${theme}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <main className="relative flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-500 pb-2">
            API Playground
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
            Test our GitHub streak API endpoints directly in your browser.
          </p>
        </div>

        {/* Endpoint Cards */}
        <div className="w-full space-y-8">
          {/* Streak Endpoint */}
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code className="text-purple-500" size={20} />
              Single User Streak
            </h2>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter GitHub username"
                />
              </div>

              <button
                onClick={testStreak}
                disabled={responses.streak.loading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {responses.streak.loading ? (
                  <RotateCw className="animate-spin" size={18} />
                ) : (
                  <Play size={18} />
                )}
                Test Endpoint
              </button>

              {responses.streak.error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle size={16} />
                    <span className="text-sm">{responses.streak.error}</span>
                  </div>
                </div>
              )}

              {responses.streak.data !== null && (
                <div className="bg-zinc-200 dark:bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Response:</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(responses.streak.data, null, 2))}
                      className="p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre className="text-xs text-zinc-700 dark:text-zinc-300 overflow-x-auto max-h-48">
                    {JSON.stringify(responses.streak.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Compare Endpoint */}
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code className="text-purple-500" size={20} />
              Compare Two Users
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                  User A
                </label>
                <input
                  type="text"
                  value={userA}
                  onChange={(e) => setUserA(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="First GitHub username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                  User B
                </label>
                <input
                  type="text"
                  value={userB}
                  onChange={(e) => setUserB(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Second GitHub username"
                />
              </div>

              <button
                onClick={testCompare}
                disabled={responses.compare.loading}
                className="md:col-span-2 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {responses.compare.loading ? (
                  <RotateCw className="animate-spin" size={18} />
                ) : (
                  <Play size={18} />
                )}
                Compare Users
              </button>

              {responses.compare.error && (
                <div className="md:col-span-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle size={16} />
                    <span className="text-sm">{responses.compare.error}</span>
                  </div>
                </div>
              )}

              {responses.compare.data !== null && (
                <div className="md:col-span-2 bg-zinc-200 dark:bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Response:</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(responses.compare.data, null, 2))}
                      className="p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre className="text-xs text-zinc-700 dark:text-zinc-300 overflow-x-auto max-h-48">
                    {JSON.stringify(responses.compare.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Image Badge Generator */}
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code className="text-purple-500" size={20} />
              Image Badge Generator
            </h2>

            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="radical">Radical</option>
                    <option value="tokyonight">Tokyonight</option>
                    <option value="dracula">Dracula</option>
                    <option value="github">GitHub</option>
                    <option value="default">Default</option>
                    <option value="react">React</option>
                  </select>
                </div>
              </div>

              <div className="bg-zinc-200 dark:bg-zinc-800 rounded-xl p-4">
                <label className="block text-xs font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                  Generated URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getImageLink()}
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(getImageLink())}
                    className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <p className="font-semibold mb-1">Usage in README:</p>
                <code className="block bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg text-xs font-mono">
                  {`[![GitHub Streak](${getImageLink()})](https://your-site.com)`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 w-full max-w-3xl">
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/themes"
              className="block p-6 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:scale-105 transition-transform"
            >
              <h3 className="font-bold mb-2">Theme Gallery</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Browse all available themes with live previews.
              </p>
            </Link>

            <Link
              href="/leaderboard"
              className="block p-6 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:scale-105 transition-transform"
            >
              <h3 className="font-bold mb-2">Leaderboard</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                View top contributors.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}