import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@workspace/ui"],
  typedRoutes: true,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    useOffline: true,
  },
};

export default nextConfig;
