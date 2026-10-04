// Browser-side fetch helper for our own API routes.

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

/** Human-friendly message for a 429, using the Retry-After value. */
export function rateLimitMessage(retryAfter?: number): string {
  return retryAfter
    ? `Too many requests. Please try again in ${retryAfter} second${retryAfter === 1 ? "" : "s"}.`
    : "Too many requests. Please try again in a minute.";
}

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const body = (data ?? {}) as { error?: string; code?: string; retryAfter?: number };
    const retryAfter =
      Number(res.headers.get("Retry-After")) || body.retryAfter || undefined;
    const message =
      res.status === 429
        ? rateLimitMessage(retryAfter)
        : body.error || `Request failed (${res.status})`;
    throw new ApiRequestError(message, res.status, body.code, retryAfter);
  }
  return data as T;
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}
