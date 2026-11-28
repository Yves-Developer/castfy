import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  redirects() {
    return Promise.resolve([
      // An old download page that Google still has. The installers are at
      // /download/<platform>; the homepage picks the right one.
      { source: "/download", destination: "/", permanent: true },
    ]);
  },
  images: {
    qualities: [50, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

/**
 * Blog posts are MDX files in content/blog, loaded by slug from the post
 * page (app/(v1)/blog/[slug]); mdx-components.tsx styles them.
 */
const withMDX = createMDX({
  // Tables, strikethrough and autolinks in posts. Named as a string so
  // Turbopack can load it.
  options: { remarkPlugins: ["remark-gfm"] },
});

export default withMDX(nextConfig);
