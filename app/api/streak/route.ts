import { NextResponse } from "next/server";
import { fetchGitHubStreak, fetchGitHubStreakExtended } from "@/lib/github";
import { validateGitHubUsername, validateTheme } from "@/lib/validation";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitCheck = checkRateLimit(clientIP);

  if (rateLimitCheck.isLimited) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        code: "RATE_LIMITED",
        retryAfter: Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (rateLimitCheck.resetTime - Date.now()) / 1000,
          ).toString(),
        },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const variant = searchParams.get("variant")?.trim().toLowerCase();
  const isExtended = variant === "extended" || variant === "stats";

  // Validate username
  if (!username) {
    return NextResponse.json(
      { error: "Username is required", code: "MISSING_USERNAME" },
      { status: 400 },
    );
  }

  const usernameValidation = validateGitHubUsername(username);
  if (!usernameValidation.valid) {
    return NextResponse.json(
      { error: usernameValidation.error, code: "INVALID_USERNAME" },
      { status: 400 },
    );
  }

  try {
    const data = isExtended
      ? await fetchGitHubStreakExtended(username)
      : await fetchGitHubStreak(username);

    if (!data) {
      return NextResponse.json(
        {
          error: "User not found or has no contribution data",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch streak data";
    return NextResponse.json(
      { error: errorMessage, code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
