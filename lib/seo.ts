import type { Metadata } from "next";

/**
 * Per-page title, description, canonical and social tags. A page's `openGraph`
 * replaces the root layout's, so the shared fields are repeated here.
 */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "GitHub Streak Stats",
      url: path,
      title,
      description,
      images: "/opengraph-image",
    },
    twitter: { card: "summary_large_image", title, description, images: "/opengraph-image" },
  };
}
