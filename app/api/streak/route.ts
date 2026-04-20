import { NextResponse } from "next/server";
import { fetchGitHubStreak, fetchGitHubStreakExtended } from "@/lib/github";

export const revalidate = 3600; // Cache for 1 hour
const GITHUB_USERNAME_REGEX = /^(?!-)(?!.*--)[A-Za-z0-9-]{1,39}(?<!-)$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const variant = searchParams.get("variant")?.trim().toLowerCase();
  const isExtended = variant === "extended" || variant === "stats";

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 },
    );
  }

  if (!GITHUB_USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      { error: "Invalid GitHub username" },
      { status: 400 },
    );
  }

  try {
    const data = isExtended
      ? await fetchGitHubStreakExtended(username)
      : await fetchGitHubStreak(username);

    if (!data) {
      return NextResponse.json(
        { error: "User not found or has no contribution data" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak data" },
      { status: 500 },
    );
  }
}
