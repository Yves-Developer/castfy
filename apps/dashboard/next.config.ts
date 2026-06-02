import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@workspace/ui"],
  typedRoutes: true,
};

export default nextConfig;
