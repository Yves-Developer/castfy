import { NextResponse } from "next/server";

/**
 * Serves the desktop app's update files (apps/desktop/updater.js) from the
 * GitHub releases:
 *
 * - latest.yml (Windows) and latest-mac.yml (macOS) come from the newest
 *   release of the channel: the latest published release, or for test builds
 *   the newest published pre-release. They name the version and its files.
 * - Any other file, an installer, a zip or a .blockmap, is sent on to that
 *   file in the release its name belongs to: Castfy-0.1.0-beta.24-mac-arm64.zip
 *   is in desktop-v0.1.0-beta.24. Older releases are found that way too: the
 *   updater compares the new file with the installed one's .blockmap to
 *   download only what changed.
 *
 * A release still in draft on GitHub is never served, so nothing reaches
 * anyone until it is published. Moving where releases live means changing
 * only this file.
 */
const REPO = "https://api.github.com/repos/Yves-Developer/castfy";
const UPDATE_FILES = new Set(["latest.yml", "latest-mac.yml"]);
/** Castfy-<version>-<os>-<arch>.<ext>, as artifactName in electron-builder.yml writes it. */
const ARTIFACT =
  /^Castfy-(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)-(?:mac|win|linux)-/;
/** How long the site and the apps keep an answer. */
const CACHE_SECONDS = 300;

interface Release {
  assets: { name: string; browser_download_url: string }[];
  draft: boolean;
  prerelease: boolean;
  tag_name: string;
}

async function github<T>(path: string): Promise<T | null> {
  const response = await fetch(`${REPO}/${path}`, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate: CACHE_SECONDS },
  });
  return response.ok ? ((await response.json()) as T) : null;
}

/** The newest release of a channel. */
async function newest(channel: "stable" | "rc") {
  if (channel === "stable") {
    return github<Release>("releases/latest");
  }
  const releases = await github<Release[]>("releases?per_page=20");
  return releases?.find((r) => r.prerelease && !r.draft) ?? null;
}

export async function updateFile(file: string, channel: "stable" | "rc") {
  const notFound = () => new NextResponse("Not found", { status: 404 });

  if (UPDATE_FILES.has(file)) {
    const release = await newest(channel);
    const asset = release?.assets.find((a) => a.name === file);
    if (!asset) {
      return notFound();
    }
    const yml = await fetch(asset.browser_download_url, {
      next: { revalidate: CACHE_SECONDS },
    });
    if (!yml.ok) {
      return notFound();
    }
    return new NextResponse(await yml.text(), {
      headers: {
        "Content-Type": "text/yaml; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
      },
    });
  }

  const version = ARTIFACT.exec(file)?.[1];
  if (!version) {
    return notFound();
  }
  const tagged = await github<Release>(`releases/tags/desktop-v${version}`);
  const asset = tagged?.assets.find((a) => a.name === file);
  return asset ? NextResponse.redirect(asset.browser_download_url) : notFound();
}
