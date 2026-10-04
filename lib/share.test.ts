import { describe, expect, it } from "vitest";
import {
  SITE_URL,
  compareUrl,
  leaderboardUrl,
  profileUrl,
  readmeMarkdown,
  streakImageUrl,
} from "@/lib/share";
import { mergeRecent } from "@/lib/recentSearches";

describe("share URLs", () => {
  it("uses an absolute production URL, never a placeholder domain", () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
    expect(SITE_URL).not.toMatch(/your-(domain|site)|localhost/);
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  it("builds profile URLs and only includes non-default themes", () => {
    expect(profileUrl("torvalds")).toBe(`${SITE_URL}/torvalds`);
    expect(profileUrl("torvalds", "default")).toBe(`${SITE_URL}/torvalds`);
    expect(profileUrl("torvalds", "radical")).toBe(`${SITE_URL}/torvalds?theme=radical`);
  });

  it("builds the streak image URL with encoded params", () => {
    expect(streakImageUrl("a-b", "dracula")).toBe(
      `${SITE_URL}/api/streak-image?username=a-b&theme=dracula`,
    );
  });

  it("builds README markdown linking the image to the profile page", () => {
    expect(readmeMarkdown("octocat", "github")).toBe(
      `[![GitHub Streak](${SITE_URL}/api/streak-image?username=octocat&theme=github)](${SITE_URL}/octocat?theme=github)`,
    );
  });

  it("builds compare and leaderboard URLs", () => {
    expect(compareUrl("a", "b")).toBe(`${SITE_URL}/?mode=compare&userA=a&userB=b`);
    expect(compareUrl("a", "b", "react")).toBe(
      `${SITE_URL}/?mode=compare&userA=a&userB=b&theme=react`,
    );
    expect(leaderboardUrl(["a", "b", "c"])).toBe(`${SITE_URL}/leaderboard?users=a,b,c`);
  });
});

describe("mergeRecent", () => {
  it("puts the newest first, dedupes case-insensitively and caps the list", () => {
    expect(mergeRecent(["b", "A"], "a")).toEqual(["a", "b"]);
    expect(mergeRecent(["1", "2", "3", "4", "5", "6"], "7")).toEqual([
      "7", "1", "2", "3", "4", "5",
    ]);
  });
});
