// GitHub API base url and helpers for fetching contribution data.

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

type DateCount = { date: string; contributionCount: number };

export interface StreakStats {
  username: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  joinedYear?: number;
}

// Fetch all contribution years for a user
async function fetchUserContributionYears(username: string): Promise<number[] | null> {
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
async function fetchContributionsForYear(username: string, fromDate: string, toDate: string): Promise<DateCount[]> {
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
  const weeks = data.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
  
  let days: DateCount[] = [];
  weeks.forEach((week: any) => {
    week.contributionDays.forEach((day: any) => {
      days.push({
        date: day.date,
        contributionCount: day.contributionCount,
      });
    });
  });

  return days;
}

export async function fetchGitHubStreak(username: string): Promise<StreakStats | null> {
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
    const allDays = yearsData.flat().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalContributions = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

    let streakAlive = true;

    // We process days backwards for the current streak, 
    // but calculating longest streak is easier going forwards.
    // Let's do a single pass going through all ascending days:
    allDays.forEach((day) => {
      totalContributions += day.contributionCount;

      if (day.contributionCount > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    });

    // Determine current streak by walking backward from today/yesterday
    let curStreak = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      const day = allDays[i];
      if (day.date > todayStr) continue; // Future dates shouldn't happen, but ignore if they do
      
      if (day.date === todayStr && day.contributionCount === 0) {
        // Today is 0. Streak could still be alive from yesterday.
        continue;
      }

      if (day.contributionCount > 0) {
        curStreak++;
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

    return {
      username,
      totalContributions,
      currentStreak,
      longestStreak,
      joinedYear: years[years.length - 1]
    };
  } catch (err) {
    console.error("Error fetching GitHub streak:", err);
    return null;
  }
}
