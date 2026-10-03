import { NextResponse } from "next/server";
import { fetchGitHubUserProfile } from "@/lib/github";
import { validateGitHubUsername } from "@/lib/validation";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import {
  apiError,
  errorFromException,
  rateLimitedError,
  jsonError as json,
} from "@/lib/apiErrors";

export const revalidate = 3600;

export async function GET(request: Request): Promise<NextResponse> {
  const rateLimitCheck = checkRateLimit(getClientIP(request));
  if (rateLimitCheck.isLimited) {
    return json(rateLimitedError(rateLimitCheck.resetTime));
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

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
    const profile = await fetchGitHubUserProfile(username);

    if (!profile) {
      return json(apiError(404, "NOT_FOUND", "User not found"));
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile API error:", error);
    return json(errorFromException(error, "Failed to fetch profile"));
  }
}
