// Validation utilities for GitHub usernames and themes

import { themes } from "./themes";

const GITHUB_USERNAME_REGEX = /^(?!-)(?!.*--)[A-Za-z0-9-]{1,39}(?<!-)$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a GitHub username format
 * - Must be 1-39 characters
 * - Can contain letters, numbers, and hyphens
 * - Cannot start or end with hyphen
 * - Cannot contain consecutive hyphens
 */
export function validateGitHubUsername(username: string): ValidationResult {
  if (!username || typeof username !== "string") {
    return { valid: false, error: "Username is required and must be a string" };
  }

  if (!GITHUB_USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      error: "Invalid GitHub username format",
    };
  }

  return { valid: true };
}

/**
 * Validates that a theme name exists in the themes collection
 */
export function validateTheme(themeName: string): ValidationResult {
  if (!themeName || typeof themeName !== "string") {
    return {
      valid: false,
      error: "Theme name is required and must be a string",
    };
  }

  if (!Object.hasOwn(themes, themeName)) {
    const validThemes = Object.keys(themes).join(", ");
    return {
      valid: false,
      error: `Invalid theme. Valid themes are: ${validThemes}`,
    };
  }

  return { valid: true };
}

/**
 * Clean up what users paste into a username box:
 * "  @torvalds ", "https://github.com/torvalds/" -> "torvalds"
 */
export function normalizeUsername(input: string): string {
  return input
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");
}

/** Returns `themeName` if it is a known theme, otherwise "default". */
export function resolveTheme(themeName: string | null | undefined): string {
  return themeName && Object.hasOwn(themes, themeName) ? themeName : "default";
}

export const MAX_LEADERBOARD_USERS = 10;

export interface ParsedUsernameList {
  usernames: string[];
  invalid: string[];
  tooMany: boolean;
}

/**
 * Parse a comma/space/newline separated list of usernames.
 * Removes case-insensitive duplicates and keeps at most MAX_LEADERBOARD_USERS.
 */
export function parseUsernameList(input: string): ParsedUsernameList {
  const seen = new Set<string>();
  const usernames: string[] = [];
  const invalid: string[] = [];

  for (const raw of input.split(/[\s,]+/)) {
    const name = normalizeUsername(raw);
    if (!name) continue;
    if (!validateGitHubUsername(name).valid) {
      invalid.push(name);
      continue;
    }
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    usernames.push(name);
  }

  return {
    usernames: usernames.slice(0, MAX_LEADERBOARD_USERS),
    invalid,
    tooMany: usernames.length > MAX_LEADERBOARD_USERS,
  };
}

/**
 * List all available themes
 */
export function getAvailableThemes(): string[] {
  return Object.keys(themes);
}
