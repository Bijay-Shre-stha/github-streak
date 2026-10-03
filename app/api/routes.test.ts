import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExtendedStreakStats } from "@/lib/github";
import { clearRateLimitStore } from "@/lib/rateLimit";

vi.mock("@/lib/github", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/github")>();
  return {
    ...actual,
    fetchGitHubStreak: vi.fn(),
    fetchGitHubStreakExtended: vi.fn(),
    fetchGitHubUserProfile: vi.fn(),
  };
});

const github = await import("@/lib/github");
const streakRoute = await import("@/app/api/streak/route");
const compareRoute = await import("@/app/api/streak-compare/route");
const imageRoute = await import("@/app/api/streak-image/route");

const mockStreak = vi.mocked(github.fetchGitHubStreak);
const mockExtended = vi.mocked(github.fetchGitHubStreakExtended);

function stats(username: string, overrides: Partial<ExtendedStreakStats> = {}): ExtendedStreakStats {
  return {
    username,
    totalContributions: 10,
    currentStreak: 2,
    longestStreak: 5,
    activeDays: 4,
    averagePerDay: 1,
    ...overrides,
  };
}

function req(path: string, ip = "10.0.0.1"): Request {
  return new Request(`http://localhost${path}`, {
    headers: { "x-forwarded-for": ip },
  });
}

beforeEach(() => {
  clearRateLimitStore();
  vi.clearAllMocks();
});

describe("GET /api/streak", () => {
  it("400 when username is missing", async () => {
    const res = await streakRoute.GET(req("/api/streak"));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "MISSING_USERNAME" });
  });

  it("400 for an invalid username, without calling GitHub", async () => {
    const res = await streakRoute.GET(req("/api/streak?username=-bad-"));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "INVALID_USERNAME" });
    expect(mockStreak).not.toHaveBeenCalled();
  });

  it("404 with the username in the message when the user doesn't exist", async () => {
    mockStreak.mockResolvedValue(null);
    const res = await streakRoute.GET(req("/api/streak?username=ghost"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe("NOT_FOUND");
    expect(body.error).toContain("ghost");
  });

  it("200 with stats; extended variant uses the extended fetcher", async () => {
    mockExtended.mockResolvedValue(stats("octocat"));
    const res = await streakRoute.GET(req("/api/streak?username=octocat&variant=extended"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ username: "octocat", activeDays: 4 });
    expect(mockExtended).toHaveBeenCalledWith("octocat");
  });

  it("maps a GitHub upstream rate limit to 429 with Retry-After", async () => {
    mockStreak.mockRejectedValue(new github.GitHubApiError("limited", 429, 42));
    const res = await streakRoute.GET(req("/api/streak?username=octocat"));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("42");
    expect(await res.json()).toMatchObject({ code: "UPSTREAM_RATE_LIMITED", retryAfter: 42 });
  });

  it("maps other GitHub failures to 502 and unknown errors to 500", async () => {
    mockStreak.mockRejectedValueOnce(new github.GitHubApiError("bad gateway", 502));
    expect((await streakRoute.GET(req("/api/streak?username=a"))).status).toBe(502);
    mockStreak.mockRejectedValueOnce(new Error("boom"));
    const res = await streakRoute.GET(req("/api/streak?username=a"));
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ code: "INTERNAL_ERROR" });
  });

  it("rate limits per IP after 60 requests with Retry-After", async () => {
    mockStreak.mockResolvedValue(stats("a"));
    for (let i = 0; i < 60; i++) {
      expect((await streakRoute.GET(req("/api/streak?username=a"))).status).toBe(200);
    }
    const limited = await streakRoute.GET(req("/api/streak?username=a"));
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(await limited.json()).toMatchObject({ code: "RATE_LIMITED" });

    // A different client is unaffected
    expect((await streakRoute.GET(req("/api/streak?username=a", "10.0.0.2"))).status).toBe(200);
  });
});

