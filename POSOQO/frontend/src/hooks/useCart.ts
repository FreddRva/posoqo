import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export function useCart() {
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
            } catch {
              return {
                id: item.product_id,
                name: "Producto no disponible",
                price: 0,
                image_url: "",
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
      console.error('Error cargando carrito:', err);
      setError('Error cargando carrito');
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
      } catch (err) {
        console.error('Error sincronizando con backend:', err);
        // Recargar carrito desde localStorage si falla el backend
        const stored = localStorage.getItem("cart");
        const localCart = stored ? JSON.parse(stored) : [];
        setCart(localCart);
      }
    }

    // Disparar evento para actualizar contador en navbar
    window.dispatchEvent(new Event("cartUpdated"));
  }, [session?.accessToken]);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback(async (productId: string, newQuantity: number) => {
    const quantity = Math.max(1, newQuantity);
    
    // Actualizar estado local
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );

    // Actualizar localStorage
    const updatedCart = cart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Sincronizar con backend si está autenticado
    if (session?.accessToken) {
      try {
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
        console.error('Error sincronizando cantidad:', err);
      }
    }

    // Disparar evento para actualizar contador en navbar
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart, session?.accessToken]);

  // Remover producto del carrito
  const removeFromCart = useCallback(async (productId: string) => {
    // Actualizar estado local
    setCart(prevCart => prevCart.filter(item => item.id !== productId));

    // Actualizar localStorage
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Sincronizar con backend si está autenticado
    if (session?.accessToken) {
      try {
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
        console.error('Error sincronizando eliminación:', err);
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
  
  // Debug: Log para verificar itemCount
  console.log('🛒 [useCart] itemCount:', itemCount, 'cart:', cart);

  // Cargar carrito al montar el componente
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return {
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
  };
}
