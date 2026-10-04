import { describe, expect, it } from "vitest";
import { calculateStreakStats, type ContributionDay } from "@/lib/github";
import { addDaysUtc, formatUtcDate, todayUtc } from "@/lib/dates";

/** Build consecutive days starting at `start` with the given counts. */
function days(start: string, counts: number[]): ContributionDay[] {
  return counts.map((contributionCount, i) => ({
    date: addDaysUtc(start, i),
    contributionCount,
  }));
}

describe("date helpers", () => {
  it("todayUtc uses the UTC calendar date, not local time", () => {
    expect(todayUtc(new Date("2024-03-10T23:59:59Z"))).toBe("2024-03-10");
    // 00:30 in Nepal (UTC+05:45) is still the previous day in UTC
    expect(todayUtc(new Date("2024-03-10T00:30:00+05:45"))).toBe("2024-03-09");
    // 20:00 in New York (UTC-05:00) is already the next day in UTC
    expect(todayUtc(new Date("2024-03-10T20:00:00-05:00"))).toBe("2024-03-11");
  });

  it("addDaysUtc crosses month, year and leap-day boundaries", () => {
    expect(addDaysUtc("2023-12-31", 1)).toBe("2024-01-01");
    expect(addDaysUtc("2024-01-01", -1)).toBe("2023-12-31");
    expect(addDaysUtc("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDaysUtc("2023-02-28", 1)).toBe("2023-03-01");
    expect(addDaysUtc("2024-03-01", -1)).toBe("2024-02-29");
  });

  it("formatUtcDate does not shift the day", () => {
    expect(formatUtcDate("2024-01-01")).toBe("Jan 1, 2024");
    expect(formatUtcDate("2024-02-29")).toBe("Feb 29, 2024");
  });
});

describe("calculateStreakStats", () => {
  const today = "2024-06-15";

  it("counts today when today has contributions", () => {
    const s = calculateStreakStats("u", days("2024-06-10", [0, 1, 2, 3, 4, 5]), today);
    expect(s.currentStreak).toBe(5);
    expect(s.currentStreakStart).toBe("2024-06-11");
    expect(s.currentStreakEnd).toBe("2024-06-15");
  });

  it("keeps the streak alive when today has no contributions yet", () => {
    const s = calculateStreakStats("u", days("2024-06-10", [0, 1, 2, 3, 4, 0]), today);
    expect(s.currentStreak).toBe(4);
    expect(s.currentStreakStart).toBe("2024-06-11");
    expect(s.currentStreakEnd).toBe("2024-06-14");
  });

  it("handles a yesterday-only streak", () => {
    const s = calculateStreakStats("u", days("2024-06-12", [0, 0, 7, 0]), today);
    expect(s.currentStreak).toBe(1);
    expect(s.currentStreakStart).toBe("2024-06-14");
    expect(s.currentStreakEnd).toBe("2024-06-14");
  });

  it("is zero when neither today nor yesterday has contributions", () => {
    const s = calculateStreakStats("u", days("2024-06-10", [3, 3, 3, 0, 0, 0]), today);
    expect(s.currentStreak).toBe(0);
    expect(s.currentStreakStart).toBeUndefined();
    expect(s.currentStreakEnd).toBeUndefined();
    expect(s.longestStreak).toBe(3);
  });

  it("returns zeros for a user with no contributions", () => {
    const s = calculateStreakStats("u", days("2024-06-01", Array(15).fill(0)), today);
    expect(s).toMatchObject({
      totalContributions: 0,
      currentStreak: 0,
      longestStreak: 0,
      activeDays: 0,
      averagePerDay: 0,
    });
    expect(s.bestDay).toBeUndefined();
    expect(s.totalContributionsStart).toBeUndefined();
    expect(s.longestStreakStart).toBeUndefined();
  });

  it("returns zeros for empty input", () => {
    const s = calculateStreakStats("u", [], today);
    expect(s.currentStreak).toBe(0);
    expect(s.longestStreak).toBe(0);
    expect(s.averagePerDay).toBe(0);
  });

  it("continues streaks across a year boundary", () => {
    const s = calculateStreakStats(
      "u",
      days("2023-12-29", [1, 1, 1, 1, 1]),
      "2024-01-02",
    );
    expect(s.currentStreak).toBe(5);
    expect(s.currentStreakStart).toBe("2023-12-29");
    expect(s.longestStreak).toBe(5);
    expect(s.longestStreakEnd).toBe("2024-01-02");
  });

  it("continues streaks across Feb 29 in a leap year", () => {
    const s = calculateStreakStats("u", days("2024-02-27", [1, 1, 1, 1]), "2024-03-01");
    expect(s.currentStreak).toBe(4); // Feb 27, 28, 29, Mar 1
    expect(s.currentStreakStart).toBe("2024-02-27");
  });

  it("breaks streaks on gaps in the data (e.g. a skipped year)", () => {
    const input = [
      ...days("2021-12-30", [1, 1]),
      ...days("2023-01-01", [1, 1, 1]),
    ];
    const s = calculateStreakStats("u", input, "2023-01-03");
    expect(s.longestStreak).toBe(3);
    expect(s.longestStreakStart).toBe("2023-01-01");
    expect(s.currentStreak).toBe(3);
  });

  it("tracks the longest streak with its dates", () => {
    const s = calculateStreakStats(
      "u",
      days("2024-06-01", [1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1]),
      today,
    );
    expect(s.longestStreak).toBe(4);
    expect(s.longestStreakStart).toBe("2024-06-04");
    expect(s.longestStreakEnd).toBe("2024-06-07");
    expect(s.currentStreak).toBe(1);
  });

  it("ignores future days and merges duplicate dates", () => {
    const input = [
      ...days("2024-06-13", [2, 2, 2]),
      { date: "2024-06-15", contributionCount: 2 }, // duplicate
      ...days("2024-06-16", [0, 0, 0]), // future, would dilute the average
    ];
    const s = calculateStreakStats("u", input, today);
    expect(s.totalContributions).toBe(6);
    expect(s.averagePerDay).toBe(2);
    expect(s.currentStreak).toBe(3);
  });

  it("computes totals, active days, average and best day", () => {
    const s = calculateStreakStats("u", days("2024-06-12", [0, 5, 1, 4]), today);
    expect(s.totalContributions).toBe(10);
    expect(s.activeDays).toBe(3);
    expect(s.averagePerDay).toBe(2.5);
    expect(s.bestDay).toEqual({ date: "2024-06-13", contributionCount: 5 });
    expect(s.totalContributionsStart).toBe("2024-06-13");
  });
});
