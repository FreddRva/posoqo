// Configuración de seguridad para POSOQO
export const SECURITY_CONFIG = {
  // Configuración de CSP (Content Security Policy)
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'img-src': [
      "'self'",
      "data:",
      "https://res.cloudinary.com",
      "https://posoqo-backend.onrender.com",
      "https://lh3.googleusercontent.com"
    ],
    'connect-src': [
      "'self'",
      "https://posoqo-backend.onrender.com",
      "https://api.stripe.com"
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  
  // Configuración de validación de entrada
  VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_EMAIL_LENGTH: 254,
    MAX_PASSWORD_LENGTH: 128,
    MIN_PASSWORD_LENGTH: 8,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },
  
  // Configuración de rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MINUTE: 60,
    MAX_REQUESTS_PER_HOUR: 1000,
  },
  
  // Configuración de tokens
  TOKEN: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 horas
    REFRESH_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 días
  },
};

// Función para sanitizar strings
export const sanitizeString = (input: string, maxLength: number = SECURITY_CONFIG.VALIDATION.MAX_STRING_LENGTH): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+=/gi, ''); // Remover event handlers
};

// Función para validar email
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return email.length <= SECURITY_CONFIG.VALIDATION.MAX_EMAIL_LENGTH && emailRegex.test(email);
};

// Función para validar password
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Contraseña requerida' };
  }
  
  if (password.length < SECURITY_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH) {
    return { valid: false, message: `La contraseña debe tener al menos ${SECURITY_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} caracteres` };
  }
  
  if (password.length > SECURITY_CONFIG.VALIDATION.MAX_PASSWORD_LENGTH) {
    return { valid: false, message: `La contraseña no puede tener más de ${SECURITY_CONFIG.VALIDATION.MAX_PASSWORD_LENGTH} caracteres` };
  }
  
  // Verificar que tenga al menos una letra y un número
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'La contraseña debe contener al menos una letra y un número' };
  }
  
  return { valid: true };
};

// Función para validar archivos
export const validateFile = (file: File): { valid: boolean; message?: string } => {
  if (!file) {
    return { valid: false, message: 'Archivo requerido' };
  }
  
  if (file.size > SECURITY_CONFIG.VALIDATION.MAX_FILE_SIZE) {
    return { valid: false, message: 'El archivo es demasiado grande' };
  }
  
  if (!SECURITY_CONFIG.VALIDATION.ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, message: 'Tipo de archivo no permitido' };
  }
  
  return { valid: true };
};

// Función para generar CSP header
export const generateCSPHeader = (): string => {
  return Object.entries(SECURITY_CONFIG.CSP)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};
