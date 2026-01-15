import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Providers from "./providers";
import { NavDock } from "@/components/nav-dock";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const domain = "https://x402seo-agent.vercel.app";

export const metadata: Metadata = {
  title: "SEO Gap Analyzer - AI-Powered SEO Analysis",
  description: "Discover your SEO gaps in minutes. Compare your site against top competitors and get actionable insights to improve your search rankings. Powered by Hyperbrowser and AI.",
  keywords: ["SEO", "SEO analysis", "competitor analysis", "keyword research", "SEO gaps", "content optimization", "search engine optimization"],
  authors: [{ name: "SEO Gap Analyzer" }],
  creator: "SEO Gap Analyzer",
  publisher: "SEO Gap Analyzer",
  metadataBase: new URL(domain),
  alternates: {
    canonical: domain,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: domain,
    siteName: "SEO Gap Analyzer",
    title: "SEO Gap Analyzer - AI-Powered SEO Analysis",
    description: "Discover your SEO gaps in minutes. Compare your site against top competitors and get actionable insights to improve your search rankings.",
    images: [
      {
        url: `${domain}/og.png`,
        width: 1200,
        height: 630,
        alt: "SEO Gap Analyzer - AI-Powered SEO Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Gap Analyzer - AI-Powered SEO Analysis",
    description: "Discover your SEO gaps in minutes. Compare your site against top competitors and get actionable insights.",
    images: [`${domain}/og.png`],
    creator: "@seogapanalyzer",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes if needed
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <NavDock />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
