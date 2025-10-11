"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { 
  Tags, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  FolderOpen,
  Folder
} from 'lucide-react';

interface Category {
  id?: string;
  name: string;
  parent_id?: string;
  image_url?: string;
}

export default function AdminCategories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Category>({ name: "" });
  const [isSubcategory, setIsSubcategory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'main' | 'sub'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('list');
  const [hierarchyData, setHierarchyData] = useState<any[]>([]);

  // Protección de ruta solo para admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user || (session.user as any).role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  // Cargar categorías
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ data: any[] }>("/categories");
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        const apiResponse = response as { success: boolean; data: Category[] };
        setCategories(apiResponse.data || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setError('Error al cargar categorías');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadHierarchy = async () => {
    try {
      const response = await apiFetch<{ data: any[] }>("/categories/hierarchy");
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        const apiResponse = response as { success: boolean; data: any[] };
        setHierarchyData(apiResponse.data || []);
      } else {
        setHierarchyData([]);
      }
    } catch (error) {
      console.error('Error cargando jerarquía:', error);
      setError('Error al cargar jerarquía de categorías');
      setHierarchyData([]);
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validaciones del lado del cliente
      if (!form.name || form.name.trim() === '') {
        setError('⚠️ El nombre de la categoría es obligatorio');
        setIsSubmitting(false);
        return;
      }

      if (isSubcategory && !form.parent_id) {
        setError('⚠️ Las subcategorías deben tener una categoría padre');
        setIsSubmitting(false);
        return;
      }

      // Verificar si ya existe una categoría con el mismo nombre (excluyendo la que se está editando)
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase() === form.name.toLowerCase().trim() && 
        cat.id !== editingId
      );

      if (existingCategory) {
        setError('⚠️ Ya existe una categoría con este nombre. Por favor, elige un nombre diferente');
        setIsSubmitting(false);
        return;
      }

      // Validación adicional para subcategorías: no pueden ser su propia categoría padre
      if (isSubcategory && form.parent_id === editingId) {
        setError('⚠️ Una categoría no puede ser su propia categoría padre');
        setIsSubmitting(false);
        return;
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/admin/categories/${editingId}` : "/admin/categories";
      
      // Preparar los datos a enviar
      const dataToSend = {
        name: form.name.trim(),
        parent_id: form.parent_id || null,
        image_url: form.image_url || null
      };

      console.log('📤 [CATEGORIES] Enviando datos:', dataToSend);
      
      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(dataToSend)
      });

      if (response) {
        console.log(`✅ [CATEGORIES] Categoría ${editingId ? 'actualizada' : 'creada'} exitosamente`);
        setForm({ name: "" });
        setEditingId(null);
        setIsSubcategory(false);
        setShowForm(false);
        loadCategories();
      }
    } catch (error: any) {
      console.error('❌ [CATEGORIES] Error:', error);
      
      // Manejo de errores más específico y profesional
      let errorMessage = '❌ Error inesperado al procesar la solicitud';
      
      if (error?.message) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          errorMessage = '⚠️ Ya existe una categoría con este nombre. Por favor, elige un nombre diferente';
        } else if (error.message.includes('validation')) {
          errorMessage = '⚠️ Los datos ingresados no son válidos. Por favor, revisa la información';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '🌐 Error de conexión. Por favor, verifica tu internet e intenta nuevamente';
        } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
          errorMessage = '🔒 Sesión expirada. Por favor, inicia sesión nuevamente';
        } else if (error.message.includes('forbidden') || error.message.includes('403')) {
          errorMessage = '🚫 No tienes permisos para realizar esta acción';
        } else if (error.message.includes('not found') || error.message.includes('404')) {
          errorMessage = '🔍 Recurso no encontrado. Por favor, recarga la página';
        } else if (error.message.includes('server') || error.message.includes('500')) {
          errorMessage = '🛠️ Error del servidor. Por favor, intenta más tarde';
        } else {
          errorMessage = `⚠️ ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return;

    try {
      await apiFetch(`/admin/categories/${id}`, {
        method: 'DELETE'
      });
      console.log("✅ [CATEGORIES] Categoría eliminada exitosamente");
      loadCategories();
    } catch (error) {
      console.error('❌ [CATEGORIES] Error eliminando categoría:', error);
      setError('Error al eliminar categoría');
    }
  };

  const handleEdit = (category: Category) => {
    // Validar que la categoría tenga los datos necesarios
    if (!category || !category.id) {
      setError('⚠️ Error: No se pudo cargar la información de la categoría');
      return;
    }

    // Preparar los datos del formulario
    const formData = {
      name: category.name || "",
      parent_id: category.parent_id || "",
      image_url: category.image_url || ""
    };

    setForm(formData);
    setEditingId(category.id);
    setIsSubcategory(!!category.parent_id);
    setError(null); // Limpiar errores previos
    setShowForm(true);
    
    console.log('📝 [CATEGORIES] Editando categoría:', {
      id: category.id,
      name: category.name,
      parent_id: category.parent_id,
      isSubcategory: !!category.parent_id
    });
  };

  const handleAdd = () => {
    setForm({ name: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const getParentName = (parent_id?: string) => {
    if (!parent_id) return null;
    const parent = categories.find(c => c.id === parent_id);
    return parent?.name;
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'main' && !category.parent_id) ||
                         (filter === 'sub' && category.parent_id);
    return matchesSearch && matchesFilter;
  });

  const getCategoryStats = () => {
    return {
      total: categories.length,
      main: categories.filter(c => !c.parent_id).length,
      sub: categories.filter(c => c.parent_id).length
    };
  };

  const stats = getCategoryStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
            <p className="text-stone-600">Cargando categorías...</p>
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
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Gestión de Categorías</h1>
            <p className="text-stone-600">Administra las categorías de productos</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-stone-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setViewMode('list');
                  loadCategories();
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => {
                  setViewMode('hierarchy');
                  loadHierarchy();
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'hierarchy'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Jerarquía
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsSubcategory(false);
                  handleAdd();
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Folder className="w-5 h-5" />
                <span>Categoría Principal</span>
              </button>
            <button
                onClick={() => {
                  setIsSubcategory(true);
                  handleAdd();
                }}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
              >
                <FolderOpen className="w-5 h-5" />
                <span>Subcategoría</span>
            </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-stone-800">{stats.total}</div>
                <div className="text-stone-600 text-sm font-medium">Total Categorías</div>
              </div>
              <div className="text-blue-600">
                <Tags className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.main}</div>
                <div className="text-stone-600 text-sm font-medium">Categorías Principales</div>
              </div>
              <div className="text-green-600">
                <Folder className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{stats.sub}</div>
                <div className="text-stone-600 text-sm font-medium">Subcategorías</div>
              </div>
              <div className="text-purple-600">
                <FolderOpen className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-2">Buscar Categorías</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 placeholder-stone-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-medium text-stone-700 mb-2">Filtrar por Tipo</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="main">Solo principales</option>
                  <option value="sub">Solo subcategorías</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de categorías */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Padre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-12 h-12">
                            {category.image_url ? (
                              <img
                                className="w-12 h-12 rounded-lg object-cover"
                                src={category.image_url.startsWith('http') ? category.image_url : `http://localhost:4000${category.image_url}`}
                                alt={category.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const placeholder = e.currentTarget.parentElement?.querySelector('.image-placeholder');
                                  if (placeholder) {
                                    (placeholder as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div className={`image-placeholder w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center ${category.image_url ? 'hidden' : ''}`}>
                              <ImageIcon className="w-6 h-6 text-stone-400" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-stone-900">{category.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {category.parent_id ? (
                            <>
                              <FolderOpen className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-purple-600 font-medium">Subcategoría</span>
                            </>
                          ) : (
                            <>
                              <Folder className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Principal</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-600">
                          {getParentName(category.parent_id) || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                            title={`Editar ${category.name}`}
                          >
                            <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id!)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                            title={`Eliminar ${category.name}`}
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Vista Jerárquica */
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Estructura Jerárquica de Categorías</h3>
            <div className="space-y-4">
              {hierarchyData.map((category) => (
                <div key={category.id} className="border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Folder className="w-5 h-5 text-green-600" />
                      <h4 className="text-lg font-semibold text-stone-800">{category.name}</h4>
                      <span className="text-sm text-stone-500">ID: {category.id}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit({ id: category.id, name: category.name })}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                        title={`Editar ${category.name}`}
                      >
                        <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                        title={`Eliminar ${category.name}`}
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                  
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="ml-8 mt-3 space-y-2">
                      <h5 className="text-sm font-medium text-stone-700 flex items-center space-x-2">
                        <FolderOpen className="w-4 h-4 text-purple-600" />
                        <span>Subcategorías:</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.subcategories.map((sub: any) => (
                          <div key={sub.id} className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <FolderOpen className="w-4 h-4 text-purple-600" />
                                <span className="font-medium text-stone-800">{sub.name}</span>
                                <span className="text-xs text-stone-500">ID: {sub.id}</span>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit({ id: sub.id, name: sub.name, parent_id: category.id })}
                                  className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                                  title={`Editar ${sub.name}`}
                                >
                                  <Edit className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                  onClick={() => handleDelete(sub.id)}
                                  className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                                  title={`Eliminar ${sub.name}`}
                                >
                                  <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {((viewMode === 'list' && filteredCategories.length === 0) || (viewMode === 'hierarchy' && hierarchyData.length === 0)) && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="text-4xl mb-4">
              <Tags className="w-16 h-16 text-stone-400 mx-auto" />
            </div>
            <div className="text-stone-600 text-lg font-medium">No hay categorías para mostrar</div>
            <div className="text-stone-500 text-sm mt-2">Las categorías aparecerán aquí cuando las agregues</div>
          </div>
        )}

        {/* Modal para agregar/editar categoría */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                <h2 className="text-2xl font-bold text-stone-800">
                    {editingId ? 'Editar Categoría' : (isSubcategory ? 'Agregar Subcategoría' : 'Agregar Categoría Principal')}
                </h2>
                  <p className="text-sm text-stone-600 mt-1">
                    {editingId 
                      ? 'Modifica los datos de la categoría' 
                      : (isSubcategory 
                          ? 'Crea una nueva subcategoría bajo una categoría principal' 
                          : 'Crea una nueva categoría principal')
                    }
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
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
                {/* Indicador de tipo de categoría */}
                {!editingId && (
                  <div className="flex items-center space-x-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                    {isSubcategory ? (
                      <>
                        <FolderOpen className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">Creando Subcategoría</span>
                      </>
                    ) : (
                      <>
                        <Folder className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Creando Categoría Principal</span>
                      </>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Nombre de la Categoría*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    placeholder="Nombre de la categoría"
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-stone-900"
                    required
                  />
                </div>

                {(isSubcategory || editingId) && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                      {isSubcategory ? 'Categoría Padre *' : 'Categoría Padre (opcional)'}
                  </label>
                  <select
                    name="parent_id"
                    value={form.parent_id || ""}
                    onChange={handleChange}
                      required={isSubcategory}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-stone-900"
                  >
                      <option value="" className="text-stone-900">{isSubcategory ? 'Selecciona una categoría principal' : 'Sin categoría padre'}</option>
                    {categories.filter(c => !c.parent_id).map(cat => (
                        <option key={cat.id} value={cat.id} className="text-stone-900">{cat.name}</option>
                    ))}
                  </select>
                    {isSubcategory && (
                      <p className="text-xs text-stone-500 mt-1">
                        La subcategoría se creará bajo la categoría principal seleccionada
                      </p>
                    )}
                </div>
                )}

                {(isSubcategory || !isSubcategory) && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Imagen (opcional)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        disabled={isUploadingImage}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        onClick={() => fileInputRef.current?.click()}
                        className={`block w-full border border-stone-300 rounded-lg py-2 px-3 text-center cursor-pointer text-sm transition-colors text-stone-900 ${
                          isUploadingImage 
                            ? 'bg-stone-100 cursor-not-allowed' 
                            : 'bg-white hover:bg-stone-50'
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
                          className="h-12 w-12 rounded object-cover border border-stone-200"
                          onError={(e) => {
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
                </div>
                )}

                <div className="flex justify-between gap-3 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                    disabled={isSubmitting}
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