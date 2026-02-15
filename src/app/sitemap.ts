import type { MetadataRoute } from "next";

const baseUrl = "https://sastify.com";
const defaultPriority = 0.8;

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "ar"];

  // Base pages
  const basePages: MetadataRoute.Sitemap = locales.flatMap((locale) => {
    const routes: MetadataRoute.Sitemap = [
      {
        url: locale === "en" ? `${baseUrl}` : `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: locale === "en" ? `${baseUrl}/waiting-list` : `${baseUrl}/${locale}/waiting-list`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
    ];
    return routes;
  });

  return basePages;
}
