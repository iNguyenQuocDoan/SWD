import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrite API requests to backend in development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.API_URL ||
          "http://localhost:3001/api/:path*",
      },
    ];
  },
  // Ensure .bin files are served with correct headers
  async headers() {
    return [
      {
        source: "/:path*.bin",
        headers: [
          {
            key: "Content-Type",
            value: "application/octet-stream",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
