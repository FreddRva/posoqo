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
      const products = productsData.data || [];

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
        const categories = catData.data || [];
        
        console.log('Categorías recibidas:', categories);
        console.log('Productos recibidos:', products);
        console.log('Producto completo:', products[0]);
        
        // Buscar categoría "Cervezas" y subcategoría "Cerveza"
        const cervezaCategory = categories.find((c: any) => c.name === "Cervezas");
        const cervezaSubcategory = categories.find((c: any) => c.name === "Cerveza" && c.parent_id);
        const comidasCategory = categories.find((c: any) => c.name === "Comidas");
        
        console.log('Cerveza Category:', cervezaCategory);
        console.log('Cerveza Subcategory:', cervezaSubcategory);
        console.log('Comidas Category:', comidasCategory);
        
        // Filtrar cervezas: productos de subcategoría "Cerveza" (destacados o todos)
        if (cervezaSubcategory) {
          console.log('ID de subcategoría Cerveza:', cervezaSubcategory.id);
          
          // Primero intentar solo destacados
          featuredCervezas = products.filter((p: Product) => {
            console.log(`Producto ${p.name}: subcategory_id=${p.subcategory_id}, is_featured=${p.is_featured}`);
            return p.subcategory_id === cervezaSubcategory.id && p.is_featured;
          });
          
          console.log('Cervezas destacadas encontradas:', featuredCervezas.length);
          
          // Si no hay destacados, mostrar todos los de la subcategoría
          if (featuredCervezas.length === 0) {
            featuredCervezas = products.filter((p: Product) => {
              console.log(`Filtro general - Producto ${p.name}: subcategory_id=${p.subcategory_id}`);
              return p.subcategory_id === cervezaSubcategory.id;
            });
          }
          
          featuredCervezas = featuredCervezas.slice(0, 4);
          console.log('Cervezas filtradas final:', featuredCervezas);
        } else {
          featuredCervezas = [];
        }

        // Filtrar comidas: productos que NO sean de subcategoría "Cerveza"
        if (cervezaSubcategory) {
          // Mostrar productos que NO sean de la subcategoría "Cerveza"
          featuredComidas = products.filter((p: Product) => 
            p.subcategory_id !== cervezaSubcategory.id
          ).slice(0, 4);
          console.log('Comidas filtradas (no cerveza):', featuredComidas);
        } else {
          featuredComidas = [];
        }
      } else {
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
