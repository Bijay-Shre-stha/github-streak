import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Streak Stats | Track Your Coding Journey",
  description: "Generate beautiful, highly accurate contribution streaks and embed them directly into your GitHub README.",
  keywords: [
    "GitHub",
    "Streak",
    "Stats",
    "Contribution",
    "Developer Tools",
    "README",
    "Widget",
  ],
  authors: [{ name: "Bijay Shrestha" }],
  creator: "Bijay Shrestha",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/Bijay-Shre-stha/github-streak",
    title: "GitHub Streak Stats | Track Your Coding Journey",
    description: "Generate beautiful, highly accurate contribution streaks and embed them directly into your GitHub README.",
    siteName: "GitHub Streak Stats",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Streak Stats | Track Your Coding Journey",
    description: "Generate beautiful, highly accurate contribution streaks and embed them directly into your GitHub README.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
