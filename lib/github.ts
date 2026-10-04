// GitHub API base url and helpers for fetching contribution data.

import { addDaysUtc, todayUtc } from "./dates";

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

export interface ContributionDay {
  date: string;
  contributionCount: number;
}
interface ContributionWeek {
  contributionDays: ContributionDay[];
}

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

export interface GitHubUserProfile {
  login: string;
  id: number;
  avatarUrl: string;
  name: string | null;
  bio: string | null;
  email: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  twitterUsername: string | null;
  blog: string | null;
  company: string | null;
  location: string | null;
  htmlUrl: string;
}

/** Error talking to GitHub (bad token, upstream rate limit, outage). */
export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

interface GraphQLError {
  type?: string;
  message: string;
}

function retryAfterSeconds(res: Response): number | undefined {
  const retryAfter = Number(res.headers.get("retry-after"));
  if (retryAfter > 0) return retryAfter;
  const reset = Number(res.headers.get("x-ratelimit-reset"));
  if (reset > 0) return Math.max(1, Math.ceil(reset - Date.now() / 1000));
  return undefined;
}

/**
 * Run a GraphQL query. Returns `data` (with `user: null` when the user does
 * not exist) and throws GitHubApiError for every other failure, so callers can
 * tell "not found" apart from "GitHub is unavailable".
 */
async function githubGraphQL<T>(
  query: string,
  variables: Record<string, string>,
): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new GitHubApiError("GITHUB_TOKEN is not configured on the server", 500);
  }

  const res = await fetch(GITHUB_GRAPHQL_API, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 401) {
    throw new GitHubApiError("The server's GitHub token is invalid", 500);
  }
  if (res.status === 403 || res.status === 429) {
    throw new GitHubApiError(
      "GitHub API rate limit reached",
      429,
      retryAfterSeconds(res),
    );
  }
  if (!res.ok) {
    throw new GitHubApiError(`GitHub API responded with ${res.status}`, 502);
  }

  const body = (await res.json()) as { data?: T; errors?: GraphQLError[] };
  const errors = (body.errors ?? []).filter((e) => e.type !== "NOT_FOUND");
  if (errors.some((e) => e.type === "RATE_LIMITED")) {
    throw new GitHubApiError(
      "GitHub API rate limit reached",
      429,
      retryAfterSeconds(res),
    );
  }
  if (errors.length > 0 || !body.data) {
    console.error("GitHub GraphQL errors:", body.errors);
    throw new GitHubApiError("GitHub API returned an error", 502);
  }
  return body.data;
}

// Fetch all contribution years for a user (null when the user doesn't exist)
async function fetchUserContributionYears(
  username: string,
): Promise<number[] | null> {
  const data = await githubGraphQL<{
    user: { contributionsCollection: { contributionYears: number[] } } | null;
  }>(
    `query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionYears
        }
      }
    }`,
    { login: username },
  );
  return data.user?.contributionsCollection.contributionYears ?? null;
}

// Fetch contribution data for a specific year range
async function fetchContributionsForYear(
  username: string,
  fromDate: string,
  toDate: string,
): Promise<ContributionDay[]> {
  const data = await githubGraphQL<{
    user: {
      contributionsCollection: {
        contributionCalendar: { weeks: ContributionWeek[] };
      };
    } | null;
  }>(
    `query($login: String!, $from: DateTime!, $to: DateTime!) {
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
    }`,
    { login: username, from: fromDate, to: toDate },
  );

  const weeks =
    data.user?.contributionsCollection.contributionCalendar.weeks ?? [];
  return weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      contributionCount: day.contributionCount,
    })),
  );
}

/**
 * Pure streak calculation over GitHub contribution-calendar days.
 *
 * Rules (all dates are UTC calendar dates, see lib/dates.ts):
 * - Days after `today` are ignored; duplicate dates are merged.
 * - A streak is a run of consecutive calendar days with > 0 contributions.
 *   Missing dates (e.g. a skipped year) break a streak.
 * - The current streak ends today if today has contributions. If today has
 *   none yet, the streak is still alive when yesterday had contributions
 *   (the day isn't over). Otherwise it is 0.
 * - averagePerDay = total contributions / number of calendar days up to today.
 */
