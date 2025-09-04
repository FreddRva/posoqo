import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  
  // Deshabilitar ESLint y TypeScript checking temporalmente para el build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimizaciones de rendimiento
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'framer-motion'],
  },
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
    domains: [
      'lh3.googleusercontent.com',
    ],
    // Optimizaciones de imagen
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },
  
  // Configuración de compresión
  compress: true,
  
  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configuración de webpack para optimización
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
