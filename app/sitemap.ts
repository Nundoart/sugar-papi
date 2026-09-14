import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://sugar-papi-mu.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date("2026-09-14T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
