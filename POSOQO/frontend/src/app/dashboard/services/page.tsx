"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { 
  Wrench, 
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
  Eye,
  EyeOff,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    service: Service | null;
  }>({
    isOpen: false,
    service: null
  });
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ data: any[] }>('/admin/services/list');
      if (response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de alerta
  const showSuccessAlert = (title: string, message: string) => {
    setAlert({
      show: true,
      type: 'success',
      title,
      message
    });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
  };

  const showErrorAlert = (title: string, message: string) => {
    setAlert({
      show: true,
      type: 'error',
      title,
      message
    });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
  };

  const handleEdit = (service: Service) => {
    setEditModal({
      isOpen: true,
      service: service
    });
  };

  const handleCloseModal = () => {
    setEditModal({
      isOpen: false,
      service: null
    });
  };

  const handleSaveService = async (updatedService: Service) => {
    try {
      console.log('Guardando servicio:', updatedService);
      
      const isNewService = !updatedService.id || updatedService.id === '';
      
      let response;
      if (isNewService) {
        // Crear nuevo servicio
        response = await apiFetch<{ success: boolean; error?: string; id?: string }>(`/protected/admin/services`, {
          method: 'POST',
          body: JSON.stringify({
            name: updatedService.name,
            description: updatedService.description,
            image_url: updatedService.image_url,
            is_active: updatedService.is_active
          })
        });
      } else {
        // Actualizar servicio existente
        response = await apiFetch<{ success: boolean; error?: string }>(`/protected/admin/services/${updatedService.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: updatedService.name,
          description: updatedService.description,
          image_url: updatedService.image_url,
          is_active: updatedService.is_active
        })
      });
      }
      
      if (response.success) {
        // Recargar siempre para reflejar lo guardado en DB (y evitar estados obsoletos)
        await loadServices();
        showSuccessAlert(isNewService ? 'Servicio creado' : 'Servicio actualizado', 'Los cambios han sido guardados correctamente');
        handleCloseModal();
      } else {
        throw new Error(response.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando servicio:', error);
      showErrorAlert('Error al guardar', 'No se pudo guardar el servicio. Intenta de nuevo.');
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return;
    }
    
    try {
      console.log('Eliminando servicio:', serviceId);
      
      const response = await apiFetch<{ success: boolean; error?: string }>(`/protected/admin/services/${serviceId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        // Remover del estado local
        setServices(prev => prev.filter(s => s.id !== serviceId));
        
        // Mostrar notificación de éxito
        showSuccessAlert('Servicio eliminado', 'El servicio ha sido eliminado correctamente');
      } else {
        throw new Error(response.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      showErrorAlert('Error al eliminar', 'No se pudo eliminar el servicio. Intenta de nuevo.');
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const getStatusColor = (active: boolean) => {
    return active 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };


  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && service.is_active) ||
                         (filter === 'inactive' && !service.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const getServiceStats = () => {
    return {
      total: services.length,
      active: services.filter(s => s.is_active).length,
      inactive: services.filter(s => !s.is_active).length
    };
  };

  const stats = getServiceStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
          <p className="text-stone-700">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Gestión de Servicios</h1>
            <p className="text-stone-600">Administra los servicios de tu restaurante</p>
          </div>
          <button
            onClick={() => setEditModal({ isOpen: true, service: null })}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Servicio</span>
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-stone-800">{stats.total}</div>
                <div className="text-stone-600 text-sm font-medium">Total Servicios</div>
              </div>
              <div className="text-blue-600">
                <Wrench className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                <div className="text-stone-600 text-sm font-medium">Servicios Activos</div>
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
                <div className="text-stone-600 text-sm font-medium">Servicios Inactivos</div>
              </div>
              <div className="text-red-600">
                <EyeOff className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-2">Buscar Servicios</label>
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
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">Todos los servicios</option>
                  <option value="active">Solo activos</option>
                  <option value="inactive">Solo inactivos</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de servicios */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12">
                          {service.image_url ? (
                            <img
                              className="w-12 h-12 rounded-lg object-cover"
                              src={service.image_url.startsWith('http') ? service.image_url : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://posoqo-backend.onrender.com'}${service.image_url}`}
                              alt={service.name}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget.parentElement?.querySelector('.image-placeholder');
                                if (placeholder) {
                                  (placeholder as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`image-placeholder w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center ${service.image_url ? 'hidden' : ''}`}>
                            <ImageIcon className="w-6 h-6 text-stone-400" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-stone-900">{service.name}</div>
                          <div className="text-sm text-stone-500 whitespace-pre-line">{service.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {service.is_active ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(service.is_active)}`}>
                          {service.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <div className="text-sm text-stone-500">
                          {new Date(service.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
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

        {filteredServices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="text-4xl mb-4">
              <Wrench className="w-16 h-16 text-stone-400 mx-auto" />
            </div>
            <div className="text-stone-600 text-lg font-medium">No hay servicios para mostrar</div>
            <div className="text-stone-500 text-sm mt-2">Los servicios aparecerán aquí cuando los agregues</div>
          </div>
        )}

        {/* Modal de edición */}
        {editModal.isOpen && (
          <EditServiceModal
            service={editModal.service}
            isOpen={editModal.isOpen}
            onClose={handleCloseModal}
            onSave={handleSaveService}
          />
        )}

        {/* Alerta de notificaciones */}
        {alert.show && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border max-w-md ${
              alert.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {alert.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{alert.title}</h4>
                <p className="text-sm opacity-90">{alert.message}</p>
              </div>
              <button
                onClick={() => setAlert(prev => ({ ...prev, show: false }))}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

function EditServiceModal({ service, isOpen, onClose, onSave }: {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
}) {
  const [formData, setFormData] = useState<Service>({
    id: '',
    name: '',
    description: '',
    image_url: '',
    is_active: true,
    created_at: '',
    updated_at: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData(service);
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        image_url: '',
        is_active: true,
        created_at: '',
        updated_at: ''
      });
    }
  }, [service]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadImage(file);
    }
  };

  const handleUploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadImageToCloudinary(file);
      if (result.success && result.url) {
        console.log('✅ [CLOUDINARY] Imagen subida exitosamente:', result.url);
        handleInputChange('image_url', result.url);
      } else {
        throw new Error(result.error || 'Error al subir a Cloudinary');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert('Error al subir la imagen: ' + errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-stone-800">
            {service ? 'Editar Servicio' : 'Agregar Servicio'}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Nombre del Servicio*
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-stone-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Descripción*
            </label>
            <div className="text-xs text-stone-500 mb-2">
              Usa viñetas (•) para separar características del servicio
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={5}
              placeholder="• Característica 1&#10;• Característica 2&#10;• Característica 3"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-stone-900"
              required
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Imagen (opcional)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  disabled={isUploading}
                  className="hidden"
                  id="service-image-upload"
                />
                <label
                  htmlFor="service-image-upload"
                  className={`block w-full border border-stone-300 rounded-lg py-2 px-3 text-center cursor-pointer text-sm transition-colors ${
                    isUploading 
                      ? 'bg-stone-100 cursor-not-allowed' 
                      : 'bg-white hover:bg-stone-50'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="inline-block w-4 h-4 animate-spin mr-2" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {formData.image_url ? 'Cambiar' : 'Subir'} Imagen
                    </>
                  )}
                </label>
              </div>
              
              {formData.image_url && (
                <div className="relative">
                  <img
                    src={formData.image_url.startsWith('http') ? formData.image_url : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://posoqo-backend.onrender.com'}${formData.image_url}`}
                    alt="Vista previa"
                    className="h-12 w-12 rounded object-cover border border-stone-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('image_url', '')}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    title="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-stone-700">
              Servicio activo
            </label>
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 ${isUploading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {service ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isUploading ? 'Subiendo...' : (service ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 