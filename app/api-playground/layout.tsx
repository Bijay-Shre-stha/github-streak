import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/api-playground",
  "GitHub Streak API Playground",
  "Test the GitHub streak JSON and SVG card API endpoints in your browser and copy README embed snippets.",
);

export default function ApiPlaygroundLayout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
  return children;
}
