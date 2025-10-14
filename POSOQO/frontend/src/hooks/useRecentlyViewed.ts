"use client";
import { useState, useEffect, useCallback } from 'react';

export interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category?: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  // Cargar vistos recientes desde localStorage
  const loadRecentlyViewed = useCallback(() => {
    try {
      const data = localStorage.getItem('posoqo_recently_viewed');
      if (data) {
        const items = JSON.parse(data);
        // Ordenar por fecha de visualización (más recientes primero)
        const sortedItems = items.sort((a: RecentlyViewedItem, b: RecentlyViewedItem) => 
          b.viewedAt - a.viewedAt
        );
        setRecentlyViewed(sortedItems);
      }
    } catch (error) {
      console.warn('Error cargando vistos recientes:', error);
    }
  }, []);

  // Guardar vistos recientes en localStorage
  const saveRecentlyViewed = useCallback((items: RecentlyViewedItem[]) => {
    try {
      localStorage.setItem('posoqo_recently_viewed', JSON.stringify(items));
    } catch (error) {
      console.warn('Error guardando vistos recientes:', error);
    }
  }, []);

  // Agregar producto a vistos recientes
  const addToRecentlyViewed = useCallback((product: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    const newItem: RecentlyViewedItem = {
      ...product,
      viewedAt: Date.now()
    };

    setRecentlyViewed(prevItems => {
      // Filtrar el producto si ya existe
      const filteredItems = prevItems.filter(item => item.id !== product.id);
      // Agregar al inicio y limitar a 10 items
      const updatedItems = [newItem, ...filteredItems].slice(0, 10);
      saveRecentlyViewed(updatedItems);
      return updatedItems;
    });
  }, [saveRecentlyViewed]);

  // Remover producto de vistos recientes
  const removeFromRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== productId);
      saveRecentlyViewed(updatedItems);
      return updatedItems;
    });
  }, [saveRecentlyViewed]);

  // Limpiar todos los vistos recientes
  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem('posoqo_recently_viewed');
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadRecentlyViewed();
  }, [loadRecentlyViewed]);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed,
    loadRecentlyViewed
  };
}
