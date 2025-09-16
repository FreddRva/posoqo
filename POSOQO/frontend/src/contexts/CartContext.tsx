"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';

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
  addToCart: (product: Omit<CartItem, 'quantity'>) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar carrito desde el backend
  const loadCart = useCallback(async () => {
    if (!session?.accessToken) {
      // Si no hay sesión, cargar desde localStorage
      const stored = localStorage.getItem("cart");
      const localCart = stored ? JSON.parse(stored) : [];
      setCart(localCart);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFetch<{ items: { product_id: string; quantity: number }[] }>('/protected/cart', {
        authToken: session.accessToken,
      });

      if (response.items?.length > 0) {
        // Obtener detalles de los productos
        const itemsWithDetails = await Promise.all(
          response.items.map(async (item) => {
            try {
              const productRes = await apiFetch<any>(`/products/${item.product_id}`);
              let imageUrl = "";
              if (productRes.image_url) {
                imageUrl = productRes.image_url.startsWith('http')
                  ? productRes.image_url
                  : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000'}${productRes.image_url}`;
              }
              return {
                id: item.product_id,
                name: productRes.name || "Producto",
                price: productRes.price || 0,
                image_url: imageUrl,
                quantity: item.quantity,
              };
            } catch (prodError) {
              console.error(`Error fetching product ${item.product_id}:`, prodError);
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
        setCart(itemsWithDetails);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Error al cargar carrito del backend:", err);
      setError("Error al cargar carrito");
      // Fallback a localStorage
      const stored = localStorage.getItem("cart");
      const localCart = stored ? JSON.parse(stored) : [];
      setCart(localCart);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  // Agregar producto al carrito
  const addToCart = useCallback(async (product: Omit<CartItem, 'quantity'>) => {
    const newItem: CartItem = {
      ...product,
      quantity: 1,
    };

    // Actualizar estado local inmediatamente
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      let updatedCart;
      
      if (existingItem) {
        updatedCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...prevCart, newItem];
      }
      
      // Actualizar localStorage con el carrito actualizado
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      
      return updatedCart;
    });

    // Sincronizar con backend si está autenticado (temporalmente deshabilitado)
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
      } catch (err) {
        console.log('Backend de carrito no disponible, usando localStorage:', err instanceof Error ? err.message : String(err));
        // El carrito ya se actualizó localmente, no necesitamos recargar
      }
    }

    // Disparar evento para actualizar contador en navbar
    window.dispatchEvent(new Event("cartUpdated"));
  }, [session?.accessToken]);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback(async (productId: string, newQuantity: number) => {
    const quantity = Math.max(1, newQuantity);
    
    // Actualizar estado local
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });

    // Sincronizar con backend si está autenticado
    if (session?.accessToken) {
      try {
        const updatedCart = cart.map(item => 
          item.id === productId ? { ...item, quantity } : item
        );
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
        console.log('Backend de carrito no disponible, usando localStorage:', err instanceof Error ? err.message : String(err));
      }
    }

    // Disparar evento para actualizar contador en navbar
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart, session?.accessToken]);

  // Remover producto del carrito
  const removeFromCart = useCallback(async (productId: string) => {
    // Actualizar estado local
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.id !== productId);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });

    // Sincronizar con backend si está autenticado
    if (session?.accessToken) {
      try {
        const updatedCart = cart.filter(item => item.id !== productId);
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
        console.log('Backend de carrito no disponible, usando localStorage:', err instanceof Error ? err.message : String(err));
      }
    }

    // Disparar evento para actualizar contador en navbar
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart, session?.accessToken]);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("cart");
    
    // Disparar evento para actualizar contador en navbar
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  // Calcular total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calcular cantidad total de items
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  

  // Cargar carrito al montar el componente
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        total,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loadCart,
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
