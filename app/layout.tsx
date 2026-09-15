import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./help-agent.css";
import HelpAgent from "./help-agent";
import AnalyticsTracker from "./analytics";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://sugar-papi-mu.vercel.app";
const description =
  "Sugar Papi is a consent-first dating community for ambitious adults seeking meaningful connections, curated discovery, privacy, and mutual opt-in matching.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Sugar Papi | Curated Dating for Meaningful Connections", template: "%s | Sugar Papi" },
  description,
  applicationName: "Sugar Papi",
  keywords: ["Sugar Papi", "premium dating", "curated dating community", "meaningful connections"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: siteUrl, siteName: "Sugar Papi", title: "Sugar Papi | Curated Dating for Meaningful Connections", description, locale: "en_US" },
  twitter: { card: "summary", title: "Sugar Papi | Curated Dating for Meaningful Connections", description },
  category: "dating",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "dark", themeColor: "#09090b" };

const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "Sugar Papi", url: siteUrl, description, inLanguage: "en-US" };

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
