import { NextResponse } from "next/server";
import { fetchGitHubStreak } from "@/lib/github";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return new NextResponse("Username is required", { status: 400 });
  }

  try {
    const data = await fetchGitHubStreak(username);
    
    if (!data) {
      return new NextResponse("User not found or has no data", { status: 404 });
    }

    // Modern dark theme colors
    const bg = "#09090b"; // zinc-950
    const border = "#27272a"; // zinc-800
    const textMain = "#fafafa"; // zinc-50
    const textMuted = "#a1a1aa"; // zinc-400
    const accentGreen = "#22c55e"; // green-500
    const accentGold = "#eab308"; // yellow-500

    const svg = `
      <svg width="450" height="180" viewBox="0 0 450 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textMain}; }
          .stat { font: 700 28px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textMain}; }
          .label { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textMuted}; text-transform: uppercase; letter-spacing: 1px; }
          .gold { fill: ${accentGold}; }
          .green { fill: ${accentGreen}; }
        </style>
        
        <rect x="0" y="0" width="450" height="180" rx="10" fill="${bg}" stroke="${border}" stroke-width="1.5" />
        
        <text x="25" y="35" class="title">@${data.username}'s GitHub Streak</text>
        
        <g transform="translate(45, 85)">
          <text x="0" y="0" class="stat" text-anchor="middle">${data.totalContributions}</text>
          <text x="0" y="25" class="label" text-anchor="middle">Total</text>
        </g>
        
        <g transform="translate(225, 85)">
          <text x="0" y="0" class="stat green" text-anchor="middle">${data.currentStreak}</text>
          <text x="0" y="25" class="label" text-anchor="middle">Current Streak</text>
        </g>
        
        <g transform="translate(385, 85)">
          <text x="0" y="0" class="stat gold" text-anchor="middle">${data.longestStreak}</text>
          <text x="0" y="25" class="label" text-anchor="middle">Longest Streak</text>
        </g>
        
        <line x1="25" y1="140" x2="425" y2="140" stroke="${border}" stroke-width="1" />
        <text x="225" y="165" fill="${textMuted}" font-size="11" font-family="'Segoe UI', Ubuntu, Sans-Serif" font-weight="500" text-anchor="middle">
          Joined ${data.joinedYear || 'GitHub'} • Updated today
        </text>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });

  } catch (error) {
    console.error("Image generation error:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
