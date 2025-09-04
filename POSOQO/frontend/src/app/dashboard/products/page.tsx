"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Tag,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  parent_id?: string; // Added parent_id for subcategories
}

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id?: string;
  subcategory_id?: string;
  estilo?: string;
  abv?: string;
  ibu?: string;
  color?: string;
  is_active?: boolean;
  is_featured?: boolean;
  stock?: number;
}

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Product>({ name: "", description: "", price: 0, image_url: "", is_active: true, is_featured: false, stock: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Función para recargar productos desde el backend
  const reloadProducts = () => {
    apiFetch("/admin/products/list")
      .then((data: any) => {
        setProducts(data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        setError("Error al cargar productos");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user || (session.user as any).role !== "admin") {
      router.push("/");
      return;
    }
    reloadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  useEffect(() => {
    apiFetch("/categories")
      .then((response: any) => {
        console.log('🔍 [CATEGORIES] Respuesta completa:', response);
        if (response && typeof response === 'object' && 'success' in response && response.success) {
          const cats = response.data || [];
          console.log('🔍 [CATEGORIES] Categorías cargadas:', cats);
          const mainCats = cats.filter((c: Category) => !c.parent_id);
          const subCats = cats.filter((c: Category) => c.parent_id);
          console.log('🔍 [CATEGORIES] Categorías principales:', mainCats);
          console.log('🔍 [CATEGORIES] Subcategorías:', subCats);
          setCategories(mainCats);
          setAllCategories(mainCats);
          setAllSubcategories(subCats);
        } else {
          console.log('🔍 [CATEGORIES] Respuesta no exitosa:', response);
          setCategories([]);
          setAllCategories([]);
          setAllSubcategories([]);
        }
      })
      .catch(error => {
        console.error('❌ [CATEGORIES] Error cargando categorías:', error);
        setCategories([]);
        setAllCategories([]);
        setAllSubcategories([]);
      });
  }, []);

  const reloadCategories = () => {
    apiFetch("/categories")
      .then((response: any) => {
        if (response && typeof response === 'object' && 'success' in response && response.success) {
          const cats = response.data || [];
          setCategories(cats.filter((c: Category) => !c.parent_id));
          setAllCategories(cats.filter((c: Category) => !c.parent_id));
          setAllSubcategories(cats.filter((c: Category) => c.parent_id));
        } else {
          setCategories([]);
          setAllCategories([]);
          setAllSubcategories([]);
        }
      })
      .catch(error => {
        console.error('Error cargando categorías:', error);
        setCategories([]);
        setAllCategories([]);
        setAllSubcategories([]);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;

    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      parsedValue = target.checked;
    }

    setForm(prev => ({
      ...prev,
      [name]: parsedValue
    }));

    // Limpiar error de validación si existe
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir imagen');
      }

      const data = await response.json();
      setForm(prev => ({
        ...prev,
        image_url: data.url
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error al subir imagen');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!form.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    if (!form.description.trim()) {
      errors.description = 'La descripción es requerida';
    }
    if (form.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }
    if (!form.category_id) {
      errors.category_id = 'La categoría es requerida';
    }
    
    // Validar subcategoría para bebidas
    if (form.category_id === 'ba2359b7-6fcb-4c38-8b97-0961637ef032' && !form.subcategory_id) {
      errors.subcategory_id = 'La subcategoría es requerida para bebidas';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingId ? `/admin/products/${editingId}` : '/admin/products';
      const method = editingId ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(form)
      });

      if (response) {
        console.log(`✅ [PRODUCTS] Producto ${editingId ? 'actualizado' : 'creado'} exitosamente`);
        handleCloseModal();
        reloadProducts();
        reloadCategories();
      }
    } catch (error) {
      console.error('❌ [PRODUCTS] Error:', error);
      setError(`Error al ${editingId ? 'actualizar' : 'crear'} producto`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      await apiFetch(`/admin/products/${id}`, {
        method: 'DELETE'
      });
      console.log("✅ [PRODUCTS] Producto eliminado exitosamente");
      reloadProducts();
    } catch (error) {
      console.error('❌ [PRODUCTS] Error eliminando producto:', error);
      setError('Error al eliminar producto');
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      image_url: product.image_url || "",
      category_id: product.category_id || "",
      subcategory_id: product.subcategory_id || "",
      estilo: product.estilo || "",
      abv: product.abv || "",
      ibu: product.ibu || "",
      color: product.color || "",
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      stock: product.stock || 0
    });
    setEditingId(product.id || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ name: "", description: "", price: 0, image_url: "", is_active: true, is_featured: false, stock: 0 });
    setEditingId(null);
    setValidationErrors({});
    setError(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && product.is_active) ||
                         (filter === 'inactive' && !product.is_active) ||
                         (filter === 'featured' && product.is_featured);
    
    return matchesSearch && matchesFilter;
  });

  const getProductStats = () => {
    return {
      total: products.length,
      active: products.filter(p => p.is_active).length,
      inactive: products.filter(p => !p.is_active).length,
      featured: products.filter(p => p.is_featured).length
    };
  };

  const stats = getProductStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
            <p className="text-stone-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Gestión de Productos</h1>
            <p className="text-stone-600">Administra todos los productos de tu restaurante</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Producto</span>
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-stone-800">{stats.total}</div>
                <div className="text-stone-600 text-sm font-medium">Total Productos</div>
              </div>
              <div className="text-blue-600">
                <Package className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                <div className="text-stone-600 text-sm font-medium">Activos</div>
              </div>
              <div className="text-green-600">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
                <div className="text-stone-600 text-sm font-medium">Inactivos</div>
              </div>
              <div className="text-red-600">
                <EyeOff className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">{stats.featured}</div>
                <div className="text-stone-600 text-sm font-medium">Destacados</div>
              </div>
              <div className="text-yellow-600">
                <Star className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-2">Buscar Productos</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 placeholder-stone-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-medium text-stone-700 mb-2">Filtrar por Estado</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">Todos los productos</option>
                  <option value="active">Solo activos</option>
                  <option value="inactive">Solo inactivos</option>
                  <option value="featured">Solo destacados</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12">
                          {product.image_url ? (
                            <img
                              className="w-12 h-12 rounded-lg object-cover"
                              src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:4000${product.image_url}`}
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                // Mostrar placeholder cuando hay error
                                const placeholder = e.currentTarget.parentElement?.querySelector('.image-placeholder');
                                if (placeholder) {
                                  (placeholder as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          {/* Placeholder cuando no hay imagen o hay error */}
                          <div className={`image-placeholder w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center ${product.image_url ? 'hidden' : ''}`}>
                            <ImageIcon className="w-6 h-6 text-stone-400" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-stone-900">{product.name}</div>
                          <div className="text-sm text-stone-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-stone-400" />
                        <span className="text-sm text-stone-600">
                          {allCategories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div className="text-sm font-semibold text-stone-900">
                          S/ {product.price?.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {product.is_active ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-900">
                        {product.stock || 0} unidades
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id!)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="text-4xl mb-4">
              <Package className="w-16 h-16 text-stone-400 mx-auto" />
            </div>
            <div className="text-stone-600 text-lg font-medium">No hay productos para mostrar</div>
            <div className="text-stone-500 text-sm mt-2">Los productos aparecerán aquí cuando los agregues</div>
          </div>
        )}

        {/* Modal para agregar/editar producto */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-stone-800">
                  {editingId ? 'Editar Producto' : 'Agregar Producto'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Categorías */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Categoría*
                    </label>
                    <select
                      name="category_id"
                      value={form.category_id || ""}
                      onChange={handleChange}
                      className="w-full border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-white text-sm relative z-30"
                      required
                    >
                      <option value="" disabled>Selecciona categoría</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {form.category_id && form.category_id === 'ba2359b7-6fcb-4c38-8b97-0961637ef032' && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Subcategoría*
                      </label>
                      <select
                        name="subcategory_id"
                        value={form.subcategory_id || ""}
                        onChange={handleChange}
                        className="w-full border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-white text-sm relative z-30"
                        required
                      >
                        <option value="" disabled>Selecciona subcategoría</option>
                        {allSubcategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>

                      {validationErrors.subcategory_id && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.subcategory_id}</p>
                      )}
                    </div>
                  )}
                </div>
                
                {(
                      (form.category_id && form.category_id !== 'ba2359b7-6fcb-4c38-8b97-0961637ef032') ||
                      (form.category_id && form.category_id === 'ba2359b7-6fcb-4c38-8b97-0961637ef032' && form.subcategory_id)
                ) && (
                  <>
                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">
                              Nombre*
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={form.name || ""}
                              onChange={handleChange}
                              placeholder="Nombre del producto"
                              className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-white text-sm relative z-30 ${
                                validationErrors.name 
                                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-stone-300 dark:border-stone-600'
                              }`}
                              required
                            />
                            {validationErrors.name && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.name}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">
                              Precio*
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-stone-500 dark:text-stone-400 text-sm">S/</span>
                              </div>
                              <input
                                type="number"
                                name="price"
                                min="0"
                                step="0.01"
                                value={form.price || 0}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={`w-full pl-7 pr-3 border rounded-md py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-white text-sm relative z-30 ${
                                  validationErrors.price 
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-stone-300 dark:border-stone-600'
                                }`}
                                required
                              />
                            </div>
                            {validationErrors.price && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.price}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">
                              Stock*
                            </label>
                            <input
                              type="number"
                              name="stock"
                              min="0"
                              value={form.stock || 0}
                              onChange={handleChange}
                              placeholder="Cantidad"
                              className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-white text-sm relative z-30 ${
                                validationErrors.stock 
                                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-stone-300 dark:border-stone-600'
                              }`}
                              required
                            />
                            {validationErrors.stock && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.stock}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Checkboxes */}
                        <div className="flex gap-6">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="is_active"
                              checked={form.is_active === undefined ? true : form.is_active}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-300 dark:border-stone-600 rounded"
                            />
                            <span className="ml-2 text-sm text-stone-700 dark:text-stone-300">Activo</span>
                          </label>
                          
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="is_featured"
                              checked={form.is_featured === undefined ? false : form.is_featured}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-300 dark:border-stone-600 rounded"
                            />
                            <span className="ml-2 text-sm text-stone-700 dark:text-stone-300">Destacado</span>
                          </label>
                        </div>
                        
                        {/* Descripción */}
                        <div>
                          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                            Descripción
                          </label>
                          <textarea
                            name="description"
                            rows={2}
                            value={form.description || ""}
                            onChange={handleChange}
                            placeholder="Descripción del producto"
                            className="w-full border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-white text-sm relative z-30"
                          />
                        </div>
                        
                        {/* Campos de cerveza */}
                        {form.category_id && allCategories.find(c => c.id === form.category_id)?.name === 'Bebidas' && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                Estilo
                              </label>
                              <input
                                type="text"
                                name="estilo"
                                value={form.estilo || ""}
                                onChange={handleChange}
                                placeholder="IPA, Stout..."
                                className="w-full border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-white text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                ABV (%)
                              </label>
                              <input
                                type="text"
                                name="abv"
                                value={form.abv || ""}
                                onChange={handleChange}
                                placeholder="5.5%"
                                className="w-full border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-white text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                IBU
                              </label>
                              <input
                                type="text"
                                name="ibu"
                                value={form.ibu || ""}
                                onChange={handleChange}
                                placeholder="30"
                                className="w-full border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-white text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                Color
                              </label>
                              <input
                                type="text"
                                name="color"
                                value={form.color || ""}
                                onChange={handleChange}
                                placeholder="Ámbar, Oscuro..."
                                className="w-full border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-stone-700 dark:text-white text-sm"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Imagen */}
                        <div>
                          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                            Imagen
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <input
                                type="file"
                                id="image-upload"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                disabled={isUploadingImage}
                                className="hidden"
                              />
                              <label
                                htmlFor="image-upload"
                                className={`block w-full border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 text-center cursor-pointer text-sm transition-colors ${
                                  isUploadingImage 
                                    ? 'bg-stone-100 dark:bg-stone-600 cursor-not-allowed' 
                                    : 'bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600'
                                }`}
                              >
                                                                 {isUploadingImage ? (
                                   <>
                                     <Loader2 className="inline-block w-4 h-4 animate-spin mr-2" />
                                     Subiendo...
                                   </>
                                 ) : (
                                   <>
                                     <Upload className="w-4 h-4 mr-2" />
                                     {form.image_url ? 'Cambiar' : 'Subir'} Imagen
                                   </>
                                 )}
                              </label>
                            </div>
                            
                                                         {form.image_url && (
                               <div className="relative">
                                 <img
                                   src={form.image_url.startsWith('http') ? form.image_url : `http://localhost:4000${form.image_url}`}
                                   alt="Vista previa"
                                   className="h-12 w-12 rounded object-cover border border-stone-200 dark:border-stone-600"
                                   onError={(e) => {
                                     console.error('❌ [MODAL] Error cargando imagen en modal:', form.image_url);
                                     e.currentTarget.style.display = 'none';
                                   }}
                                 />
                                 <button
                                   type="button"
                                   onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                                   className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                   title="Eliminar imagen"
                                 >
                                   ×
                                 </button>
                               </div>
                             )}
                          </div>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            Formatos: JPG, PNG, GIF. Máximo 5MB
                          </p>
                        </div>
                      </>
                    )}
                    
                    {/* Botones */}
                    <div className="flex justify-between gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
                                             <button
                         type="button"
                         onClick={handleCloseModal}
                         className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-stone-700 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                       >
                         <X className="w-4 h-4" />
                         Cancelar
                       </button>
                       <button
                         type="submit"
                         className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center gap-2"
                         disabled={isSubmitting || !form.category_id || (allCategories.find(c => c.id === form.category_id)?.name === 'Bebidas' && !form.subcategory_id)}
                       >
                         {isSubmitting ? (
                           <>
                             <Loader2 className="w-4 h-4 animate-spin" />
                             Guardando...
                           </>
                         ) : (
                           <>
                             {editingId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                             {editingId ? 'Actualizar' : 'Crear'}
                           </>
                         )}
                       </button>
                    </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 