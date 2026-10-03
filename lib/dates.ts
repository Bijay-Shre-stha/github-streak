// All contribution dates are calendar dates ("YYYY-MM-DD") as returned by
// GitHub's contribution calendar. We treat them as UTC dates everywhere so the
// result never depends on the server's or the viewer's local timezone.

/** Today's date in UTC as YYYY-MM-DD. */
export function todayUtc(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Add (or subtract) whole days to a YYYY-MM-DD date, in UTC. */
export function addDaysUtc(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Format a YYYY-MM-DD date as e.g. "Jan 5, 2024" without timezone drift. */
export function formatUtcDate(date: string): string {
  return new Date(`${date.slice(0, 10)}T00:00:00Z`).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
  );
}
