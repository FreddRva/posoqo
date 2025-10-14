import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Product, Category, FilterState, SortOption, ViewMode } from '@/types/products';

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
    

    // Filtro por búsqueda
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
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
  }, [products, filters]);

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
