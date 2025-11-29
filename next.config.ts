import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Avoid bundling optional prettifier dependency from pino.
    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
