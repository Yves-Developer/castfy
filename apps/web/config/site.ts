export const siteConfig = {
  name: "Castfy",
  /** The apex domain: www.castfy.app redirects here. */
  url: "https://castfy.app",
  /** Kept reachable for existing users; deliberately not linked from the site. */
  appUrl: "https://dashboard.castfy.app",
  waitlistUrl: "https://waitlist.castfy.app",
  ogImage: "https://castfy.app/opengraph-image.png",
  /** About 150 characters: search results cut longer ones off. */
  description:
    "Turn a URL into a narrated product demo video. Your coding agent clicks through your app on your own machine, so localhost, staging and logins all work.",
  /** Where the desktop app is published (see .github/workflows/desktop-release.yml). */
  releasesUrl: "https://github.com/Yves-Developer/castfy/releases",
  latestReleaseApi:
    "https://api.github.com/repos/Yves-Developer/castfy/releases/latest",
  /** The beta testers' Discord, the same invite the desktop app links to. */
  discordUrl: "https://discord.gg/PY8RGrex3V",
  links: {
    x: "https://x.com/YvesDC0",
    youtube: "https://www.youtube.com/@Castfy0",
    github: "https://github.com/CastfyRw",
  },
  keywords: [
    "Castfy",
    "product demo video",
    "AI demo video maker",
    "Claude Code demo",
    "screen recording automation",
    "narrated product demo",
    "demo automation",
    "local demo recorder",
    "localhost demo",
    "desktop app",
    "MCP",
    "coding agent",
  ],
};

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#000000",
};
