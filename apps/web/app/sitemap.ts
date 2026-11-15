import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/** The public pages. Sign-in, /device and checkout are steps, not pages to find. */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (
    path: string,
    priority: number,
    changeFrequency: "weekly" | "yearly"
  ) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  });
  return [
    page("", 1, "weekly"),
    page("/contact", 0.5, "yearly"),
    page("/privacy", 0.3, "yearly"),
    page("/terms", 0.3, "yearly"),
    page("/refund", 0.3, "yearly"),
  ];
}
