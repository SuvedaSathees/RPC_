import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  agentRules: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
  },
  // three / drei ship modern ESM; transpile for consistent bundling
  transpilePackages: ["three"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
