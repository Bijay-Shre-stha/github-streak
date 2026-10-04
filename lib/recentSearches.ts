// Recently viewed usernames, kept only in this browser's localStorage.

const KEY = "streak-recent";
const MAX = 6;

/** Most recent first, case-insensitive de-duplication, capped at MAX. */
export function mergeRecent(list: string[], username: string): string[] {
  const lower = username.toLowerCase();
  return [username, ...list.filter((u) => u.toLowerCase() !== lower)].slice(0, MAX);
}

export function loadRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((u): u is string => typeof u === "string").slice(0, MAX)
      : [];
  } catch {
    return [];
  }
}

export function saveRecent(list: string[]): void {
  try {
    if (list.length) window.localStorage.setItem(KEY, JSON.stringify(list));
    else window.localStorage.removeItem(KEY);
  } catch {
    // storage unavailable (private mode, blocked); recent list just won't persist
  }
}
