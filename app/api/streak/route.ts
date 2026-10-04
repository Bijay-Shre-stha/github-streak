import { NextResponse } from "next/server";
import { fetchGitHubStreak, fetchGitHubStreakExtended } from "@/lib/github";
import { validateGitHubUsername } from "@/lib/validation";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import {
  apiError,
  errorFromException,
  rateLimitedError,
  jsonError as json,
} from "@/lib/apiErrors";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request): Promise<NextResponse> {
  // Rate limiting
  const rateLimitCheck = checkRateLimit(getClientIP(request));
  if (rateLimitCheck.isLimited) {
    return json(rateLimitedError(rateLimitCheck.resetTime));
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const variant = searchParams.get("variant")?.trim().toLowerCase();
  const isExtended = variant === "extended" || variant === "stats";

  // Validate username
  if (!username) {
    return json(apiError(400, "MISSING_USERNAME", "Username is required"));
  }

  const usernameValidation = validateGitHubUsername(username);
  if (!usernameValidation.valid) {
    return json(
      apiError(400, "INVALID_USERNAME", usernameValidation.error ?? ""),
    );
  }

  try {
    const data = isExtended
      ? await fetchGitHubStreakExtended(username)
      : await fetchGitHubStreak(username);

    if (!data) {
      return json(
        apiError(
          404,
          "NOT_FOUND",
          `GitHub user "${username}" was not found or has no contribution data`,
        ),
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return json(errorFromException(error, "Failed to fetch streak data"));
  }
}
