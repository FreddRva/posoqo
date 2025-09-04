import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

export interface CartItem {
  id: string;
  name?: string;
  price?: number;
  image_url?: string;
  quantity: number;
}

export function mergeCarts(localCart: CartItem[], backendCart: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  
  // Primero agregar items del backend (tienen prioridad)
  backendCart.forEach(item => {
    if (!item.id) return;
    map.set(item.id, { ...item });
  });
  
  // Luego agregar items del localStorage, sumando cantidades si ya existen
  localCart.forEach(item => {
    if (!item.id) return;
    if (map.has(item.id)) {
      const existing = map.get(item.id)!;
      map.set(item.id, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      map.set(item.id, { ...item });
    }
  });
  
  return Array.from(map.values());
}

export function useCartSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;

    const syncCart = async () => {
      try {
        // Obtener carrito del backend
        const res = await apiFetch<{ items: {product_id: string; quantity: number}[] }>("/cart", {
          authToken: session.accessToken,
        });
        
        const backendCart = res.items || [];
        
        // Convertir formato del backend al formato del frontend
        const backendItemsFormatted = backendCart.map(item => ({
          id: item.product_id,
          quantity: item.quantity,
          name: "", // Se llenará cuando se necesite
          price: 0, // Se llenará cuando se necesite
          image_url: "", // Se llenará cuando se necesite
        }));
        
        // Obtener carrito local
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        
        // Fusionar carritos (backend tiene prioridad)
        const merged = mergeCarts(localCart, backendItemsFormatted);
        
        // Solo actualizar localStorage si hay diferencias
        const currentLocal = JSON.parse(localStorage.getItem("cart") || "[]");
        const currentLocalIds = new Set(currentLocal.map((item: any) => item.id));
        const mergedIds = new Set(merged.map(item => item.id));
        
        const hasChanges = merged.length !== currentLocal.length || 
          merged.some(item => !currentLocalIds.has(item.id)) ||
          currentLocal.some((item: any) => !mergedIds.has(item.id));
        
        if (hasChanges) {
          // Guardar en localStorage
          localStorage.setItem("cart", JSON.stringify(merged));
          
          // Sincronizar con backend solo si hay items
          if (merged.length > 0) {
            await apiFetch("/cart", {
              method: "POST",
              body: JSON.stringify({ 
                items: merged.map(i => ({ 
                  product_id: i.id, 
                  quantity: i.quantity 
                })) 
              }),
              authToken: session.accessToken,
            });
          }
          
          // Disparar evento para actualizar contador
          window.dispatchEvent(new Event("cartUpdated"));
        }
        
      } catch (error) {
        console.error("Error syncing cart:", error);
      }
    };

    syncCart();
  }, [status, session]);
} 