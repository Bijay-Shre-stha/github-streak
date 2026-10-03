import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, getJson, rateLimitMessage } from "@/lib/apiClient";

afterEach(() => vi.unstubAllGlobals());

describe("getJson", () => {
  it("returns parsed JSON on success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ ok: 1 })));
    await expect(getJson("/x")).resolves.toEqual({ ok: 1 });
  });

  it("uses the server error message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 })),
    );
    await expect(getJson("/x")).rejects.toMatchObject({
      message: "User not found",
      status: 404,
      code: "NOT_FOUND",
    });
  });

  it("turns a 429 into a Retry-After message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "Retry-After": "30" } }),
      ),
    );
    const err = await getJson("/x").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiRequestError);
    expect((err as ApiRequestError).retryAfter).toBe(30);
    expect((err as ApiRequestError).message).toBe(rateLimitMessage(30));
  });
});

describe("rateLimitMessage", () => {
  it("pluralizes and falls back without a value", () => {
    expect(rateLimitMessage(1)).toContain("1 second.");
    expect(rateLimitMessage(5)).toContain("5 seconds.");
    expect(rateLimitMessage()).toContain("in a minute");
  });
});
