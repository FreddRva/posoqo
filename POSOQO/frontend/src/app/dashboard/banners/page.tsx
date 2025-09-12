"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
  position: string;
  created_at: string;
  updated_at: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ data: any[] }>('/admin/banners/list');
      if (response.data) {
        setBanners(response.data);
      }
    } catch (error) {
      console.error('Error cargando banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const getStatusColor = (active: boolean) => {
    return active ? 
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Activo
      </span> :
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Inactivo
      </span>;
  };

  const filteredBanners = banners.filter(banner => {
    if (filter === 'all') return true;
    return banner.is_active === (filter === 'active');
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Banners</h1>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="all">Todos los banners</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium">
            + Agregar Banner
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                {banner.image_url ? (
                  <img 
                    src={banner.image_url} 
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Sin imagen
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusColor(banner.is_active)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{banner.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{banner.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {banner.position}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-yellow-600 hover:text-yellow-900 text-sm">
                      Editar
                    </button>
                    <button className="text-red-600 hover:text-red-900 text-sm">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredBanners.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No hay banners para mostrar</div>
        </div>
      )}
    </div>
  );
} 