describe("GET /api/streak-compare", () => {
  it("400 when a user is missing", async () => {
    const res = await compareRoute.GET(req("/api/streak-compare?userA=a"));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "MISSING_USERS" });
  });

  it("400 SAME_USER for identical usernames (case-insensitive)", async () => {
    const res = await compareRoute.GET(req("/api/streak-compare?userA=Octocat&userB=octocat"));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "SAME_USER" });
    expect(mockExtended).not.toHaveBeenCalled();
  });

  it("404 names the missing user", async () => {
    mockExtended.mockImplementation(async (u) => (u === "real" ? stats("real") : null));
    const res = await compareRoute.GET(req("/api/streak-compare?userA=real&userB=ghost"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain('"ghost"');
    expect(body.missingUsers).toEqual({ userA: false, userB: true });
  });

  it("200 with diff and leaders", async () => {
    mockExtended.mockImplementation(async (u) =>
      stats(u, { currentStreak: u === "a" ? 9 : 3 }),
    );
    const res = await compareRoute.GET(req("/api/streak-compare?userA=a&userB=b"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.diff.currentStreak).toBe(6);
    expect(body.leaders.currentStreak).toBe("userA");
    expect(body.leaders.totalContributions).toBe("tie");
  });
});

describe("GET /api/streak-image", () => {
  it("400 for an unknown theme, including inherited object keys", async () => {
    for (const theme of ["nope", "toString", "__proto__"]) {
      const res = await imageRoute.GET(req(`/api/streak-image?username=a&theme=${theme}`));
      expect(res.status).toBe(400);
    }
  });

  it("returns an SVG with UTC-formatted dates", async () => {
    mockStreak.mockResolvedValue(
      stats("a", { currentStreakStart: "2024-01-01", currentStreakEnd: "2024-01-02" }),
    );
    const res = await imageRoute.GET(req("/api/streak-image?username=a&theme=radical"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(await res.text()).toContain("Jan 1, 2024 - Jan 2, 2024");
  });
});

describe("GitHub GraphQL error handling", () => {
  beforeEach(() => {
    vi.stubEnv("GITHUB_TOKEN", "test-token");
  });

  it("returns null for a user that doesn't exist", async () => {
    const actual = await vi.importActual<typeof import("@/lib/github")>("@/lib/github");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ data: { user: null }, errors: [{ type: "NOT_FOUND", message: "x" }] }),
      ),
    );
    await expect(actual.fetchGitHubStreakExtended("ghost")).resolves.toBeNull();
    vi.unstubAllGlobals();
  });

  it("throws a 429 GitHubApiError when GitHub reports RATE_LIMITED", async () => {
    const actual = await vi.importActual<typeof import("@/lib/github")>("@/lib/github");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ errors: [{ type: "RATE_LIMITED", message: "slow down" }] }),
      ),
    );
    await expect(actual.fetchGitHubStreakExtended("a")).rejects.toMatchObject({ status: 429 });
    vi.unstubAllGlobals();
  });

  it("maps GraphQL profile fields to the public profile shape", async () => {
    const actual = await vi.importActual<typeof import("@/lib/github")>("@/lib/github");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          data: {
            user: {
              login: "octocat",
              databaseId: 583231,
              avatarUrl: "https://avatars.githubusercontent.com/u/583231",
              name: "The Octocat",
              bio: null,
              followers: { totalCount: 10 },
              following: { totalCount: 1 },
              repositories: { totalCount: 8 },
              createdAt: "2011-01-25T18:44:36Z",
              twitterUsername: null,
              websiteUrl: "https://github.blog",
              company: "@github",
              location: "San Francisco",
              url: "https://github.com/octocat",
            },
          },
        }),
      ),
    );
    await expect(actual.fetchGitHubUserProfile("octocat")).resolves.toMatchObject({
      login: "octocat",
      id: 583231,
      email: null,
      publicRepos: 8,
      blog: "https://github.blog",
      htmlUrl: "https://github.com/octocat",
    });
    vi.unstubAllGlobals();
  });
});
