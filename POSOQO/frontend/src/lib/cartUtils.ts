/**
 * Utilidades para el manejo del carrito de compras
 * Proporciona funciones para sincronización, validación y persistencia
 */

import { CartItem } from '@/contexts/CartContext';
import { getImageUrl } from './config';
import { handleError } from './errorHandler';

export interface CartSyncResult {
  success: boolean;
  syncedItems: CartItem[];
  conflicts: CartConflict[];
  needsUserDecision: boolean;
}

export interface CartConflict {
  item: CartItem;
  localQuantity: number;
  serverQuantity: number;
  resolution: 'local' | 'server' | 'merge' | 'pending';
}

export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida un item del carrito
 */
export const validateCartItem = (item: CartItem): CartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones básicas
  if (!item.id) {
    errors.push('El producto debe tener un ID válido');
  }

  if (!item.name || item.name.trim() === '') {
    errors.push('El producto debe tener un nombre');
  }

  if (typeof item.price !== 'number' || item.price < 0) {
    errors.push('El precio debe ser un número válido mayor o igual a 0');
  }

  if (typeof item.quantity !== 'number' || item.quantity < 1) {
    errors.push('La cantidad debe ser un número mayor a 0');
  }

  if (item.quantity > 100) {
    warnings.push('La cantidad es muy alta, verifica que sea correcta');
  }

  // Validar URL de imagen
  if (item.image_url && !isValidImageUrl(item.image_url)) {
    warnings.push('La URL de la imagen podría no ser válida');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Valida todo el carrito
 */
export const validateCart = (cart: CartItem[]): CartValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  cart.forEach((item, index) => {
    const validation = validateCartItem(item);
    validation.errors.forEach(error => {
      allErrors.push(`Item ${index + 1}: ${error}`);
    });
    validation.warnings.forEach(warning => {
      allWarnings.push(`Item ${index + 1}: ${warning}`);
    });
  });

  // Verificar duplicados
  const itemIds = cart.map(item => item.id);
  const uniqueIds = new Set(itemIds);
  if (itemIds.length !== uniqueIds.size) {
    allErrors.push('Hay productos duplicados en el carrito');
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

/**
 * Normaliza un item del carrito
 */
export const normalizeCartItem = (item: Partial<CartItem>): CartItem => {
  return {
    id: item.id || '',
    name: item.name || 'Producto sin nombre',
    price: typeof item.price === 'number' ? item.price : 0,
    image_url: getImageUrl(item.image_url),
    quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
  };
};

/**
 * Normaliza todo el carrito
 */
export const normalizeCart = (cart: Partial<CartItem>[]): CartItem[] => {
  return cart
    .map(normalizeCartItem)
    .filter(item => item.id && item.name); // Filtrar items inválidos
};

/**
 * Calcula el total del carrito
 */
export const calculateCartTotal = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

/**
 * Calcula la cantidad total de items
 */
export const calculateCartItemCount = (cart: CartItem[]): number => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};

/**
 * Encuentra un item en el carrito por ID
 */
export const findCartItem = (cart: CartItem[], productId: string): CartItem | undefined => {
  return cart.find(item => item.id === productId);
};

/**
 * Agrega o actualiza un item en el carrito
 */
export const addOrUpdateCartItem = (
  cart: CartItem[], 
  newItem: Omit<CartItem, 'quantity'>, 
  quantity: number = 1
): CartItem[] => {
  const existingItem = findCartItem(cart, newItem.id);
  
  if (existingItem) {
    return cart.map(item =>
      item.id === newItem.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    return [...cart, { ...newItem, quantity }];
  }
};

/**
 * Actualiza la cantidad de un item
 */
export const updateCartItemQuantity = (
  cart: CartItem[], 
  productId: string, 
  quantity: number
): CartItem[] => {
  if (quantity <= 0) {
    return cart.filter(item => item.id !== productId);
  }
  
  return cart.map(item =>
    item.id === productId ? { ...item, quantity } : item
  );
};

/**
 * Remueve un item del carrito
 */
export const removeCartItem = (cart: CartItem[], productId: string): CartItem[] => {
  return cart.filter(item => item.id !== productId);
};

/**
 * Limpia el carrito
 */
export const clearCart = (): CartItem[] => {
  return [];
};

/**
 * Sincroniza el carrito local con el servidor
 */
export const syncCartWithServer = async (
  localCart: CartItem[],
  serverCart: { product_id: string; quantity: number }[],
  onConflict?: (conflicts: CartConflict[]) => Promise<CartConflict[]>
): Promise<CartSyncResult> => {
  try {
    const conflicts: CartConflict[] = [];
    const syncedItems: CartItem[] = [];

    // Convertir carrito del servidor a formato local
    const serverItems = serverCart.map(item => ({
      id: item.product_id,
      name: '', // Se llenará después
      price: 0, // Se llenará después
      image_url: '',
      quantity: item.quantity,
    }));

    // Encontrar conflictos
    localCart.forEach(localItem => {
      const serverItem = serverItems.find(s => s.id === localItem.id);
      
      if (serverItem && serverItem.quantity !== localItem.quantity) {
        conflicts.push({
          item: localItem,
          localQuantity: localItem.quantity,
          serverQuantity: serverItem.quantity,
          resolution: 'pending',
        });
      }
    });

    // Si hay conflictos y hay un handler, resolverlos
    if (conflicts.length > 0 && onConflict) {
      const resolvedConflicts = await onConflict(conflicts);
      
      // Aplicar resoluciones
      resolvedConflicts.forEach(conflict => {
        const item = localCart.find(i => i.id === conflict.item.id);
        if (item) {
          switch (conflict.resolution) {
            case 'local':
              syncedItems.push(item);
              break;
            case 'server':
              syncedItems.push({
                ...item,
                quantity: conflict.serverQuantity,
              });
              break;
            case 'merge':
              syncedItems.push({
                ...item,
                quantity: Math.max(conflict.localQuantity, conflict.serverQuantity),
              });
              break;
            default:
              syncedItems.push(item);
          }
        }
      });
    } else if (conflicts.length === 0) {
      // No hay conflictos, usar carrito local
      syncedItems.push(...localCart);
    }

    return {
      success: true,
      syncedItems,
      conflicts,
      needsUserDecision: conflicts.length > 0 && !onConflict,
    };
  } catch (error) {
    handleError(error, 'syncCartWithServer', {
      showNotification: true,
      logToConsole: true,
    });
    
    return {
      success: false,
      syncedItems: localCart, // Fallback al carrito local
      conflicts: [],
      needsUserDecision: false,
    };
  }
};

/**
 * Persiste el carrito en localStorage
 */
export const persistCartToLocalStorage = (cart: CartItem[]): void => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    handleError(error, 'persistCartToLocalStorage', {
      showNotification: false,
      logToConsole: true,
    });
  }
};

/**
 * Carga el carrito desde localStorage
 */
export const loadCartFromLocalStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem('cart');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return normalizeCart(parsed);
  } catch (error) {
    handleError(error, 'loadCartFromLocalStorage', {
      showNotification: false,
      logToConsole: true,
    });
    return [];
  }
};

/**
 * Valida si una URL de imagen es válida
 */
const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith('/') || url.startsWith('./');
  }
};

/**
 * Genera un resumen del carrito
 */
export const generateCartSummary = (cart: CartItem[]) => {
  const total = calculateCartTotal(cart);
  const itemCount = calculateCartItemCount(cart);
  const uniqueItems = cart.length;
  
  return {
    total,
    itemCount,
    uniqueItems,
    isEmpty: cart.length === 0,
    hasItems: cart.length > 0,
  };
};

export default {
  validateCartItem,
  validateCart,
  normalizeCartItem,
  normalizeCart,
  calculateCartTotal,
  calculateCartItemCount,
  findCartItem,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  syncCartWithServer,
  persistCartToLocalStorage,
  loadCartFromLocalStorage,
  generateCartSummary,
};