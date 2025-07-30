import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/estoque",
  assetPrefix: "/estoque/",
  images: {
    unoptimized: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;
