"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  image_url?: string;
  category?: string;
  category_id?: string;
  subcategory_id?: string;
  stock?: number;
  rating?: number;
}

interface RecentlyViewedContextType {
  recentlyViewed: Product[];
  updateRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Cargar desde localStorage al inicializar
  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Normalizar los datos antiguos para usar image_url
        const normalized = parsed.map((product: any) => ({
          ...product,
          image_url: product.image_url || product.image || "",
          image: undefined // Remover el campo image para evitar confusión
        }));
        setRecentlyViewed(normalized);
      } catch (error) {
        console.error('Error parsing recently viewed products:', error);
        localStorage.removeItem('recentlyViewed');
      }
    }
  }, []);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const updateRecentlyViewed = (product: Product) => {
    if (!product || !product.id) {
      console.error('Invalid product for recently viewed:', product);
      return;
    }

    // Asegurar que el producto use image_url en lugar de image
    const normalizedProduct = {
      ...product,
      image_url: product.image_url || product.image || "",
      image: undefined // Remover el campo image para evitar confusión
    };

    setRecentlyViewed(prev => {
      // Filtrar el producto si ya existe
      const filtered = prev.filter(p => p.id !== product.id);
      // Agregar el producto al inicio
      const updated = [normalizedProduct, ...filtered];
      // Mantener solo los últimos 4 productos
      return updated.slice(0, 4);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewed');
  };

  return (
    <RecentlyViewedContext.Provider value={{
      recentlyViewed,
      updateRecentlyViewed,
      clearRecentlyViewed
    }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
} 