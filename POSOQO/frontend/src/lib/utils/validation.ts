// lib/utils/validation.ts
import { VALIDATION_RULES } from '../constants';

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE.test(phone);
};

/**
 * Valida un número de celular peruano
 * Acepta formatos:
 * - 987654321 (9 dígitos, empieza con 9)
 * - +51 987654321
 * - 51 987654321
 * - 0051 987654321
 * - (51) 987654321
 */
export const validatePeruvianCellphone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || !phone.trim()) {
    return {
      isValid: false,
      error: 'El teléfono es requerido'
    };
  }

  // Limpiar el número: remover espacios, guiones, paréntesis
  const cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');

  // Patrones válidos para celulares peruanos
  // 1. Número directo: 987654321 (9 dígitos, empieza con 9)
  // 2. Con código país: +51987654321 o 51987654321 o 0051987654321
  const patterns = [
    /^9\d{8}$/,                    // 9 dígitos, empieza con 9
    /^\+?51\d{9}$/,                // +51 o 51 seguido de 9 dígitos
    /^0051\d{9}$/,                 // 0051 seguido de 9 dígitos
  ];

  const isValid = patterns.some(pattern => pattern.test(cleaned));

  if (!isValid) {
    // Verificar si tiene caracteres no numéricos permitidos
    if (!/^[\d\+\s\-\(\)]+$/.test(phone)) {
      return {
        isValid: false,
        error: 'El teléfono solo puede contener números y los caracteres: +, -, (, )'
      };
    }

    // Verificar longitud básica
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length < 9) {
      return {
        isValid: false,
        error: 'El número debe tener al menos 9 dígitos'
      };
    }

    if (digitsOnly.length > 12) {
      return {
        isValid: false,
        error: 'El número no puede tener más de 12 dígitos'
      };
    }

    // Verificar si empieza con 9 (sin código de país) o tiene código de país
    if (digitsOnly.length === 9 && !digitsOnly.startsWith('9')) {
      return {
        isValid: false,
        error: 'Los números de celular peruanos deben empezar con 9'
      };
    }

    // Si tiene código de país, verificar que el número completo sea válido
    if (digitsOnly.length > 9) {
      if (!digitsOnly.startsWith('51')) {
        return {
          isValid: false,
          error: 'El código de país debe ser 51 (Perú)'
        };
      }
      const numberPart = digitsOnly.substring(digitsOnly.length - 9);
      if (!numberPart.startsWith('9')) {
        return {
          isValid: false,
          error: 'Los números de celular peruanos deben empezar con 9'
        };
      }
    }

    return {
      isValid: false,
      error: 'Formato de teléfono inválido. Use: 987654321 o +51 987654321'
    };
  }

  return { isValid: true };
};

export const validateDNI = (dni: string): boolean => {
  return VALIDATION_RULES.DNI.test(dni);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`);
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `El nombre debe tener al menos ${VALIDATION_RULES.NAME_MIN_LENGTH} caracteres`
    };
  }
  
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
    return {
      isValid: false,
      error: 'El nombre solo puede contener letras y espacios'
    };
  }
  
  return { isValid: true };
};

export const validateDescription = (description: string): { isValid: boolean; error?: string } => {
  if (description.length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
    return {
      isValid: false,
      error: `La descripción debe tener al menos ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} caracteres`
    };
  }
  
  return { isValid: true };
};

export const validatePrice = (price: number): { isValid: boolean; error?: string } => {
  if (price <= 0) {
    return {
      isValid: false,
      error: 'El precio debe ser mayor a 0'
    };
  }
  
  if (price > 999999.99) {
    return {
      isValid: false,
      error: 'El precio no puede ser mayor a 999,999.99'
    };
  }
  
  return { isValid: true };
};

export const validateStock = (stock: number): { isValid: boolean; error?: string } => {
  if (stock < 0) {
    return {
      isValid: false,
      error: 'El stock no puede ser negativo'
    };
  }
  
  if (stock > 999999) {
    return {
      isValid: false,
      error: 'El stock no puede ser mayor a 999,999'
    };
  }
  
  return { isValid: true };
};

export const validateFile = (file: File, maxSize: number = 10 * 1024 * 1024, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif']): { isValid: boolean; error?: string } => {
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `El archivo no puede ser mayor a ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
    };
  }
  
  return { isValid: true };
};

export const validateForm = (fields: Record<string, any>, rules: Record<string, (value: any) => { isValid: boolean; error?: string }>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  for (const [field, value] of Object.entries(fields)) {
    if (rules[field]) {
      const validation = rules[field](value);
      if (!validation.isValid && validation.error) {
        errors[field] = validation.error;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
