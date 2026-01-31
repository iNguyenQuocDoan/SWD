import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: In production on Vercel, API routes are handled by vercel.json routing
  // Only use rewrites for local development
  async rewrites() {
    // Only apply rewrites in development
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination:
            process.env.NEXT_PUBLIC_API_URL ||
            process.env.API_URL ||
            "http://localhost:3001/api/:path*",
        },
      ];
    }
    // In production, Vercel routing handles /api/* -> backend serverless function
    return [];
  },
};

export default nextConfig;
