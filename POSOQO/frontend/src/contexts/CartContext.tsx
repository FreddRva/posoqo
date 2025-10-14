"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import { handleError } from '@/lib/errorHandler';

// ===== TIPOS Y INTERFACES =====
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  category?: string;
  description?: string;
}

export interface CartSummary {
  total: number;
  itemCount: number;
  uniqueItems: number;
  isEmpty: boolean;
  hasItems: boolean;
}

export interface CartContextType {
  // Estado del carrito
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  
  // Resumen calculado
  summary: CartSummary;
  
  // Acciones del carrito
  addToCart: (product: Omit<CartItem, 'quantity'>) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Utilidades
  loadCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  validateCart: () => boolean;
  
  // Notificaciones
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

// ===== CONTEXTO =====
const CartContext = createContext<CartContextType | undefined>(undefined);

// ===== PROVIDER PRINCIPAL =====
export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  
  // ===== ESTADO PRINCIPAL =====
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: string}>>([]);

  // ===== CÁLCULOS DERIVADOS =====
  const summary: CartSummary = {
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    uniqueItems: cart.length,
    isEmpty: cart.length === 0,
    hasItems: cart.length > 0
  };

  // ===== NOTIFICACIONES =====
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // ===== PERSISTENCIA LOCAL =====
  const saveToLocalStorage = useCallback((cartData: CartItem[]) => {
    try {
      localStorage.setItem('posoqo_cart', JSON.stringify(cartData));
    } catch (error) {
      console.warn('Error guardando carrito en localStorage:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback((): CartItem[] => {
    try {
      const data = localStorage.getItem('posoqo_cart');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Error cargando carrito desde localStorage:', error);
      return [];
    }
  }, []);

  // ===== VALIDACIÓN =====
  const validateCart = useCallback((): boolean => {
    if (!Array.isArray(cart)) return false;
    
    for (const item of cart) {
      if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        return false;
      }
      if (item.price < 0 || item.quantity < 1) {
        return false;
      }
    }
    
    return true;
  }, [cart]);

  // ===== CARGAR CARRITO =====
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Limpiar completamente localStorage y sessionStorage
      localStorage.removeItem('posoqo_cart');
      sessionStorage.removeItem('posoqo_cart');
      
      // 2. Inicializar carrito vacío
      setCart([]);

      // 3. Si hay sesión, limpiar backend primero y luego cargar
      if (session?.accessToken) {
        try {
          // Limpiar carrito del backend primero
          await apiFetch('/protected/cart', {
            method: 'POST',
            authToken: session.accessToken,
            body: JSON.stringify({ items: [] }),
          });
          
          // Luego cargar desde backend (debería estar vacío)
          const response = await apiFetch<{ items: { product_id: string; quantity: number }[] }>('/protected/cart', {
            authToken: session.accessToken,
          });

          if (response.items?.length > 0) {
            // Obtener detalles de productos del backend
            const backendItems = await Promise.all(
              response.items.map(async (item) => {
                try {
                  const product = await apiFetch<any>(`/products/${item.product_id}`);
                  return {
                    id: item.product_id,
                    name: product.name || "Producto",
                    price: product.price || 0,
                    image_url: getImageUrl(product.image_url),
                    quantity: item.quantity,
                    category: product.category?.name,
                    description: product.description
                  };
                } catch (error) {
                  console.warn(`Producto ${item.product_id} no encontrado - eliminando del carrito`);
                  return null;
                }
              })
            );

            // Filtrar productos válidos
            const validItems = backendItems.filter(item => item !== null) as CartItem[];
            
            // Usar el carrito del backend si es válido
            if (validItems.length > 0) {
              setCart(validItems);
              saveToLocalStorage(validItems);
            }
          }
        } catch (backendError) {
          console.warn('Error cargando carrito del backend:', backendError);
          // Mantener carrito vacío si hay error en backend
        }
      }

    } catch (error) {
      const errorMessage = 'Error cargando carrito';
      setError(errorMessage);
      handleError(error, 'loadCart', {
        showNotification: true,
        logToConsole: true,
      });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, loadFromLocalStorage, saveToLocalStorage]);

  // ===== AGREGAR AL CARRITO =====
  const addToCart = useCallback(async (product: Omit<CartItem, 'quantity'>) => {
    try {
      setError(null);

      // Validar que el producto existe y tiene stock antes de agregarlo
      try {
        const productData = await apiFetch<any>(`/products/${product.id}`);
        if (productData.stock <= 0) {
          showNotification('El producto no tiene stock disponible', 'error');
          return;
        }
      } catch (validationError: any) {
        if (validationError?.status === 404) {
          console.warn(`Producto ${product.id} no encontrado - no se puede agregar al carrito`);
          showNotification('El producto no está disponible', 'error');
          return;
        }
        // Para otros errores, continuar (puede ser problema de red)
      }

      // Normalizar producto
      const normalizedProduct: CartItem = {
        ...product,
        quantity: 1,
        image_url: product.image_url || '/placeholder-product.jpg'
      };

      // Actualizar estado local
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        
        if (existingItem) {
          // Si ya existe, incrementar cantidad
          const updatedCart = prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          saveToLocalStorage(updatedCart);
          return updatedCart;
        } else {
          // Si no existe, agregar nuevo item
          const updatedCart = [...prevCart, normalizedProduct];
          saveToLocalStorage(updatedCart);
          return updatedCart;
        }
      });

      // Sincronizar con backend si hay sesión
      if (session?.accessToken) {
        try {
          await apiFetch('/protected/cart/add', {
            method: 'POST',
            authToken: session.accessToken,
            body: JSON.stringify({
              product_id: product.id,
              quantity: 1,
            }),
          });
        } catch (backendError) {
          console.warn('Error sincronizando con backend:', backendError);
        }
      }

      // Mostrar notificación
      showNotification(`${product.name} agregado al carrito`, 'success');
      
      // Disparar evento para actualizar UI
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { action: 'add', product } 
      }));

    } catch (error) {
      const errorMessage = 'Error agregando producto al carrito';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      handleError(error, 'addToCart', {
        showNotification: false,
        logToConsole: true,
      });
    }
  }, [session?.accessToken, saveToLocalStorage, showNotification]);

  // ===== ACTUALIZAR CANTIDAD =====
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      setError(null);
      
      const newQuantity = Math.max(1, Math.floor(quantity));

      setCart(prevCart => {
        const updatedCart = prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
        saveToLocalStorage(updatedCart);
        return updatedCart;
      });

      // Sincronizar con backend
      if (session?.accessToken) {
        try {
          await apiFetch('/protected/cart', {
            method: 'POST',
            authToken: session.accessToken,
            body: JSON.stringify({
              items: cart.map(item => ({
                product_id: item.id,
                quantity: item.id === productId ? newQuantity : item.quantity,
              })),
            }),
          });
        } catch (backendError) {
          console.warn('Error sincronizando cantidad con backend:', backendError);
        }
      }

      // Disparar evento
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { action: 'update', productId, quantity: newQuantity } 
      }));

    } catch (error) {
      const errorMessage = 'Error actualizando cantidad';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      handleError(error, 'updateQuantity', {
        showNotification: false,
        logToConsole: true,
      });
    }
  }, [cart, session?.accessToken, saveToLocalStorage, showNotification]);

  // ===== REMOVER DEL CARRITO =====
  const removeFromCart = useCallback(async (productId: string) => {
    try {
      setError(null);

      setCart(prevCart => {
        const updatedCart = prevCart.filter(item => item.id !== productId);
        saveToLocalStorage(updatedCart);
        return updatedCart;
      });

      // Sincronizar con backend
      if (session?.accessToken) {
        try {
          await apiFetch('/protected/cart', {
            method: 'POST',
            authToken: session.accessToken,
            body: JSON.stringify({
              items: cart.filter(item => item.id !== productId).map(item => ({
                product_id: item.id,
                quantity: item.quantity,
              })),
            }),
          });
        } catch (backendError) {
          console.warn('Error sincronizando eliminación con backend:', backendError);
        }
      }

      // Mostrar notificación
      const product = cart.find(item => item.id === productId);
      if (product) {
        showNotification(`${product.name} removido del carrito`, 'info');
      }

      // Disparar evento
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { action: 'remove', productId } 
      }));

    } catch (error) {
      const errorMessage = 'Error removiendo producto del carrito';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      handleError(error, 'removeFromCart', {
        showNotification: false,
        logToConsole: true,
      });
    }
  }, [cart, session?.accessToken, saveToLocalStorage, showNotification]);

  // ===== LIMPIAR CARRITO =====
  const clearCart = useCallback(async () => {
    try {
      setError(null);

      // Limpiar estado local
      setCart([]);
      saveToLocalStorage([]);
      
      // Limpiar localStorage y sessionStorage completamente
      localStorage.removeItem('posoqo_cart');
      sessionStorage.removeItem('posoqo_cart');

      // Sincronizar con backend
      if (session?.accessToken) {
        try {
          await apiFetch('/protected/cart', {
            method: 'POST',
            authToken: session.accessToken,
            body: JSON.stringify({ items: [] }),
          });
        } catch (backendError) {
          console.warn('Error limpiando carrito en backend:', backendError);
        }
      }

      showNotification('Carrito limpiado completamente', 'success');
      
      // Disparar evento
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { action: 'clear' } 
      }));

    } catch (error) {
      const errorMessage = 'Error limpiando carrito';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      handleError(error, 'clearCart', {
        showNotification: false,
        logToConsole: true,
      });
    }
  }, [session?.accessToken, saveToLocalStorage, showNotification]);

  // ===== SINCRONIZAR CARRITO =====
  const syncCart = useCallback(async () => {
    if (!session?.accessToken) return;
    
    try {
      setLoading(true);
      await loadCart();
    } catch (error) {
      handleError(error, 'syncCart', {
        showNotification: true,
        logToConsole: true,
      });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, loadCart]);

  // ===== EFECTOS =====
  useEffect(() => {
    // Cargar carrito normal sin limpieza radical
    loadCart();
  }, [loadCart]);

  // ===== VALOR DEL CONTEXTO =====
  const contextValue: CartContextType = {
    cart,
    loading,
    error,
    summary,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    syncCart,
    validateCart,
    showNotification
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      
      {/* Sistema de notificaciones flotantes */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`
              px-6 py-3 rounded-xl shadow-2xl backdrop-blur-xl border
              transform transition-all duration-500 ease-out
              animate-in slide-in-from-right-full
              ${notification.type === 'success' 
                ? 'bg-green-500/20 border-green-400/50 text-green-100' 
                : notification.type === 'error'
                ? 'bg-red-500/20 border-red-400/50 text-red-100'
                : 'bg-blue-500/20 border-blue-400/50 text-blue-100'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-2 h-2 rounded-full
                ${notification.type === 'success' 
                  ? 'bg-green-400' 
                  : notification.type === 'error'
                  ? 'bg-red-400'
                  : 'bg-blue-400'
                }
              `} />
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
}

// ===== HOOK PERSONALIZADO =====
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
