import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

/**
 * /download/mac, /download/mac-intel and /download/windows send the visitor
 * to that file in the latest desktop release on GitHub. The file names carry
 * the version (Castfy-0.1.0-beta.23-mac-arm64.dmg), so the release is looked
 * up rather than linked by name; the answer is cached for ten minutes.
 */
const SUFFIX: Record<string, string> = {
  mac: "-mac-arm64.dmg",
  "mac-intel": "-mac-x64.dmg",
  windows: "-win-x64.exe",
};

interface Release {
  assets: { name: string; browser_download_url: string }[];
  html_url: string;
}

export async function GET(
  _request: Request,
  context: RouteContext<"/download/[platform]">
) {
  const { platform } = await context.params;
  const suffix = SUFFIX[platform];
  const fallback = `${siteConfig.releasesUrl}/latest`;
  if (!suffix) {
    return NextResponse.redirect(fallback);
  }
  try {
    const response = await fetch(siteConfig.latestReleaseApi, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 600 },
    });
    if (!response.ok) {
      return NextResponse.redirect(fallback);
    }
    const release = (await response.json()) as Release;
    const asset = release.assets.find((a) => a.name.endsWith(suffix));
    return NextResponse.redirect(
      asset?.browser_download_url ?? release.html_url
    );
  } catch {
    return NextResponse.redirect(fallback);
  }
}
