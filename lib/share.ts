// URL builders for share links, README embeds and comparison/leaderboard links.
// A fixed site URL (not window.location) keeps server and client markup
// identical and makes copied README snippets point at the real deployment.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://github-streak-bijay-shre-stha.vercel.app"
).replace(/\/+$/, "");

function withTheme(params: URLSearchParams, theme?: string): URLSearchParams {
  if (theme && theme !== "default") params.set("theme", theme);
  return params;
}

function build(path: string, params: URLSearchParams): string {
  const query = params.toString();
  return `${SITE_URL}${path}${query ? `?${query}` : ""}`;
}

/** Shareable profile page, e.g. https://site/torvalds?theme=radical */
export function profileUrl(username: string, theme?: string): string {
  return build(
    `/${encodeURIComponent(username)}`,
    withTheme(new URLSearchParams(), theme),
  );
}

export function streakImageUrl(username: string, theme = "default"): string {
  return build(
    "/api/streak-image",
    new URLSearchParams({ username, theme }),
  );
}

/** README markdown: the card image, linking to the profile page. */
export function readmeMarkdown(username: string, theme = "default"): string {
  return `[![GitHub Streak](${streakImageUrl(username, theme)})](${profileUrl(username, theme)})`;
}

export function compareUrl(userA: string, userB: string, theme?: string): string {
  return build(
    "/",
    withTheme(new URLSearchParams({ mode: "compare", userA, userB }), theme),
  );
}

/** Commas are left unencoded so the link stays readable. */
export function leaderboardUrl(usernames: string[]): string {
  return `${SITE_URL}/leaderboard?users=${usernames.map(encodeURIComponent).join(",")}`;
}

/**
 * Copy text to the clipboard. Falls back to a hidden textarea +
 * execCommand for browsers/contexts without the async Clipboard API
 * (older mobile browsers, non-secure origins). Resolves false on failure.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
