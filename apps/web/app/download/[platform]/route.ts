import { after, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { recordDownload } from "@/server/download-event";

/**
 * /download/mac, /download/mac-intel and /download/windows send the visitor
 * to that file in the latest desktop release on GitHub. The file names carry
 * the version (Castfy-0.1.0-beta.23-mac-arm64.dmg), so the release is looked
 * up rather than linked by name; the answer is cached for ten minutes.
 *
 * Each download is counted in PostHog after the redirect is sent, so it
 * never slows the download (server/download-event.ts).
 */
const SUFFIX: Record<string, string> = {
  mac: "-mac-arm64.dmg",
  "mac-intel": "-mac-x64.dmg",
  windows: "-win-x64.exe",
};

interface Release {
  assets: { name: string; browser_download_url: string }[];
  html_url: string;
  tag_name: string;
}

export async function GET(
  request: Request,
  context: RouteContext<"/download/[platform]">
) {
  const { platform } = await context.params;
  const suffix = SUFFIX[platform];
  const fallback = `${siteConfig.releasesUrl}/latest`;
  if (!suffix) {
    return NextResponse.redirect(fallback);
  }
  // Where the visitor is sent, and what is recorded: the file when the
  // release could be read, otherwise just the platform (they land on the
  // releases page and pick the file there).
  let target = fallback;
  let download: { platform: string; file?: string; release?: string } = {
    platform,
  };
  try {
    const response = await fetch(siteConfig.latestReleaseApi, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 600 },
    });
    if (response.ok) {
      const release = (await response.json()) as Release;
      const asset = release.assets.find((a) => a.name.endsWith(suffix));
      target = asset?.browser_download_url ?? release.html_url;
      download = { platform, file: asset?.name, release: release.tag_name };
    }
  } catch {
    // GitHub unreachable: the releases page it is.
  }
  after(() => recordDownload(request, download));
  return NextResponse.redirect(target);
}
