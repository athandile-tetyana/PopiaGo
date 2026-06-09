import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Any existing configuration options you already have */
  experimental: {
    serverActions: {
      allowedOrigins: [
        "silver-spoon-69j9xx6q6jpqh5xqw-3000.app.github.dev",
        "localhost:3000"
      ],
    },
  },
};

export default nextConfig;
