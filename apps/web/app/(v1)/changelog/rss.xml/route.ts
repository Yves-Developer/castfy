import { changelog } from "@/config/changelog";
import { siteConfig } from "@/config/site";

/** The changelog as an RSS feed, for readers and for anyone automating on it. */
export const dynamic = "force-static";

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function GET() {
  const page = `${siteConfig.url}/changelog`;
  const items = changelog
    .map((entry) => {
      const body = [
        `<p>${escapeXml(entry.summary)}</p>`,
        "<ul>",
        ...entry.changes.map(
          (c) => `<li><strong>${c.kind}:</strong> ${escapeXml(c.text)}</li>`
        ),
        "</ul>",
      ].join("");
      return `<item>
<title>${escapeXml(`${entry.title} (${entry.version})`)}</title>
<link>${page}#${entry.id}</link>
<guid isPermaLink="false">castfy-${entry.id}</guid>
<pubDate>${new Date(`${entry.date}T12:00:00Z`).toUTCString()}</pubDate>
<description>${escapeXml(body)}</description>
</item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Castfy changelog</title>
<link>${page}</link>
<description>Every Castfy release, as it ships.</description>
<language>en</language>
${items}
</channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
