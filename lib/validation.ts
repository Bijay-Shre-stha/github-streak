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

  if (!(themeName in themes)) {
    const validThemes = Object.keys(themes).join(", ");
    return {
      valid: false,
      error: `Invalid theme. Valid themes are: ${validThemes}`,
    };
  }

  return { valid: true };
}

/**
 * List all available themes
 */
export function getAvailableThemes(): string[] {
  return Object.keys(themes);
}
