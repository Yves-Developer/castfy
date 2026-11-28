import type { MetadataRoute } from "next";
import { publishedPosts } from "@/config/blog";
import { demos } from "@/config/demos";
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
    page("/demos", 0.8, "weekly"),
    ...demos.map((d) => page(`/demos/${d.slug}`, 0.6, "yearly")),
    page("/blog", 0.8, "weekly"),
    ...publishedPosts.map((p) => page(`/blog/${p.slug}`, 0.7, "yearly")),
    page("/changelog", 0.7, "weekly"),
    page("/contact", 0.5, "yearly"),
    page("/privacy", 0.3, "yearly"),
    page("/terms", 0.3, "yearly"),
    page("/refund", 0.3, "yearly"),
  ];
}
