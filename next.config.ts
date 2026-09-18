import type { NextConfig } from "next";

// On Netlify the official runtime plugin handles the output itself;
// "standalone" is only for self-hosted servers (bun .next/standalone/server.js).
const isNetlify = process.env.NETLIFY === "true";

const nextConfig: NextConfig = {
  ...(isNetlify ? {} : { output: "standalone" as const }),
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
