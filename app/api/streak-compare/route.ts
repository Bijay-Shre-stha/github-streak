import { NextResponse } from "next/server";
import { fetchGitHubStreakExtended } from "@/lib/github";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { buildComparedStreakStats } from "@/lib/streakCompare";
import { validateGitHubUsername } from "@/lib/validation";
import {
  apiError,
  errorFromException,
  rateLimitedError,
  jsonError as json,
} from "@/lib/apiErrors";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request): Promise<NextResponse> {
  const rateLimitCheck = checkRateLimit(getClientIP(request));
  if (rateLimitCheck.isLimited) {
    return json(rateLimitedError(rateLimitCheck.resetTime));
  }

  const { searchParams } = new URL(request.url);
  const userA = searchParams.get("userA")?.trim();
  const userB = searchParams.get("userB")?.trim();

  if (!userA || !userB) {
    return json(
      apiError(400, "MISSING_USERS", "Both userA and userB are required"),
    );
  }

  const userAValidation = validateGitHubUsername(userA);
  if (!userAValidation.valid) {
    return json(
      apiError(400, "INVALID_USER_A", `Invalid userA: ${userAValidation.error}`),
    );
  }

  const userBValidation = validateGitHubUsername(userB);
  if (!userBValidation.valid) {
    return json(
      apiError(400, "INVALID_USER_B", `Invalid userB: ${userBValidation.error}`),
    );
  }

  // GitHub usernames are case-insensitive
  if (userA.toLowerCase() === userB.toLowerCase()) {
    return json(
      apiError(400, "SAME_USER", "Choose two different GitHub usernames"),
    );
  }

  try {
    const [statsA, statsB] = await Promise.all([
      fetchGitHubStreakExtended(userA),
      fetchGitHubStreakExtended(userB),
    ]);

    if (!statsA || !statsB) {
      const missing = [!statsA && userA, !statsB && userB].filter(Boolean);
      return json(
        apiError(
          404,
          "NOT_FOUND",
          missing.length === 2
            ? `Neither "${userA}" nor "${userB}" was found or has contribution data`
            : `GitHub user "${missing[0]}" was not found or has no contribution data`,
          { missingUsers: { userA: !statsA, userB: !statsB } },
        ),
      );
    }

    return NextResponse.json(buildComparedStreakStats(statsA, statsB));
  } catch (error) {
    console.error("streak-compare API error:", error);
    return json(errorFromException(error, "Failed to compare streak data"));
  }
}
