import type { ExtendedStreakStats } from "@/lib/github";

type Winner = "userA" | "userB" | "tie";

export interface StreakDiff {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  averagePerDay: number;
}

export interface StreakLeaders {
  totalContributions: Winner;
  currentStreak: Winner;
  longestStreak: Winner;
  activeDays: Winner;
  averagePerDay: Winner;
}

export interface ComparedStreakStats {
  comparedAt: string;
  userA: ExtendedStreakStats;
  userB: ExtendedStreakStats;
  diff: StreakDiff;
  leaders: StreakLeaders;
}

function getWinner(a: number, b: number): Winner {
  if (a > b) return "userA";
  if (b > a) return "userB";
  return "tie";
}

export function buildComparedStreakStats(
  userA: ExtendedStreakStats,
  userB: ExtendedStreakStats,
): ComparedStreakStats {
  return {
    comparedAt: new Date().toISOString(),
    userA,
    userB,
    diff: {
      totalContributions: userA.totalContributions - userB.totalContributions,
      currentStreak: userA.currentStreak - userB.currentStreak,
      longestStreak: userA.longestStreak - userB.longestStreak,
      activeDays: userA.activeDays - userB.activeDays,
      averagePerDay: Number(
        (userA.averagePerDay - userB.averagePerDay).toFixed(2),
      ),
    },
    leaders: {
      totalContributions: getWinner(
        userA.totalContributions,
        userB.totalContributions,
      ),
      currentStreak: getWinner(userA.currentStreak, userB.currentStreak),
      longestStreak: getWinner(userA.longestStreak, userB.longestStreak),
      activeDays: getWinner(userA.activeDays, userB.activeDays),
      averagePerDay: getWinner(userA.averagePerDay, userB.averagePerDay),
    },
  };
}
