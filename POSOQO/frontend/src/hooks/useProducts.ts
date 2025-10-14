import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import { Product, Category, FilterState, SortOption, ViewMode } from '@/types/products';

export const useProducts = () => {
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
        console.log('📂 Categorías cargadas:', cats.length);
        console.log('📋 Lista de categorías:', cats.map(c => ({
          id: c.id,
          name: c.name,
          parent_id: (c as any).parent_id
        })));
        
        // Mostrar categorías principales y subcategorías
        const mainCategories = cats.filter(c => !(c as any).parent_id);
        const subCategories = cats.filter(c => (c as any).parent_id);
        console.log('🏢 Categorías principales:', mainCategories.map(c => ({ id: c.id, name: c.name })));
        console.log('🏷️ Subcategorías:', subCategories.map(c => ({ id: c.id, name: c.name, parent_id: (c as any).parent_id })));
        setCategories(cats);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Productos filtrados y ordenados
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    console.log('🔍 FILTRADO DE PRODUCTOS - DEBUG');
    console.log('📦 Productos originales:', products.length);
    console.log('🎯 Filtros aplicados:', filters);
    
    // Mostrar estructura de todos los productos
    if (products.length > 0) {
      console.log('📋 Estructura de todos los productos:', products.map(p => ({
        id: p.id,
        name: p.name,
        category_id: p.category_id,
        subcategory_id: p.subcategory_id
      })));
    }

    // Filtro por búsqueda
    if (filters.search) {
      const beforeSearch = filtered.length;
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
      console.log(`🔎 Búsqueda "${filters.search}": ${beforeSearch} → ${filtered.length}`);
    }

    // Filtro por categoría (buscar tanto en category_id como en subcategory_id)
    if (filters.category) {
      const beforeCategory = filtered.length;
      console.log(`🏷️ Filtrando por categoría: ${filters.category}`);
      
      // Mostrar qué productos coinciden
      const matchingProducts = filtered.filter(product => 
        product.category_id === filters.category || 
        product.subcategory_id === filters.category
      );
      
      console.log('✅ Productos que coinciden con categoría:', matchingProducts.map(p => ({
        name: p.name,
        category_id: p.category_id,
        subcategory_id: p.subcategory_id
      })));
      
      filtered = matchingProducts;
      console.log(`🏷️ Categoría: ${beforeCategory} → ${filtered.length}`);
    }

    // Filtro por subcategoría
    if (filters.subcategory) {
      const beforeSubcategory = filtered.length;
      console.log(`🏷️ Filtrando por subcategoría: ${filters.subcategory}`);
      
      const matchingProducts = filtered.filter(product => product.subcategory_id === filters.subcategory);
      console.log('✅ Productos que coinciden con subcategoría:', matchingProducts.map(p => ({
        name: p.name,
        subcategory_id: p.subcategory_id
      })));
      
      filtered = matchingProducts;
      console.log(`🏷️ Subcategoría: ${beforeSubcategory} → ${filtered.length}`);
    }

    // Filtro por rango de precio
    const beforePrice = filtered.length;
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );
    console.log(`💰 Rango de precio: ${beforePrice} → ${filtered.length}`);

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

    console.log(`🎉 RESULTADO FINAL: ${filtered.length} productos`);
    console.log('📋 Productos finales:', filtered.map(p => p.name));
    console.log('=====================================');

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
