import { describe, expect, it } from "vitest";
import type { ExtendedStreakStats } from "@/lib/github";
import { buildComparedStreakStats } from "@/lib/streakCompare";

function makeStats(
  username: string,
  overrides: Partial<ExtendedStreakStats>,
): ExtendedStreakStats {
  return {
    username,
    totalContributions: 100,
    currentStreak: 10,
    longestStreak: 20,
    joinedYear: 2020,
    activeDays: 80,
    averagePerDay: 1.25,
    ...overrides,
  };
}

describe("buildComparedStreakStats", () => {
  it("should compute numeric diffs as userA - userB", () => {
    const userA = makeStats("alice", {
      totalContributions: 500,
      currentStreak: 8,
      longestStreak: 31,
      activeDays: 200,
      averagePerDay: 2.4,
    });
    const userB = makeStats("bob", {
      totalContributions: 400,
      currentStreak: 12,
      longestStreak: 20,
      activeDays: 190,
      averagePerDay: 1.95,
    });

    const result = buildComparedStreakStats(userA, userB);

    expect(result.diff.totalContributions).toBe(100);
    expect(result.diff.currentStreak).toBe(-4);
    expect(result.diff.longestStreak).toBe(11);
    expect(result.diff.activeDays).toBe(10);
    expect(result.diff.averagePerDay).toBe(0.45);
  });

  it("should mark leaders per metric and support ties", () => {
    const userA = makeStats("alice", {
      totalContributions: 100,
      currentStreak: 7,
      longestStreak: 30,
      activeDays: 150,
      averagePerDay: 1.5,
    });
    const userB = makeStats("bob", {
      totalContributions: 100,
      currentStreak: 9,
      longestStreak: 15,
      activeDays: 151,
      averagePerDay: 1.5,
    });

    const result = buildComparedStreakStats(userA, userB);

    expect(result.leaders.totalContributions).toBe("tie");
    expect(result.leaders.currentStreak).toBe("userB");
    expect(result.leaders.longestStreak).toBe("userA");
    expect(result.leaders.activeDays).toBe("userB");
    expect(result.leaders.averagePerDay).toBe("tie");
    expect(result.comparedAt).toBeTypeOf("string");
  });
});
