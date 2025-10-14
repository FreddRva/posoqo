"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { getImageUrl } from '@/lib/config';
import { 
  normalizeCart, 
  validateCart as validateCartUtil, 
  calculateCartTotal, 
  calculateCartItemCount,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart as clearCartUtil,
  persistCartToLocalStorage,
  loadCartFromLocalStorage,
  syncCartWithServer,
  generateCartSummary,
  CartSyncResult
} from '@/lib/cartUtils';
import { handleError } from '@/lib/errorHandler';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  total: number;
  itemCount: number;
  uniqueItems: number;
  isEmpty: boolean;
  hasItems: boolean;
  addToCart: (product: Omit<CartItem, 'quantity'>) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  loadCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  validateCart: () => boolean;
  getCartSummary: () => any;
  cleanCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para limpiar carrito de productos no encontrados
  const cleanCartFromNonExistentProducts = useCallback(async (cartItems: CartItem[]) => {
    // Lista de productos problemáticos conocidos que deben eliminarse inmediatamente
    const problematicProducts = [
      'd677b3bd-9c20-42ed-a213-895eca8e4957',
      'c7d2f163-7c5f-4d45-881d-2d8b2d0d04ac'
    ];

    // Filtrar productos problemáticos conocidos primero
    let filteredItems = cartItems.filter(item => !problematicProducts.includes(item.id));
    
    if (filteredItems.length !== cartItems.length) {
      console.log(`🗑️ Eliminados ${cartItems.length - filteredItems.length} productos problemáticos conocidos`);
    }

    if (!session?.accessToken) {
      // Si no hay sesión, limpiar solo localStorage
      const validItems: CartItem[] = [];
      for (const item of filteredItems) {
        try {
          await apiFetch(`/products/${item.id}`);
          validItems.push(item);
        } catch (error: any) {
          if (error?.status === 404) {
            console.warn(`❌ Producto ${item.id} no encontrado, será eliminado del carrito local`);
          } else {
            validItems.push(item);
          }
        }
      }
      return validItems;
    }

    const validItems: CartItem[] = [];
    const itemsToRemove: string[] = [];

    for (const item of filteredItems) {
      try {
        await apiFetch(`/products/${item.id}`);
        validItems.push(item);
      } catch (error: any) {
        if (error?.status === 404) {
          console.warn(`❌ Producto ${item.id} no encontrado, será eliminado del carrito`);
          itemsToRemove.push(item.id);
        } else {
          // Para otros errores, mantener el item
          validItems.push(item);
        }
      }
    }

    // Si hay items para remover, actualizar el backend
    if (itemsToRemove.length > 0) {
      try {
        await apiFetch('/protected/cart', {
          method: 'POST',
          authToken: session.accessToken,
          body: JSON.stringify({
            items: validItems.map(item => ({
              product_id: item.id,
              quantity: item.quantity,
            })),
          }),
        });
        console.log(`✅ Carrito limpiado: ${itemsToRemove.length} productos eliminados del backend`);
      } catch (cleanupError) {
        console.warn('⚠️ Error limpiando carrito en backend:', cleanupError);
      }
    }

    return validItems;
  }, [session?.accessToken]);

  // Cargar carrito desde el backend
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar carrito local primero
      const localCart = loadCartFromLocalStorage();
      
      // Limpiar productos no encontrados del localStorage también
      const cleanedLocalCart = await cleanCartFromNonExistentProducts(localCart);
      setCart(cleanedLocalCart);
      
      // Persistir el carrito limpio en localStorage
      persistCartToLocalStorage(cleanedLocalCart);

      if (!session?.accessToken) {
        // Si no hay sesión, usar solo localStorage
        return;
      }

      // Cargar carrito del servidor
      const response = await apiFetch<{ items: { product_id: string; quantity: number }[] }>('/protected/cart', {
        authToken: session.accessToken,
      });

      if (response.items?.length > 0) {
        // Obtener detalles de los productos
        const itemsWithDetails = await Promise.all(
          response.items.map(async (item) => {
            try {
              const productRes = await apiFetch<any>(`/products/${item.product_id}`);
              return {
                id: item.product_id,
                name: productRes.name || "Producto",
                price: productRes.price || 0,
                image_url: getImageUrl(productRes.image_url),
                quantity: item.quantity,
              };
            } catch (prodError: any) {
              handleError(prodError, `Error fetching product ${item.product_id}`, {
                showNotification: false,
                logToConsole: true,
              });
              return {
                id: item.product_id,
                name: "Producto no disponible",
                price: 0,
                image_url: "/file.svg",
                quantity: item.quantity,
              };
            }
          })
        );

        // Limpiar productos no encontrados
        const cleanedItems = await cleanCartFromNonExistentProducts(itemsWithDetails);

        // Sincronizar carritos
        const syncResult = await syncCartWithServer(localCart, response.items);
        
        if (syncResult.success) {
          setCart(syncResult.syncedItems);
          persistCartToLocalStorage(syncResult.syncedItems);
        } else {
          setCart(cleanedItems);
          persistCartToLocalStorage(cleanedItems);
        }
      } else {
        // Si el backend está vacío, limpiar también el localStorage
        const cleanedLocalCart = await cleanCartFromNonExistentProducts(localCart);
        setCart(cleanedLocalCart);
        persistCartToLocalStorage(cleanedLocalCart);
      }
    } catch (err) {
      handleError(err, 'loadCart', {
        showNotification: false,
        logToConsole: true,
      });
      // Mantener el carrito de localStorage que ya se cargó
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  // Agregar producto al carrito
  const addToCart = useCallback(async (product: Omit<CartItem, 'quantity'>) => {
    try {
      // Normalizar el producto
      const normalizedProduct = normalizeCart([product])[0];
      
      // Actualizar estado local inmediatamente
      setCart(prevCart => {
        const updatedCart = addOrUpdateCartItem(prevCart, normalizedProduct, 1);
        persistCartToLocalStorage(updatedCart);
        return updatedCart;
      });

      // Sincronizar con backend si está autenticado
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
        } catch (err: any) {
          // Si el producto no existe (404), revertir el cambio local
          if (err?.status === 404) {
            console.warn(`Producto ${product.id} no encontrado, revirtiendo cambio local`);
            setCart(prevCart => {
              const revertedCart = removeCartItem(prevCart, product.id);
              persistCartToLocalStorage(revertedCart);
              return revertedCart;
            });
            throw new Error('Producto no encontrado o no disponible');
          }
          
          handleError(err, 'addToCart backend sync', {
            showNotification: false,
            logToConsole: true,
          });
        }
      }

      // Disparar evento para actualizar contador en navbar
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      handleError(err, 'addToCart', {
        showNotification: true,
        logToConsole: true,
      });
    }
  }, [session?.accessToken]);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback(async (productId: string, newQuantity: number) => {
    try {
      const quantity = Math.max(1, newQuantity);
      
      // Actualizar estado local
      setCart(prevCart => {
        const updatedCart = updateCartItemQuantity(prevCart, productId, quantity);
        persistCartToLocalStorage(updatedCart);
        return updatedCart;
      });

      // Sincronizar con backend si está autenticado
      if (session?.accessToken) {
        try {
          const updatedCart = updateCartItemQuantity(cart, productId, quantity);
          await apiFetch('/protected/cart', {
            method: 'POST',
            authToken: session.accessToken,
            body: JSON.stringify({
              items: updatedCart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
              })),
            }),
          });
        } catch (err) {
          handleError(err, 'updateQuantity backend sync', {
            showNotification: false,
            logToConsole: true,
          });
        }
      }

      // Disparar evento para actualizar contador en navbar
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      handleError(err, 'updateQuantity', {
        showNotification: true,
        logToConsole: true,
      });
    }
  }, [cart, session?.accessToken]);

  // Remover producto del carrito
  const removeFromCart = useCallback(async (productId: string) => {
    try {
      // Actualizar estado local
      setCart(prevCart => {
        const updatedCart = removeCartItem(prevCart, productId);
        persistCartToLocalStorage(updatedCart);
        return updatedCart;
      });

      // Sincronizar con backend si está autenticado
      if (session?.accessToken) {
        try {
          const updatedCart = removeCartItem(cart, productId);
          await apiFetch('/protected/cart', {
            method: 'POST',
            authToken: session.accessToken,
            body: JSON.stringify({
              items: updatedCart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
              })),
            }),
          });
        } catch (err) {
          handleError(err, 'removeFromCart backend sync', {
            showNotification: false,
            logToConsole: true,
          });
        }
      }

      // Disparar evento para actualizar contador en navbar
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      handleError(err, 'removeFromCart', {
        showNotification: true,
        logToConsole: true,
      });
    }
  }, [cart, session?.accessToken]);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    try {
      setCart(clearCartUtil());
      persistCartToLocalStorage(clearCartUtil());
      
      // Disparar evento para actualizar contador en navbar
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      handleError(err, 'clearCart', {
        showNotification: true,
        logToConsole: true,
      });
    }
  }, []);

  // Sincronizar carrito
  const syncCart = useCallback(async () => {
    if (!session?.accessToken) return;
    
    try {
      setLoading(true);
      await loadCart();
    } catch (err) {
      handleError(err, 'syncCart', {
        showNotification: true,
        logToConsole: true,
      });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, loadCart]);

  // Validar carrito
  const validateCart = useCallback((): boolean => {
    const validation = validateCartUtil(cart);
    if (!validation.isValid) {
      handleError(new Error(`Carrito inválido: ${validation.errors.join(', ')}`), 'validateCart', {
        showNotification: true,
        logToConsole: true,
      });
    }
    return validation.isValid;
  }, [cart]);

  // Obtener resumen del carrito
  const getCartSummary = useCallback(() => {
    return generateCartSummary(cart);
  }, [cart]);

  // Limpiar carrito de productos no encontrados
  const cleanCart = useCallback(async () => {
    try {
      const cleanedItems = await cleanCartFromNonExistentProducts(cart);
      setCart(cleanedItems);
      persistCartToLocalStorage(cleanedItems);
      console.log('Carrito limpiado manualmente');
    } catch (error) {
      console.error('Error limpiando carrito:', error);
    }
  }, [cart, cleanCartFromNonExistentProducts]);

  // Calcular total
  const total = calculateCartTotal(cart);

  // Calcular cantidad total de items
  const itemCount = calculateCartItemCount(cart);

  // Calcular items únicos
  const uniqueItems = cart.length;

  // Verificar si está vacío
  const isEmpty = cart.length === 0;

  // Verificar si tiene items
  const hasItems = cart.length > 0;
  

  // Cargar carrito al montar el componente
  useEffect(() => {
    // Limpiar productos problemáticos específicos
    const problematicProducts = [
      'd677b3bd-9c20-42ed-a213-895eca8e4957',
      'c7d2f163-7c5f-4d45-881d-2d8b2d0d04ac'
    ];
    
    // Limpiar localStorage de productos problemáticos
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        const cleanedItems = cart.items?.filter((item: any) => 
          !problematicProducts.includes(item.product_id)
        ) || [];
        
        if (cleanedItems.length !== cart.items?.length) {
          console.log('Limpiando productos problemáticos del localStorage...');
          localStorage.setItem('cart', JSON.stringify({
            ...cart,
            items: cleanedItems
          }));
        }
      } catch (error) {
        console.error('Error limpiando localStorage:', error);
      }
    }
    
    loadCart();
  }, [loadCart]);

  // Efecto para limpiar carrito cuando se detecta un error 404
  useEffect(() => {
    const handle404Error = (event: CustomEvent) => {
      const error = event.detail;
      if (error?.status === 404 && error?.url?.includes('/products/')) {
        console.warn('Error 404 detectado, limpiando carrito automáticamente');
        loadCart(); // Recargar y limpiar el carrito
      }
    };

    // Escuchar eventos de error 404
    window.addEventListener('apiError404', handle404Error as EventListener);
    
    return () => {
      window.removeEventListener('apiError404', handle404Error as EventListener);
    };
  }, [loadCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        total,
        itemCount,
        uniqueItems,
        isEmpty,
        hasItems,
        addToCart,
        updateQuantity,
        removeFromCart,
    clearCart,
    loadCart,
    syncCart,
    validateCart,
    getCartSummary,
    cleanCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
