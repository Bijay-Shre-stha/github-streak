import { describe, it, expect } from "vitest";
import {
  validateGitHubUsername,
  validateTheme,
  getAvailableThemes,
} from "@/lib/validation";

describe("validation utilities", () => {
  describe("validateGitHubUsername", () => {
    it("should accept valid GitHub usernames", () => {
      expect(validateGitHubUsername("torvalds")).toEqual({ valid: true });
      expect(validateGitHubUsername("getify")).toEqual({ valid: true });
      expect(validateGitHubUsername("bijay-shre-stha")).toEqual({
        valid: true,
      });
      expect(validateGitHubUsername("user123")).toEqual({ valid: true });
      expect(validateGitHubUsername("a")).toEqual({ valid: true });
      expect(validateGitHubUsername("a-b-c")).toEqual({ valid: true });
    });

    it("should reject usernames starting with hyphen", () => {
      const result = validateGitHubUsername("-invalid");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject usernames ending with hyphen", () => {
      const result = validateGitHubUsername("invalid-");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject usernames with consecutive hyphens", () => {
      const result = validateGitHubUsername("invalid--name");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty usernames", () => {
      const result = validateGitHubUsername("");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject usernames longer than 39 characters", () => {
      const longUsername = "a".repeat(40);
      const result = validateGitHubUsername(longUsername);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject usernames with special characters", () => {
      expect(validateGitHubUsername("user@name").valid).toBe(false);
      expect(validateGitHubUsername("user#name").valid).toBe(false);
      expect(validateGitHubUsername("user name").valid).toBe(false);
      expect(validateGitHubUsername("user_name").valid).toBe(false);
    });
  });

  describe("validateTheme", () => {
    it("should accept valid theme names", () => {
      const validThemes = getAvailableThemes();
      validThemes.forEach((theme) => {
        expect(validateTheme(theme)).toEqual({ valid: true });
      });
    });

    it("should reject invalid theme names", () => {
      const result = validateTheme("invalid-theme");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Invalid theme");
    });

    it("should reject empty theme names", () => {
      const result = validateTheme("");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should be case-sensitive", () => {
      // Assuming 'default' is a valid theme, 'Default' should not be
      const result = validateTheme("Default");
      expect(result.valid).toBe(false);
    });
  });

  describe("getAvailableThemes", () => {
    it("should return array of theme strings", () => {
      const themes = getAvailableThemes();
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      expect(themes.every((t) => typeof t === "string")).toBe(true);
    });

    it("should include expected themes", () => {
      const themes = getAvailableThemes();
      expect(themes).toContain("default");
      expect(themes).toContain("github");
      expect(themes).toContain("radical");
    });
  });
});
