import { NextResponse } from "next/server";
import { fetchGitHubStreakExtended } from "@/lib/github";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { buildComparedStreakStats } from "@/lib/streakCompare";
import { validateGitHubUsername } from "@/lib/validation";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
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
  const userA = searchParams.get("userA")?.trim();
  const userB = searchParams.get("userB")?.trim();

  if (!userA || !userB) {
    return NextResponse.json(
      {
        error: "Both userA and userB are required",
        code: "MISSING_USERS",
      },
      { status: 400 },
    );
  }

  const userAValidation = validateGitHubUsername(userA);
  if (!userAValidation.valid) {
    return NextResponse.json(
      {
        error: `Invalid userA: ${userAValidation.error}`,
        code: "INVALID_USER_A",
      },
      { status: 400 },
    );
  }

  const userBValidation = validateGitHubUsername(userB);
  if (!userBValidation.valid) {
    return NextResponse.json(
      {
        error: `Invalid userB: ${userBValidation.error}`,
        code: "INVALID_USER_B",
      },
      { status: 400 },
    );
  }

  try {
    const [statsA, statsB] = await Promise.all([
      fetchGitHubStreakExtended(userA),
      fetchGitHubStreakExtended(userB),
    ]);

    if (!statsA || !statsB) {
      return NextResponse.json(
        {
          error:
            "One or both users were not found or have no contribution data",
          code: "NOT_FOUND",
          missingUsers: {
            userA: !statsA,
            userB: !statsB,
          },
        },
        { status: 404 },
      );
    }

    const comparedStats = buildComparedStreakStats(statsA, statsB);
    return NextResponse.json(comparedStats);
  } catch (error) {
    console.error("streak-compare API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to compare streak data";

    return NextResponse.json(
      {
        error: errorMessage,
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
