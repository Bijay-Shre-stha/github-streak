import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { resolveTheme, validateGitHubUsername } from "@/lib/validation";
import { SITE_URL, profileUrl } from "@/lib/share";
import { pageMetadata } from "@/lib/seo";
import { todayUtc } from "@/lib/dates";
import { fetchGitHubStreakExtended, type ExtendedStreakStats } from "@/lib/github";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { ProfileView } from "./ProfileView";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
}

/**
 * Stats for the server-rendered HTML, so crawlers that skip JavaScript see them.
 * Null (rate limited, unknown user, GitHub failure) leaves it to the client,
 * which fetches and shows the matching error.
 */
async function getInitialStats(username: string): Promise<ExtendedStreakStats | null> {
  if (checkRateLimit(getClientIP({ headers: await headers() })).isLimited) return null;
  try {
    // The UTC date is in the cache key, so a new day never serves old stats.
    return await unstable_cache(
      () => fetchGitHubStreakExtended(username),
      ["profile-stats", username, todayUtc()],
      { revalidate: 3600 },
    )();
  } catch (error) {
    console.error("Profile render error:", error);
    return null;
  }
}

async function getUsername(params: ProfilePageProps["params"]): Promise<string> {
  const { username } = await params;
  const decoded = decodeURIComponent(username).trim();
  if (!validateGitHubUsername(decoded).valid) notFound();
  return decoded;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const username = await getUsername(params);
  const title = `${username}'s GitHub Streak`;
  const description = `Current streak, longest streak and total GitHub contributions for @${username}, with a README streak card you can embed.`;

  return pageMetadata(`/${encodeURIComponent(username)}`, title, description);
}

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps): Promise<ReactElement> {
  const username = await getUsername(params);
  const { theme } = await searchParams;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: username, item: profileUrl(username) },
            ],
          }),
        }}
      />
      <ProfileView
        key={username}
        username={username}
        initialStats={await getInitialStats(username)}
        initialTheme={resolveTheme(Array.isArray(theme) ? theme[0] : theme)}
      />
    </>
  );
}
