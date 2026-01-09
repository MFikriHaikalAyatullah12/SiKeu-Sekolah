import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  reactCompiler: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Reduce image sizes
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Experimental performance features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'recharts'],
  },
  
  // Empty turbopack config to acknowledge Turbopack usage
  turbopack: {},
};

export default nextConfig;
