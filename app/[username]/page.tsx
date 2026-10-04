import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { resolveTheme, validateGitHubUsername } from "@/lib/validation";
import { SITE_URL, profileUrl } from "@/lib/share";
import { ProfileView } from "./ProfileView";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ theme?: string | string[] }>;
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

  return {
    title,
    description,
    alternates: { canonical: `/${encodeURIComponent(username)}` },
    openGraph: { title, description, url: profileUrl(username) },
    twitter: { card: "summary", title, description },
  };
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
        username={username}
        initialTheme={resolveTheme(Array.isArray(theme) ? theme[0] : theme)}
      />
    </>
  );
}
