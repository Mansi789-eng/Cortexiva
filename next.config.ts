import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Domain configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kslmvvpppaiiudtmnrnw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
