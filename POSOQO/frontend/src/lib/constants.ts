// lib/constants.ts
export const APP_CONFIG = {
  name: 'POSOQO',
  description: 'Cervecería Artesanal',
  version: '1.0.0',
  author: 'POSOQO Team'
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  PROFILE: '/profile',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_DETAIL: (id: string) => `/admin/products/${id}`,
  
  // Categories
  CATEGORIES: '/categories',
  ADMIN_CATEGORIES: '/admin/categories',
  
  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  
  // Cart
  CART: '/cart',
  
  // Payments
  CREATE_PAYMENT_INTENT: '/create-payment-intent',
  
  // Upload
  UPLOAD: '/upload'
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  FAVORITES: '/favorites',
  CONTACT: '/contacto',
  ABOUT: '/sobre-nosotros',
  TERMS: '/terminos',
  PRIVACY: '/privacidad',
  DASHBOARD: '/dashboard',
  DASHBOARD_PRODUCTS: '/dashboard/products',
  DASHBOARD_ORDERS: '/dashboard/orders',
  DASHBOARD_USERS: '/dashboard/users',
  DASHBOARD_REPORTS: '/dashboard/reports'
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[\d\s\-\(\)]+$/,
  DNI: /^\d{8}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  DESCRIPTION_MIN_LENGTH: 10
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1
} as const;

export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft'
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;
