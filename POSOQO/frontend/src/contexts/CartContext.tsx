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
    // TEMPORAL: Limpiar URLs incorrectas del localStorage
    const stored = localStorage.getItem("cart");
    let localCart = [];
    
    if (stored) {
      try {
        const parsedCart = JSON.parse(stored);
        localCart = parsedCart.map((item: CartItem) => ({
          ...item,
          image_url: item.image_url?.includes('localhost:4000')
            ? item.image_url.replace('http://localhost:4000', 'https://posoqo-backend.onrender.com')
            : item.image_url
        }));
        
        // Actualizar localStorage con URLs limpias
        if (JSON.stringify(localCart) !== JSON.stringify(parsedCart)) {
          localStorage.setItem("cart", JSON.stringify(localCart));
          console.log('🧹 [CART] URLs de localhost limpiadas en contexto');
        }
      } catch (error) {
        console.error("Error parsing stored cart:", error);
        localStorage.removeItem("cart");
        localCart = [];
      }
    }
    
    setCart(localCart);

    if (!session?.accessToken) {
      // Si no hay sesión, usar solo localStorage
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
                  : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://posoqo-backend.onrender.com'}${productRes.image_url}`;
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
        // Actualizar localStorage con los datos del backend
        localStorage.setItem("cart", JSON.stringify(itemsWithDetails));
      } else {
        // Si el backend está vacío, mantener localStorage
        console.log('Backend carrito vacío, manteniendo localStorage');
      }
    } catch (err) {
      console.log('Backend de carrito no disponible, usando localStorage:', err instanceof Error ? err.message : String(err));
      // Mantener el carrito de localStorage que ya se cargó
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
