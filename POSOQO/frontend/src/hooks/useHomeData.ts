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
        const cervezaCategory = catData.data?.find((c: any) => c.name === "Cervezas");
        
        if (cervezaCategory) {
          featuredCervezas = products.filter((p: Product) => {
            const isCervezaByCategory = p.category_id === cervezaCategory.id;
            const isCervezaBySubcategory = p.subcategory === cervezaCategory.id;
            return (isCervezaByCategory || isCervezaBySubcategory) && p.is_featured;
          }).slice(0, 4);

          featuredComidas = products.filter((p: Product) => {
            const isCervezaByCategory = p.category_id === cervezaCategory.id;
            const isCervezaBySubcategory = p.subcategory === cervezaCategory.id;
            const isCerveza = isCervezaByCategory || isCervezaBySubcategory;
            return !isCerveza && p.is_featured;
          }).slice(0, 4);
        } else {
          featuredCervezas = products.filter((p: Product) => p.is_featured).slice(0, 4);
          featuredComidas = [];
        }
      } else {
        featuredCervezas = products.filter((p: Product) => p.is_featured).slice(0, 4);
        featuredComidas = [];
      }

      // Procesar servicios
      if (servicesResponse.status === 'fulfilled') {
        const servicesData = await servicesResponse.value.json();
        if (servicesData.success && servicesData.data) {
          services = servicesData.data;
        } else {
          services = products.filter((p: Product) => !p.is_featured).slice(0, 4);
        }
      } else {
        services = products.filter((p: Product) => !p.is_featured).slice(0, 4);
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
  }, [loadingState]);

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
