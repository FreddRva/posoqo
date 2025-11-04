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
      console.log('[useHomeData] Cargando productos desde:', getApiUrl('/products'));
      const productsResponse = await fetch(getApiUrl('/products'));
      if (!productsResponse.ok) {
        throw new Error('Error cargando productos');
      }
      
      const productsData = await productsResponse.json();
      console.log('[useHomeData] Respuesta de productos:', {
        hasData: !!productsData.data,
        dataLength: productsData.data?.length || 0,
        productsKeys: Object.keys(productsData),
        firstProduct: productsData.data?.[0] || null
      });
      
      const products = productsData.data || productsData || [];

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
        const categories = catData.data || catData || [];
        
        console.log('[useHomeData] Categorías cargadas:', {
          categoriesCount: categories.length,
          categoryNames: categories.map((c: any) => c.name)
        });
        
        // Buscar categoría "Cervezas" y subcategoría "Cerveza"
        const cervezaCategory = categories.find((c: any) => c.name === "Cervezas" || c.name?.toLowerCase() === "cervezas");
        const cervezaSubcategory = categories.find((c: any) => (c.name === "Cerveza" || c.name?.toLowerCase() === "cerveza") && c.parent_id);
        const comidasCategory = categories.find((c: any) => c.name === "Comidas" || c.name?.toLowerCase() === "comidas");
        
        console.log('[useHomeData] Categorías encontradas:', {
          cervezaCategory: cervezaCategory?.name,
          cervezaSubcategory: cervezaSubcategory?.name,
          comidasCategory: comidasCategory?.name
        });
        
        // Filtrar cervezas: productos de subcategoría "Cerveza" (destacados o todos)
        if (cervezaSubcategory) {
          // Buscar productos que tengan subcategory_id = cervezaSubcategory.id O category_id = cervezaCategory.id
          featuredCervezas = products.filter((p: Product) => {
            // Solo mostrar productos destacados
            const isCerveza = p.subcategory_id === cervezaSubcategory.id || 
                             (!p.subcategory_id && p.category_id === cervezaSubcategory.parent_id);
            
            return isCerveza && p.is_featured === true;
          });
          
          console.log('[useHomeData] Cervezas destacadas encontradas:', {
            count: featuredCervezas.length,
            nombres: featuredCervezas.map(p => p.name)
          });
          
          // Si no hay destacados, mostrar todos los de la categoría
          if (featuredCervezas.length === 0) {
            featuredCervezas = products.filter((p: Product) => {
              const isCerveza = p.subcategory_id === cervezaSubcategory.id || 
                               (!p.subcategory_id && p.category_id === cervezaSubcategory.parent_id);
              return isCerveza;
            });
            console.log('[useHomeData] Usando todas las cervezas (sin filtrar por destacados):', featuredCervezas.length);
          }
          
          featuredCervezas = featuredCervezas.slice(0, 4);
        } else {
          console.log('[useHomeData] No se encontró subcategoría de cerveza');
          featuredCervezas = [];
        }

        // Filtrar comidas: productos que NO sean cervezas y que sean destacados
        if (cervezaSubcategory) {
          // Mostrar productos que NO sean de la subcategoría "Cerveza" NI de la categoría "Bebidas" y que sean destacados
          featuredComidas = products.filter((p: Product) => {
            const isCerveza = p.subcategory_id === cervezaSubcategory.id || 
                             (!p.subcategory_id && p.category_id === cervezaSubcategory.parent_id);
            return !isCerveza && p.is_featured === true;
          });
          
          console.log('[useHomeData] Comidas destacadas encontradas:', {
            count: featuredComidas.length,
            nombres: featuredComidas.map(p => p.name)
          });
          
          // Si no hay destacados, mostrar todos los que NO sean cervezas
          if (featuredComidas.length === 0) {
            featuredComidas = products.filter((p: Product) => {
              const isCerveza = p.subcategory_id === cervezaSubcategory.id || 
                               (!p.subcategory_id && p.category_id === cervezaSubcategory.parent_id);
              return !isCerveza;
            });
            console.log('[useHomeData] Usando todas las comidas (sin filtrar por destacados):', featuredComidas.length);
          }
          
          featuredComidas = featuredComidas.slice(0, 4);
        } else {
          console.log('[useHomeData] No se encontró subcategoría de cerveza para filtrar comidas');
          featuredComidas = [];
        }
      } else {
        console.error('[useHomeData] Error cargando categorías:', categoriesResponse.reason);
        featuredCervezas = [];
        featuredComidas = [];
      }

      // Procesar servicios - solo servicios activos
      if (servicesResponse.status === 'fulfilled') {
        const servicesData = await servicesResponse.value.json();
        if (servicesData.success && servicesData.data) {
          services = servicesData.data.filter((s: Service) => s.is_active === true);
        } else {
          services = [];
        }
      } else {
        console.log('Error cargando servicios:', servicesResponse.reason);
        services = [];
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
