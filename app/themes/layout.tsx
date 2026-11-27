import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/themes",
  "GitHub Streak Card Themes",
  "Preview every GitHub streak card theme with your own stats and copy the README Markdown for the one you like.",
);

export default function ThemesLayout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
  return children;
}
