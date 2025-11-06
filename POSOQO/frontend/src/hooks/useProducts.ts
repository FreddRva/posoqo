import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Product, Category, FilterState, SortOption, ViewMode } from '@/types/products';

// Función para normalizar texto (quitar acentos, convertir a minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .trim();
};

// Función mejorada para obtener variantes de una palabra (singular/plural)
const getWordVariants = (word: string): string[] => {
  if (!word || word.length < 2) return [word.toLowerCase()];
  
  const normalized = normalizeText(word);
  const variants = new Set<string>([normalized]);
  
  // Si la palabra tiene menos de 3 caracteres, no hacer transformaciones
  if (normalized.length < 3) {
    return [normalized];
  }
  
  // Reglas para plurales comunes en español
  const pluralPatterns = [
    // Palabras que terminan en 'es' (cervezas, hamburguesas, etc.)
    { pattern: /^(.*)es$/, singular: (m: string) => m.slice(0, -2) },
    // Palabras que terminan en 'as' cuando la raíz es larga
    { pattern: /^(.*[aeiou])as$/, singular: (m: string) => m.slice(0, -1) },
    // Palabras que terminan en 'os' (vinos, platos, etc.)
    { pattern: /^(.*[aeiou])os$/, singular: (m: string) => m.slice(0, -1) },
    // Palabras que terminan en 's' simple (productos, refrescos, etc.)
    { pattern: /^(.*)s$/, singular: (m: string) => m.slice(0, -1) },
  ];
  
  // Si termina en 's', crear singular
  if (normalized.endsWith('s') && normalized.length > 3) {
    for (const rule of pluralPatterns) {
      const match = normalized.match(rule.pattern);
      if (match && normalized.length > 4) {
        const singular = rule.singular(normalized);
        if (singular.length >= 3) {
          variants.add(singular);
        }
      }
    }
  }
  
  // Si no termina en 's', crear plurales
  if (!normalized.endsWith('s') && normalized.length >= 3) {
    // Plural simple con 's'
    variants.add(normalized + 's');
    // Plural con 'es' (para palabras que terminan en consonante)
    if (!/[aeiou]$/.test(normalized)) {
      variants.add(normalized + 'es');
    }
  }
  
  return Array.from(variants);
};

// Función de búsqueda inteligente mejorada
const smartSearch = (searchTerm: string, text: string): boolean => {
  if (!text || !searchTerm) return false;
  
  const normalizedText = normalizeText(text);
  const normalizedSearch = normalizeText(searchTerm);
  
  // Búsqueda exacta directa (mejor coincidencia)
  if (normalizedText.includes(normalizedSearch)) return true;
  
  // Dividir búsqueda en palabras
  const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length >= 2);
  
  // Si es una sola palabra, buscar con variantes
  if (searchWords.length === 1) {
    const word = searchWords[0];
    const variants = getWordVariants(word);
    
    // Buscar cada variante
    for (const variant of variants) {
      // Búsqueda de palabra completa (con límites de palabra)
      const wordBoundaryRegex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (wordBoundaryRegex.test(normalizedText)) return true;
      
      // Búsqueda como substring (más flexible)
      if (normalizedText.includes(variant)) return true;
    }
  } else {
    // Búsqueda de múltiples palabras - todas deben aparecer
    const allWordsMatch = searchWords.every(word => {
      const variants = getWordVariants(word);
      return variants.some(variant => normalizedText.includes(variant));
    });
    if (allWordsMatch) return true;
  }
  
  // Búsqueda por coincidencias parciales (para palabras dentro de otras)
  const searchChars = normalizedSearch.replace(/\s+/g, '');
  let textIndex = 0;
  for (let i = 0; i < searchChars.length; i++) {
    const char = searchChars[i];
    const foundIndex = normalizedText.indexOf(char, textIndex);
    if (foundIndex === -1) return false;
    textIndex = foundIndex + 1;
  }
  
  // Si los caracteres aparecen en orden, es una coincidencia parcial
  return true;
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
    

    // Filtro por búsqueda inteligente mejorada
    if (filters.search && filters.search.trim().length > 0) {
      const searchTerm = filters.search.trim();
      
      filtered = filtered.filter(product => {
        // 1. Buscar en nombre del producto (prioridad alta)
        if (smartSearch(searchTerm, product.name)) return true;
        
        // 2. Buscar en descripción del producto
        if (product.description && smartSearch(searchTerm, product.description)) return true;
        
        // 3. Buscar en nombre de categoría
        if (categories.length > 0) {
          const productCategory = categories.find(cat => cat.id === product.category_id);
          if (productCategory && smartSearch(searchTerm, productCategory.name)) return true;
          
          // 4. Buscar en nombre de subcategoría
          const productSubcategory = categories.find(cat => cat.id === product.subcategory_id);
          if (productSubcategory && smartSearch(searchTerm, productSubcategory.name)) return true;
          
          // 5. Buscar en todas las subcategorías de la categoría
          if (productCategory?.subcategories) {
            const matchesSubcategory = productCategory.subcategories.some(subcat => 
              smartSearch(searchTerm, subcat.name)
            );
            if (matchesSubcategory) return true;
          }
        }
        
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
    allProducts: products, // Productos sin filtrar para autocompletado
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
