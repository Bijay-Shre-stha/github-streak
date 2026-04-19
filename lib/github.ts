// GitHub API base url and helpers for fetching contribution data.

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

type DateCount = { date: string; contributionCount: number };
type ContributionDay = { date: string; contributionCount: number };
type ContributionWeek = { contributionDays: ContributionDay[] };

export interface StreakStats {
  username: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  joinedYear?: number;
  totalContributionsStart?: string;
  currentStreakStart?: string;
  currentStreakEnd?: string;
  longestStreakStart?: string;
  longestStreakEnd?: string;
}

export interface ExtendedStreakStats extends StreakStats {
  activeDays: number;
  averagePerDay: number;
  bestDay?: {
    date: string;
    contributionCount: number;
  };
}

// Fetch all contribution years for a user
async function fetchUserContributionYears(
  username: string,
): Promise<number[] | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set in environment variables");
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionYears
        }
      }
    }
  `;

  const res = await fetch(GITHUB_GRAPHQL_API, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  });

  if (!res.ok) {
    console.error(`Failed to fetch user years for ${username}`);
    return null;
  }

  const data = await res.json();
  if (data.errors) {
    console.error("GraphQL errors fetching years:", data.errors);
    return null;
  }

  return data.data?.user?.contributionsCollection?.contributionYears || null;
}

// Fetch contribution data for a specific year range
async function fetchContributionsForYear(
  username: string,
  fromDate: string,
  toDate: string,
): Promise<DateCount[]> {
  const token = process.env.GITHUB_TOKEN;
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(GITHUB_GRAPHQL_API, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { login: username, from: fromDate, to: toDate },
    }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  const weeks: ContributionWeek[] =
    data.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];

  const days: DateCount[] = [];
  weeks.forEach((week) => {
    week.contributionDays.forEach((day) => {
      days.push({
        date: day.date,
        contributionCount: day.contributionCount,
      });
    });
  });

  return days;
}

export async function fetchGitHubStreak(
  username: string,
): Promise<StreakStats | null> {
  const stats = await fetchGitHubStreakExtended(username);
  if (!stats) return null;

  return {
    username: stats.username,
    totalContributions: stats.totalContributions,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    joinedYear: stats.joinedYear,
    totalContributionsStart: stats.totalContributionsStart,
    currentStreakStart: stats.currentStreakStart,
    currentStreakEnd: stats.currentStreakEnd,
    longestStreakStart: stats.longestStreakStart,
    longestStreakEnd: stats.longestStreakEnd,
  };
}

export async function fetchGitHubStreakExtended(
  username: string,
): Promise<ExtendedStreakStats | null> {
  try {
    const years = await fetchUserContributionYears(username);
    if (!years || years.length === 0) return null;

    // Fetch data for all years in parallel to be efficient
    const yearPromises = years.map((year) => {
      const from = `${year}-01-01T00:00:00Z`;
      const to = `${year}-12-31T23:59:59Z`;
      return fetchContributionsForYear(username, from, to);
    });

    const yearsData = await Promise.all(yearPromises);

    // Flatten and sort chronologically
    const allDays = yearsData
      .flat()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalContributions = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let longestStreakStart = "";
    let longestStreakEnd = "";
    let activeDays = 0;
    let bestDay: DateCount | undefined;

    let tempStreak = 0;
    let tempStreakStart = "";

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

    // We process days backwards for the current streak,
    // but calculating longest streak is easier going forwards.
    // Let's do a single pass going through all ascending days:
    allDays.forEach((day) => {
      totalContributions += day.contributionCount;

      if (day.contributionCount > 0) {
        activeDays++;
      }

      if (!bestDay || day.contributionCount > bestDay.contributionCount) {
        bestDay = day;
      }

      if (day.contributionCount > 0) {
        if (tempStreak === 0) {
          tempStreakStart = day.date;
        }
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
          longestStreakStart = tempStreakStart;
          longestStreakEnd = day.date;
        }
      } else {
        tempStreak = 0;
      }
    });

    // Determine current streak by walking backward from today/yesterday
    let curStreak = 0;
    let curStreakStart = "";
    let curStreakEnd = "";

    for (let i = allDays.length - 1; i >= 0; i--) {
      const day = allDays[i];
      if (day.date > todayStr) continue; // Future dates shouldn't happen, but ignore if they do

      if (day.date === todayStr && day.contributionCount === 0) {
        // Today is 0. Streak could still be alive from yesterday.
        continue;
      }

      if (day.contributionCount > 0) {
        if (curStreak === 0) {
          curStreakEnd = day.date;
        }
        curStreak++;
        curStreakStart = day.date;
      } else {
        // If yesterday was 0 and today was 0 (checked above), streak is broken.
        // Wait, if we are here, it means we hit a 0.
        if (day.date === yesterdayStr && curStreak === 0) {
          break;
        }
        if (day.date < yesterdayStr) {
          break;
        }
      }
    }

    currentStreak = curStreak;
    const firstActiveDay = allDays.find((d) => d.contributionCount > 0)?.date;
    const averagePerDay =
      allDays.length > 0
        ? Number((totalContributions / allDays.length).toFixed(2))
        : 0;

    return {
      username,
      totalContributions,
      currentStreak,
      longestStreak,
      activeDays,
      averagePerDay,
      bestDay: bestDay
        ? {
            date: bestDay.date,
            contributionCount: bestDay.contributionCount,
          }
        : undefined,
      joinedYear: years[years.length - 1],
      totalContributionsStart: firstActiveDay,
      currentStreakStart: curStreak > 0 ? curStreakStart : undefined,
      currentStreakEnd: curStreak > 0 ? curStreakEnd : undefined,
      longestStreakStart: longestStreak > 0 ? longestStreakStart : undefined,
      longestStreakEnd: longestStreak > 0 ? longestStreakEnd : undefined,
    };
  } catch (err) {
    console.error("Error fetching GitHub streak:", err);
    return null;
  }
}
