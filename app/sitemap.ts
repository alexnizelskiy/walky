import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { servicePages } from "@/content/service-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticPaths = [
    "",
    "/o-servise",
    "/contacts",
    ...servicePages.map((s) => `/uslugi/${s.slug}`),
    "/stat-vygulshchikom",
    "/order",
    "/privacy",
    "/requisites",
  ];

  return staticPaths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
