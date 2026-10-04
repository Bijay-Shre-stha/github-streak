import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SITE_URL } from "@/lib/share";

export const metadata: Metadata = {
  title: {
    default: "GitHub Streak Stats | Free Contribution Streak Tracker & README Badge Generator",
    template: "%s | GitHub Streak Stats",
  },
  description: "Track and display your GitHub contribution streak with our free online tool. Generate beautiful badges, compare developers, and embed stats in README files. Perfect for developers and open-source contributors.",
  keywords: [
    "GitHub streak tracker",
    "contribution streak calculator",
    "GitHub README badge generator",
    "developer tools GitHub stats",
    "streak comparison tool",
    "coding streak tracker",
    "GitHub contribution analytics",
    "open source tools",
    "developer tools",
    "GitHub profile stats",
    "open source contribution",
    "GitHub streak stats"
  ],
  authors: [
    { name: "Bijay Shrestha", url: "https://www.bijayshrestha0817.com.np/" },
    { name: "Bijay Shrestha", url: "https://github.com/Bijay-Shre-stha" },
  ],
  creator: "Bijay Shrestha",
  publisher: "Bijay Shrestha",
  generator: "Next.js",
  applicationName: "GitHub Streak Stats",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "GitHub Streak Stats | Free Contribution Streak Tracker",
    description: "Track and display your GitHub contribution streak with our free online tool. Generate beautiful badges, compare developers, and embed stats in README files.",
    siteName: "GitHub Streak Stats",
  },
  twitter: {
    card: "summary",
    title: "GitHub Streak Stats | Free Contribution Streak Tracker",
    description: "Track and display your GitHub contribution streak with our free online tool. Generate beautiful badges, compare developers, and embed stats in README files.",
    creator: "@bijay_stha_0817",
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
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-JC62D61K21`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JC62D61K21');
          `}
        </Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "GitHub Streak Stats",
                description:
                  "Shows a GitHub user's current streak, longest streak and total contributions, and generates a streak card for README files.",
                url: SITE_URL,
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Web Browser",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                creator: {
                  "@type": "Person",
                  name: "Bijay Shrestha",
                  url: "https://www.bijayshrestha0817.com.np/",
                  sameAs: ["https://github.com/Bijay-Shre-stha"],
                },
                featureList: [
                  "Current and longest GitHub contribution streak",
                  "Embeddable SVG streak card for README files",
                  "Compare two GitHub users",
                  "Custom leaderboards shared by link",
                  "Multiple card themes",
                ],
                license: "https://opensource.org/licenses/MIT",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "GitHub Streak Stats",
                url: SITE_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${SITE_URL}/?username={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
