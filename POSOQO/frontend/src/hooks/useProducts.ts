import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Product, Category, FilterState, SortOption, ViewMode } from '@/types/products';

// Función para obtener variantes de una palabra (singular y plural)
const getWordVariants = (word: string): string[] => {
  const lowerWord = word.toLowerCase().trim();
  const variants = [lowerWord];
  
  // Si termina en 'es' (cervezas, comidas), crear singular
  if (lowerWord.endsWith('es') && lowerWord.length > 4) {
    variants.push(lowerWord.slice(0, -2)); // cervezas -> cerveza
  }
  // Si termina en 'as' (cervezas alternativo), crear singular
  else if (lowerWord.endsWith('as') && lowerWord.length > 4) {
    variants.push(lowerWord.slice(0, -1)); // cervezas -> cerveza
  }
  // Si termina en 'os' (vinos), crear singular
  else if (lowerWord.endsWith('os') && lowerWord.length > 4) {
    variants.push(lowerWord.slice(0, -1)); // vinos -> vino
  }
  // Si termina en 's' pero no en 'es', crear plural agregando 'es'
  else if (lowerWord.endsWith('s') && !lowerWord.endsWith('es') && lowerWord.length > 3) {
    // Ya es plural, crear singular removiendo 's'
    variants.push(lowerWord.slice(0, -1));
  }
  // Si no termina en 's', crear plurales comunes
  else if (!lowerWord.endsWith('s') && lowerWord.length > 2) {
    variants.push(lowerWord + 's'); // cerveza -> cervezas
    variants.push(lowerWord + 'es'); // cerveza -> cervezas (alternativa)
  }
  
  return [...new Set(variants)]; // Eliminar duplicados
};

// Función de búsqueda inteligente que maneja plural/singular
const smartSearch = (searchTerm: string, text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
  
  // Para cada palabra de búsqueda, obtener sus variantes y buscar
  return searchWords.some(word => {
    const variants = getWordVariants(word);
    
    // Buscar cualquiera de las variantes en el texto
    return variants.some(variant => {
      // Búsqueda exacta de palabra completa (mejor coincidencia)
      const wordRegex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (wordRegex.test(normalizedText)) return true;
      
      // Búsqueda como substring (coincidencia parcial)
      if (normalizedText.includes(variant)) return true;
      
      return false;
    });
  });
};

export const useProducts = () => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    subcategory: '',
    sort: 'name-asc',
    viewMode: 'grid',
    showMap: false,
    priceRange: [0, 1000]
  });

  // Cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ success: boolean; data: Product[] }>('/products');
      if (response && response.success) {
        setProducts(response.data || []);
      } else {
        setError('Error cargando productos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: Category[] }>('/categories');
      if (response && response.success) {
        const cats = response.data || [];
        setCategories(cats);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };


  // Productos filtrados y ordenados
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    

    // Filtro por búsqueda inteligente
    if (filters.search) {
      const searchTerm = filters.search.trim();
      
      filtered = filtered.filter(product => {
        // Buscar en nombre del producto
        if (smartSearch(searchTerm, product.name)) return true;
        
        // Buscar en descripción
        if (product.description && smartSearch(searchTerm, product.description)) return true;
        
        // Buscar en nombre de categoría
        const productCategory = categories.find(cat => cat.id === product.category_id);
        if (productCategory && smartSearch(searchTerm, productCategory.name)) return true;
        
        // Buscar en nombre de subcategoría
        const productSubcategory = categories.find(cat => cat.id === product.subcategory_id);
        if (productSubcategory && smartSearch(searchTerm, productSubcategory.name)) return true;
        
        return false;
      });
    }

    // Filtro por categoría (buscar tanto en category_id como en subcategory_id)
    if (filters.category) {
      // Buscar la categoría seleccionada para determinar si es principal o subcategoría
      const selectedCategory = categories.find(c => c.id === filters.category);
      const isSubcategory = selectedCategory && (selectedCategory as any).parent_id;
      
      filtered = filtered.filter(product => {
        if (isSubcategory) {
          // Si es subcategoría, buscar por subcategory_id O por category_id de la categoría padre
          return product.subcategory_id === filters.category || 
                 product.category_id === (selectedCategory as any).parent_id;
        } else {
          // Si es categoría principal, buscar por category_id
          return product.category_id === filters.category;
        }
      });
    }

    // Filtro por subcategoría
    if (filters.subcategory) {
      filtered = filtered.filter(product => product.subcategory_id === filters.subcategory);
    }

    // Filtro por rango de precio
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'popularity':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters, categories]);

  // Subcategorías de la categoría seleccionada
  const subcategories = useMemo(() => {
    if (!filters.category) return [];
    const category = categories.find(cat => cat.id === filters.category);
    return category?.subcategories || [];
  }, [categories, filters.category]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Detectar filtro desde URL
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && categories.length > 0) {
      // Mapeo de filtros de URL a nombres de categorías
      const filterMap: { [key: string]: string } = {
        'cerveza': 'Cerveza',
        'comidas': 'Comidas', 
        'refrescos': 'Refrescos'
      };
      
      const categoryName = filterMap[filterParam.toLowerCase()];
      if (categoryName) {
        // Buscar la categoría que coincida con el filtro
        const matchingCategory = categories.find(cat => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if (matchingCategory) {
          setFilters(prev => ({
            ...prev,
            category: matchingCategory.id
          }));
        }
      }
    }
  }, [searchParams, categories]);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      subcategory: '',
      sort: 'name-asc',
      viewMode: 'grid',
      showMap: false,
      priceRange: [0, 1000]
    });
  };

  return {
    products: filteredProducts,
    categories,
    subcategories,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: loadProducts
  };
};
