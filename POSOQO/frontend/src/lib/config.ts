/**
 * Configuración centralizada de la aplicación
 * Maneja URLs, variables de entorno y configuraciones globales
 */

// Configuración de URLs
export const config = {
  // URLs de la API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com/api',
    uploadsUrl: process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://posoqo-backend.onrender.com',
  },
  
  // URLs de la aplicación
  app: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  
  // Configuración de autenticación
  auth: {
    // Tiempo de expiración del token (en segundos)
    tokenExpiry: 3600, // 1 hora
    // Tiempo de expiración del refresh token (en segundos)
    refreshTokenExpiry: 604800, // 7 días
  },
  
  // Configuración de servicios externos
  services: {
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
    cloudinary: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    },
  },
  
  // Configuración del entorno
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
} as const;

// Función para construir URL de imagen de manera consistente
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '/file.svg';
  
  // Si ya es una URL completa (Cloudinary o externa)
  if (imageUrl.startsWith('http')) {
    // Si es Cloudinary, verificar y corregir transformaciones que recorten
    if (imageUrl.includes('cloudinary.com')) {
      // Si tiene transformaciones de recorte (c_fill, c_crop), reemplazarlas con c_limit
      if (imageUrl.includes('c_fill') || imageUrl.includes('c_crop')) {
        // Reemplazar cualquier transformación de recorte con c_limit para preservar proporción completa
        return imageUrl.replace(/c_(fill|crop)/g, 'c_limit');
      }
      // Si no tiene transformaciones de recorte, devolver tal cual
      return imageUrl;
    }
    return imageUrl;
  }
  
  // Si es una ruta local, construir la URL completa usando la configuración
  return `${config.api.uploadsUrl}${imageUrl}`;
};

// Función para construir URL de API de manera consistente
export const getApiUrl = (endpoint: string): string => {
  // Remover barra inicial si existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Construir URL completa
  return `${config.api.baseUrl}/${cleanEndpoint}`;
};

// Función para verificar si una URL es válida
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Función para obtener la URL base de la aplicación
export const getAppBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return config.app.baseUrl;
};

// Configuración de fallbacks para desarrollo
export const getFallbackConfig = () => {
  if (config.environment.isDevelopment) {
    return {
      apiUrl: 'http://localhost:4000/api',
      uploadsUrl: 'http://localhost:4000',
    };
  }
  return {
    apiUrl: config.api.baseUrl,
    uploadsUrl: config.api.uploadsUrl,
  };
};

// Exportar configuración por defecto
export default config;