export function calculateStreakStats(
  username: string,
  inputDays: ContributionDay[],
  today: string = todayUtc(),
): Omit<ExtendedStreakStats, "joinedYear"> {
  const byDate = new Map<string, number>();
  for (const day of inputDays) {
    if (day.date > today) continue;
    byDate.set(
      day.date,
      Math.max(byDate.get(day.date) ?? 0, day.contributionCount),
    );
  }
  const dates = [...byDate.keys()].sort();

  let totalContributions = 0;
  let activeDays = 0;
  let bestDay: ContributionDay | undefined;
  let longestStreak = 0;
  let longestStreakStart = "";
  let longestStreakEnd = "";
  let run = 0;
  let runStart = "";
  let prevDate = "";

  for (const date of dates) {
    const count = byDate.get(date) ?? 0;
    totalContributions += count;
    if (count > 0 && (!bestDay || count > bestDay.contributionCount)) {
      bestDay = { date, contributionCount: count };
    }

    if (count > 0) {
      activeDays++;
      if (run === 0 || addDaysUtc(prevDate, 1) !== date) {
        run = 0;
        runStart = date;
      }
      run++;
      if (run > longestStreak) {
        longestStreak = run;
        longestStreakStart = runStart;
        longestStreakEnd = date;
      }
    } else {
      run = 0;
    }
    prevDate = date;
  }

  // Current streak: walk backwards from today (or yesterday if today is 0).
  let currentStreak = 0;
  let currentStreakStart = "";
  let currentStreakEnd = "";
  let cursor = (byDate.get(today) ?? 0) > 0 ? today : addDaysUtc(today, -1);
  while ((byDate.get(cursor) ?? 0) > 0) {
    if (currentStreak === 0) currentStreakEnd = cursor;
    currentStreak++;
    currentStreakStart = cursor;
    cursor = addDaysUtc(cursor, -1);
  }

  return {
    username,
    totalContributions,
    currentStreak,
    longestStreak,
    activeDays,
    averagePerDay:
      dates.length > 0
        ? Number((totalContributions / dates.length).toFixed(2))
        : 0,
    bestDay,
    totalContributionsStart: dates.find((d) => (byDate.get(d) ?? 0) > 0),
    currentStreakStart: currentStreak > 0 ? currentStreakStart : undefined,
    currentStreakEnd: currentStreak > 0 ? currentStreakEnd : undefined,
    longestStreakStart: longestStreak > 0 ? longestStreakStart : undefined,
    longestStreakEnd: longestStreak > 0 ? longestStreakEnd : undefined,
  };
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

/**
 * Returns null when the user does not exist or has no contribution years.
 * Throws GitHubApiError when GitHub itself fails.
 */
export async function fetchGitHubStreakExtended(
  username: string,
): Promise<ExtendedStreakStats | null> {
  const years = await fetchUserContributionYears(username);
  if (!years || years.length === 0) return null;

  // Fetch data for all years in parallel to be efficient
  const yearsData = await Promise.all(
    years.map((year) =>
      fetchContributionsForYear(
        username,
        `${year}-01-01T00:00:00Z`,
        `${year}-12-31T23:59:59Z`,
      ),
    ),
  );

  return {
    ...calculateStreakStats(username, yearsData.flat()),
    joinedYear: Math.min(...years),
  };
}

// Fetch user profile data from GitHub (null when the user doesn't exist)
export async function fetchGitHubUserProfile(
  username: string,
): Promise<GitHubUserProfile | null> {
  const data = await githubGraphQL<{
    user: {
      login: string;
      databaseId: number;
      avatarUrl: string;
      name: string | null;
      bio: string | null;
      followers: { totalCount: number };
      following: { totalCount: number };
      repositories: { totalCount: number };
      createdAt: string;
      twitterUsername: string | null;
      websiteUrl: string | null;
      company: string | null;
      location: string | null;
      url: string;
    } | null;
  }>(
    `query($login: String!) {
      user(login: $login) {
        login
        databaseId
        avatarUrl(size: 256)
        name
        bio
        followers { totalCount }
        following { totalCount }
        repositories(privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false) { totalCount }
        createdAt
        twitterUsername
        websiteUrl
        company
        location
        url
      }
    }`,
    { login: username },
  );

  const user = data.user;
  if (!user) return null;

  // GraphQL field names differ from the REST-style names this API exposes.
  return {
    login: user.login,
    id: user.databaseId,
    avatarUrl: user.avatarUrl,
    name: user.name,
    bio: user.bio,
    // `email` needs the user:email scope, which a no-scope token lacks and
    // would fail the whole query; it is kept in the response shape as null.
    email: null,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    publicRepos: user.repositories.totalCount,
    createdAt: user.createdAt,
    twitterUsername: user.twitterUsername,
    blog: user.websiteUrl,
    company: user.company,
    location: user.location,
    htmlUrl: user.url,
  };
}
