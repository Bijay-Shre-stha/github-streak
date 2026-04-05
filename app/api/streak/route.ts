import { NextResponse } from "next/server";
import { fetchGitHubStreak } from "@/lib/github";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchGitHubStreak(username);
    
    if (!data) {
      return NextResponse.json(
        { error: "User not found or has no contribution data" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak data" },
      { status: 500 }
    );
  }
}
