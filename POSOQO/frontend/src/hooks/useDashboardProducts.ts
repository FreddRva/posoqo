// hooks/useDashboardProducts.ts
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Product, Category, ProductFormData } from '@/types/dashboard';

export const useDashboardProducts = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Estados principales
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Cargar productos
  const loadProducts = async () => {
    try {
      const response = await apiFetch<{ data: Product[] }>("/admin/products/list");
      const products = response.data || [];
      setProducts(products);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setError('Error cargando productos');
      setLoading(false);
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: Category[] }>("/categories");
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        const cats = response.data || [];
        const mainCats = cats.filter((c: Category) => !c.parent_id);
        const subCats = cats.filter((c: Category) => c.parent_id);
        setCategories(mainCats);
        setAllCategories(mainCats);
        setAllSubcategories(subCats);
      } else {
        setCategories([]);
        setAllCategories([]);
        setAllSubcategories([]);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setError('Error cargando categorías');
    }
  };

  // Guardar producto
  const saveProduct = async (productData: ProductFormData) => {
    setSaving(true);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/admin/products/${editingProduct.id}` : '/admin/products';
      
      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(productData)
      });

      if (response) {
        setIsModalOpen(false);
        setEditingProduct(null);
        loadProducts();
      }
    } catch (error) {
      console.error('Error guardando producto:', error);
      setError('Error guardando producto');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (id: string) => {
    try {
      await apiFetch(`/admin/products/${id}`, {
        method: 'DELETE'
      });
      loadProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      setError('Error eliminando producto');
    }
  };

  // Toggle activo
  const toggleActive = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        await apiFetch(`/admin/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...product, is_active: !product.is_active })
        });
        loadProducts();
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      setError('Error actualizando producto');
    }
  };

  // Toggle destacado
  const toggleFeatured = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        await apiFetch(`/admin/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...product, is_featured: !product.is_featured })
        });
        loadProducts();
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
      setError('Error actualizando producto');
    }
  };

  // Abrir modal para editar
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Estadísticas
  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    featured: products.filter(p => p.is_featured).length,
    outOfStock: products.filter(p => (p.stock || 0) <= 0).length
  };

  // Efectos
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated" && session?.accessToken) {
      loadProducts();
      loadCategories();
    }
  }, [session, status, router]);

  return {
    // Estados
    products: filteredProducts,
    allProducts: products,
    categories,
    allCategories,
    allSubcategories,
    loading,
    error,
    isModalOpen,
    editingProduct,
    saving,
    searchQuery,
    selectedCategory,
    stats,
    
    // Acciones
    setSearchQuery,
    setSelectedCategory,
    openCreateModal,
    openEditModal,
    closeModal,
    saveProduct,
    deleteProduct,
    toggleActive,
    toggleFeatured,
    loadProducts,
    setError
  };
};
