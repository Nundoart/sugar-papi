import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./help-agent.css";
import HelpAgent from "./help-agent";
import AnalyticsTracker from "./analytics";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://sugar-papi-mu.vercel.app";
const description =
  "One at a Time is a focused dating app where members have one active match at a time—so every connection gets a real chance.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "One at a Time | Dating with Focus", template: "%s | One at a Time" },
  description,
  applicationName: "One at a Time",
  keywords: ["One at a Time", "focused dating", "intentional dating", "one active match", "meaningful connections"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: siteUrl, siteName: "One at a Time", title: "One at a Time | Dating with Focus", description, locale: "en_US" },
  twitter: { card: "summary", title: "One at a Time | Dating with Focus", description },
  category: "dating",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "dark", themeColor: "#09090b" };

const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "One at a Time", url: siteUrl, description, inLanguage: "en-US" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsTracker />
        {children}
        <HelpAgent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </body>
    </html>
  );
}
