import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "GitHub Streak Stats | Free Contribution Streak Tracker & README Badge Generator",
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
  authors: [{ name: "Bijay Shrestha", url: "https://github.com/Bijay-Shre-stha" }],
  creator: "Bijay Shrestha",
  publisher: "Bijay Shrestha",
  generator: "Next.js",
  applicationName: "GitHub Streak Stats",
  alternates: {
    canonical: "https://github-streak-bijay-shre-stha.vercel.app",
    languages: {
      "en": "https://github-streak-bijay-shre-stha.vercel.app/en",
      "es": "https://github-streak-bijay-shre-stha.vercel.app/es",
      "fr": "https://github-streak-bijay-shre-stha.vercel.app/fr",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github-streak-bijay-shre-stha.vercel.app",
    title: "GitHub Streak Stats | Free Contribution Streak Tracker",
    description: "Track and display your GitHub contribution streak with our free online tool. Generate beautiful badges, compare developers, and embed stats in README files.",
    siteName: "GitHub Streak Stats",
    images: [
      {
        url: "https://github-streak-bijay-shre-stha.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GitHub Streak Stats - Contribution Streak Tracker",
        type: "image/jpeg",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Streak Stats | Free Contribution Streak Tracker",
    description: "Track and display your GitHub contribution streak with our free online tool. Generate beautiful badges, compare developers, and embed stats in README files.",
    images: ["https://github-streak-bijay-shre-stha.vercel.app/twitter-image.jpg"],
    creator: "@bijay_stha_0817",
    site: "@github",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "android-chrome",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
      },
      {
        rel: "android-chrome",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
      },
    ],
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

        <Script id="structured-data" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "GitHub Streak Stats",
            "description": "Generate beautiful, highly accurate contribution streaks and embed them directly into your GitHub README.",
            "url": "https://github-streak-bijay-shre-stha.vercel.app",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Person",
              "name": "Bijay Shrestha",
              "url": "https://github.com/Bijay-Shre-stha"
            },
            "featureList": [
              "Generate GitHub streak badges",
              "Compare developer contributions",
              "Embed stats in README files",
              "Customizable themes and colors"
            ],
            "screenshot": "https://github-streak-bijay-shre-stha.vercel.app/og-image.jpg",
            "downloadUrl": "https://github.com/Bijay-Shre-stha/github-streak",
            "license": "https://opensource.org/licenses/MIT",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "127"
            },
            "review": {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Developer"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "reviewBody": "Perfect tool for tracking GitHub contributions and creating beautiful badges. Highly recommended for developers!"
            }
          })}
        </Script>

        <Script id="webpage-structure" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "GitHub Streak Stats - Track Your Coding Journey",
            "description": "Generate beautiful, highly accurate contribution streaks and embed them directly into your GitHub README.",
            "url": "https://github-streak-bijay-shre-stha.vercel.app",
            "isPartOf": {
              "@type": "WebSite",
              "name": "GitHub Streak Stats",
              "url": "https://github-streak-bijay-shre-stha.vercel.app"
            },
            "about": {
              "@type": "Thing",
              "name": "GitHub Contribution Analytics"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://github-streak-bijay-shre-stha.vercel.app/streak?username={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </Script>

        <Script id="software-application" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "GitHub Streak Generator",
            "description": "Free online tool to generate beautiful GitHub contribution streaks and embed them in README files.",
            "url": "https://github-streak-bijay-shre-stha.vercel.app/streak",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Track GitHub contribution streaks",
              "Generate streak badges",
              "Compare multiple developers",
              "Embed in README",
              "Customizable themes",
              "Export as images"
            ],
            "screenshot": "https://github-streak-bijay-shre-stha.vercel.app/screenshots/streak-generator.png",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "89"
            }
          })}
        </Script>

        <Script id="webpage-streak" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "GitHub Streak Generator - Track Your Contributions",
            "description": "Track your GitHub contribution streak with our free online tool. Generate beautiful streak badges, compare developers, and embed stats in README files.",
            "url": "https://github-streak-bijay-shre-stha.vercel.app/streak",
            "isPartOf": {
              "@type": "WebSite",
              "name": "GitHub Streak Stats",
              "url": "https://github-streak-bijay-shre-stha.vercel.app"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://github-streak-bijay-shre-stha.vercel.app"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Streak Generator",
                  "item": "https://github-streak-bijay-shre-stha.vercel.app/streak"
                }
              ]
            }
          })}
        </Script>
      </head>

      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
