import { publishedPosts } from "@/config/blog";
import { siteConfig } from "@/config/site";

/** The blog as an RSS feed. */
export const dynamic = "force-static";

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function GET() {
  const page = `${siteConfig.url}/blog`;
  const items = publishedPosts
    .map(
      (post) => `<item>
<title>${escapeXml(post.title)}</title>
<link>${page}/${post.slug}</link>
<guid isPermaLink="true">${page}/${post.slug}</guid>
<pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate>
<description>${escapeXml(post.description)}</description>
</item>`
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Castfy blog</title>
<link>${page}</link>
<description>How to make product demos people watch.</description>
<language>en</language>
${items}
</channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
