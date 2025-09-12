import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
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
  },
  
  // Configuración de compresión
  compress: true,
};

export default nextConfig;
