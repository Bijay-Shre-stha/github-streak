import { NextResponse } from "next/server";
import { fetchGitHubStreak } from "@/lib/github";
import { themes } from "@/lib/themes";
import { validateGitHubUsername, validateTheme } from "@/lib/validation";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

export const revalidate = 3600;

const LUCIDE_FLAME_PATH =
  "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4";

const RING_CX = 247.5;
const RING_CY = 79;

const RING_R = 40;
const GAP_DEG = 60;

const FLAME_CX = RING_CX;
const FLAME_CY = RING_CY - RING_R - 2;

function ringArc(cx: number, cy: number, r: number, gapDeg: number): string {
  const half = gapDeg / 2;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const startDeg = -90 + half;
  const endDeg = -90 - half;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  return `M ${x1.toFixed(3)},${y1.toFixed(3)} A ${r},${r} 0 1,1 ${x2.toFixed(3)},${y2.toFixed(3)}`;
}

function flameIcon(
  cx: number,
  cy: number,
  size: number,
  color: string,
): string {
  const scale = size / 24;
  const tx = cx - 12 * scale;
  const ty = cy - 12 * scale;
  return `<g transform="translate(${tx.toFixed(3)}, ${ty.toFixed(3)}) scale(${scale})">
      <path d="${LUCIDE_FLAME_PATH}" fill="${color}" stroke="${color}"
            stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
}

export async function GET(request: Request) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitCheck = checkRateLimit(clientIP);

  if (rateLimitCheck.isLimited) {
    return new NextResponse("Rate limit exceeded", {
      status: 429,
      headers: {
        "Retry-After": Math.ceil(
          (rateLimitCheck.resetTime - Date.now()) / 1000,
        ).toString(),
      },
    });
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const themeName = searchParams.get("theme") || "default";

  if (!username) {
    return new NextResponse("Username is required", { status: 400 });
  }

  const usernameValidation = validateGitHubUsername(username);
  if (!usernameValidation.valid) {
    return new NextResponse(usernameValidation.error, { status: 400 });
  }

  const themeValidation = validateTheme(themeName);
  if (!themeValidation.valid) {
    return new NextResponse(themeValidation.error, { status: 400 });
  }

  try {
    const stats = await fetchGitHubStreak(username);

    if (!stats) {
      return new NextResponse("User not found or has no data", { status: 404 });
    }

    // ── Theme ────────────────────────────────────────────────────────────────
    const theme = themes[themeName];
    const bg = theme.bg;
    const border = theme.border;
    const textMain = theme.title;
    const textMuted = theme.text;
    const accentRing = theme.current; // ring + flame (e.g. pink in radical)
    const accentNum = theme.longest; // streak number (e.g. gold in radical)
    const textTotal = theme.total || textMain;

    // ── Date helpers ─────────────────────────────────────────────────────────
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    const totalDateSpan = stats.totalContributionsStart
      ? `${fmt(stats.totalContributionsStart)} - Present`
      : `${stats.joinedYear ?? ""} - Present`;

    const currentDateSpan =
      stats.currentStreakStart && stats.currentStreakEnd
        ? `${fmt(stats.currentStreakStart)} - ${fmt(stats.currentStreakEnd)}`
        : "Present";

    const longestDateSpan =
      stats.longestStreakStart && stats.longestStreakEnd
        ? `${fmt(stats.longestStreakStart)} - ${fmt(stats.longestStreakEnd)}`
        : "Present";

    // ── Computed SVG elements ─────────────────────────────────────────────────
    const arcD = ringArc(RING_CX, RING_CY, RING_R, GAP_DEG);
    const flame = flameIcon(FLAME_CX, FLAME_CY, 22, accentRing);

    // ── SVG ──────────────────────────────────────────────────────────────────
    const svg = `<svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bg          { fill: ${bg}; }
    .divider     { stroke: ${border}; stroke-width: 1; }
    .ring        { stroke: ${accentRing}; stroke-width: 5; fill: none; stroke-linecap: round; }
    .total-num   { font: 700 28px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textTotal}; }
    .total-label { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textMain}; }
    .cur-num     { font: 700 28px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${accentNum}; }
    .cur-label   { font: 700 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${accentNum}; }
    .long-num    { font: 700 28px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${accentRing}; }
    .long-label  { font: 700 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${accentRing}; }
    .date        { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textMuted}; }
  </style>

  <!-- Background -->
  <rect x="0" y="0" width="495" height="195" rx="4.5" class="bg" stroke="${border}" stroke-width="1"/>

  <!-- Column dividers -->
  <line x1="165" y1="28" x2="165" y2="167" class="divider"/>
  <line x1="330" y1="28" x2="330" y2="167" class="divider"/>

  <!-- ── LEFT: Total Contributions ── -->
  <text x="82.5" y="75"  class="total-num"   text-anchor="middle">${stats.totalContributions.toLocaleString()}</text>
  <text x="82.5" y="111" class="total-label" text-anchor="middle">Total Contributions</text>
  <text x="82.5" y="131" class="date"        text-anchor="middle">${totalDateSpan}</text>

  <!-- ── CENTRE: Current Streak ── -->
  <path d="${arcD}" class="ring"/>
  ${flame}
  <text x="${RING_CX}" y="${RING_CY}" class="cur-num" text-anchor="middle" dominant-baseline="middle">${stats.currentStreak}</text>
  <text x="${RING_CX}" y="135" class="cur-label" text-anchor="middle">Current Streak</text>
  <text x="${RING_CX}" y="153" class="date"       text-anchor="middle">${currentDateSpan}</text>

  <!-- ── RIGHT: Longest Streak ── -->
  <text x="412.5" y="75"  class="long-num"   text-anchor="middle">${stats.longestStreak}</text>
  <text x="412.5" y="111" class="long-label" text-anchor="middle">Longest Streak</text>
  <text x="412.5" y="131" class="date"       text-anchor="middle">${longestDateSpan}</text>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("streak-image error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to generate streak image";
    return new NextResponse(errorMessage, { status: 500 });
  }
}
