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

export default nextConfig;
