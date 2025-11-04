"use client";

import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '@/lib/config';
import { handleError, handleNetworkError } from '@/lib/errorHandler';
import { useApiLoadingState } from './useLoadingState';

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  image?: string;
  category?: string;
  style?: string;
  abv?: string;
  ibu?: string;
  color?: string;
  image_url?: string;
  category_id?: string;
  subcategory?: string;
  subcategory_id?: string;
  is_featured?: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  image_url?: string;
  is_active?: boolean;
}

interface HomeData {
  featuredCervezas: Product[];
  featuredComidas: Product[];
  services: Service[];
}

interface UseHomeDataReturn {
  data: HomeData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useHomeData = (): UseHomeDataReturn => {
  const [data, setData] = useState<HomeData>({
    featuredCervezas: [],
    featuredComidas: [],
    services: [],
  });
  
  const loadingState = useApiLoadingState({
    initialData: {
      featuredCervezas: [],
      featuredComidas: [],
      services: [],
    },
    autoReset: true,
    resetDelay: 5000,
  });

  const loadData = useCallback(async () => {
    const result = await loadingState.executeApiCall(async () => {
      // Cargar productos
      const productsResponse = await fetch(getApiUrl('/products'));
      if (!productsResponse.ok) {
        throw new Error('Error cargando productos');
      }
      
      const productsData = await productsResponse.json();
      
      // Procesar productos asegurando que sea un array
      let products: Product[] = [];
      if (Array.isArray(productsData.data)) {
        products = productsData.data;
      } else if (Array.isArray(productsData)) {
        products = productsData;
      }

      // Cargar categorías y servicios en paralelo
      const [categoriesResponse, servicesResponse] = await Promise.allSettled([
        fetch(getApiUrl('/categories')),
        fetch(getApiUrl('/services'))
      ]);

      let featuredCervezas: Product[] = [];
      let featuredComidas: Product[] = [];
      let services: Service[] = [];

      // Procesar categorías
      if (categoriesResponse.status === 'fulfilled') {
        const catData = await categoriesResponse.value.json();
        
        // Asegurar que categories es un array
        let categories: any[] = [];
        if (Array.isArray(catData.data)) {
          categories = catData.data;
        } else if (Array.isArray(catData)) {
          categories = catData;
        }
        
        // Buscar categoría "Cervezas" y subcategoría "Cerveza"
        const cervezaCategory = categories.find((c: any) => c.name === "Cervezas" || c.name?.toLowerCase() === "cervezas");
        const cervezaSubcategory = categories.find((c: any) => (c.name === "Cerveza" || c.name?.toLowerCase() === "cerveza") && c.parent_id);
        
        // Filtrar cervezas: productos de subcategoría "Cerveza" (destacados o todos)
        if (cervezaSubcategory) {
          featuredCervezas = products.filter((p: Product) => {
            const isCerveza = p.subcategory_id === cervezaSubcategory.id || 
                             (!p.subcategory_id && p.category_id === cervezaSubcategory.parent_id);
            return isCerveza && p.is_featured === true;
          });
          
          // Si no hay destacados, mostrar todos los de la categoría
          if (featuredCervezas.length === 0) {
            featuredCervezas = products.filter((p: Product) => {
              const isCerveza = p.subcategory_id === cervezaSubcategory.id || 
                               (!p.subcategory_id && p.category_id === cervezaSubcategory.parent_id);
              return isCerveza;
            });
          }
          
          featuredCervezas = featuredCervezas.slice(0, 4);
        }

        // Filtrar comidas: productos que NO sean cervezas y que sean destacados
        if (cervezaSubcategory) {
          featuredComidas = products.filter((p: Product) => {
            const isCerveza = p.subcategory_id === cervezaSubcategory.id || 
                             (!p.subcategory_id && p.category_id === cervezaSubcategory.parent_id);
            return !isCerveza && p.is_featured === true;
          });
          
          // Si no hay destacados, mostrar todos los que NO sean cervezas
          if (featuredComidas.length === 0) {
            featuredComidas = products.filter((p: Product) => {
              const isCerveza = p.subcategory_id === cervezaSubcategory.id || 
                               (!p.subcategory_id && p.category_id === cervezaSubcategory.parent_id);
              return !isCerveza;
            });
          }
          
          featuredComidas = featuredComidas.slice(0, 4);
        }
      }

      // Procesar servicios - solo servicios activos
      if (servicesResponse.status === 'fulfilled') {
        try {
          const servicesData = await servicesResponse.value.json();
          
          // Asegurar que services es un array
          let servicesArray: Service[] = [];
          if (servicesData.success && servicesData.data && Array.isArray(servicesData.data)) {
            servicesArray = servicesData.data;
          } else if (Array.isArray(servicesData.data)) {
            servicesArray = servicesData.data;
          } else if (Array.isArray(servicesData)) {
            servicesArray = servicesData;
          }
          
          services = servicesArray.filter((s: Service) => s.is_active === true);
        } catch (err) {
          services = [];
        }
      }

      return {
        featuredCervezas,
        featuredComidas,
        services,
      };
    }, 'Cargando datos de inicio...');

    if (result) {
      setData(result);
    }
  }, []);

  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading: loadingState.isLoading,
    error: loadingState.error,
    refetch,
  };
};
