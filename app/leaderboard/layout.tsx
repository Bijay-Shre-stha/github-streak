import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/leaderboard",
  "GitHub Streak Leaderboard Maker",
  "Rank up to 10 GitHub users by current streak, longest streak or total contributions, and share the leaderboard with a link.",
);

export default function LeaderboardLayout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
  return children;
}
