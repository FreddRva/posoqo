// lib/utils/validation.ts
import { VALIDATION_RULES } from '../constants';

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE.test(phone);
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
