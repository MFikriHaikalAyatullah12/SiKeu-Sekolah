import type { NextConfig } from "next";

// Validate required environment variables at build time
// Skip validation if explicitly disabled (e.g., during Vercel build)
if (process.env.SKIP_ENV_VALIDATION !== "1") {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missingEnvVars.join(', ')}`
    );
    console.warn('⚠️  Build may fail if these are required at runtime.');
    console.warn('⚠️  Set SKIP_ENV_VALIDATION=1 to bypass this check.');
  }
}

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
    // Optimize package imports - reduce bundle size significantly
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons', 
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-avatar',
      '@radix-ui/react-tabs',
      'date-fns',
      'sonner',
    ],
  },
  
  // Empty turbopack config to acknowledge Turbopack usage
  turbopack: {},
};

export default nextConfig;
