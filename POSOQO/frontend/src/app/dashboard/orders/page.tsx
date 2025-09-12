"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import OrderMap from '@/components/OrderMap';
import { 
  Package, 
  ChefHat, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Loader2
} from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  user_name?: string;
  user_last_name?: string;
  user_email?: string;
  dni?: string;
  phone?: string;
  total: number;
  status: string;
  location?: string;
  lat?: number;
  lng?: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  address?: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ data: any[] }>('/admin/orders/list');
      if ((response as any).data) {
        setOrders((response as any).data);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiFetch<{ success: boolean }>(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      
      // Actualizar el estado local
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      // NO crear notificación aquí - el backend ya la crea automáticamente
      console.log(`✅ Estado del pedido #${orderId.slice(-8)} actualizado a: ${newStatus}`);
      
      // Esperar un momento y luego actualizar notificaciones
      setTimeout(() => {
        // Disparar un evento personalizado para actualizar notificaciones
        window.dispatchEvent(new CustomEvent('notification-update'));
      }, 1000);
    } catch (error) {
      console.error('Error actualizando pedido:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiFetch<{ success: boolean }>(`/admin/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recibido': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparando': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'camino': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'entregado': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recibido': return <Package className="w-5 h-5" />;
      case 'preparando': return <ChefHat className="w-5 h-5" />;
      case 'camino': return <Truck className="w-5 h-5" />;
      case 'entregado': return <CheckCircle className="w-5 h-5" />;
      case 'cancelado': return <XCircle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      recibido: orders.filter(o => o.status === 'recibido').length,
      preparando: orders.filter(o => o.status === 'preparando').length,
      camino: orders.filter(o => o.status === 'camino').length,
      entregado: orders.filter(o => o.status === 'entregado').length,
      cancelado: orders.filter(o => o.status === 'cancelado').length,
    };
    return stats;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user_name && order.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user_email && order.user_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || order.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const stats = getOrderStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
      {/* Header con estadísticas */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Panel de Pedidos</h1>
            <p className="text-stone-600">Gestiona todos los pedidos de tu restaurante</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-stone-800">{stats.total}</div>
              <div className="text-stone-500 text-sm">Total Pedidos</div>
            </div>
          </div>
        </div>

        {/* Estadísticas con diseño mejorado */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.recibido}</div>
                <div className="text-stone-600 text-sm font-medium">Recibidos</div>
              </div>
              <div className="text-blue-600">
                <Package className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">{stats.preparando}</div>
                <div className="text-stone-600 text-sm font-medium">Preparando</div>
              </div>
              <div className="text-yellow-600">
                <ChefHat className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{stats.camino}</div>
                <div className="text-stone-600 text-sm font-medium">En Camino</div>
              </div>
              <div className="text-orange-600">
                <Truck className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.entregado}</div>
                <div className="text-stone-600 text-sm font-medium">Entregados</div>
              </div>
              <div className="text-green-600">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{stats.cancelado}</div>
                <div className="text-stone-600 text-sm font-medium">Cancelados</div>
              </div>
              <div className="text-red-600">
                <XCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda con diseño mejorado */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-stone-700 mb-2">Buscar Pedidos</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ID, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <option value="all">Todos los pedidos</option>
                <option value="recibido">Recibidos</option>
                <option value="preparando">Preparando</option>
                <option value="camino">En Camino</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos con diseño mejorado */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
            <p className="text-stone-600">Cargando pedidos...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Datos de Entrega
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Total
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
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-stone-900">
                        #{order.id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="bg-stone-100 rounded-full p-2">
                          <User className="w-4 h-4 text-stone-600" />
                        </div>
                        <div>
                          <div className="text-sm text-stone-900 font-medium">
                            {order.user_name || 'Cliente'}
                          </div>
                          <div className="text-sm text-stone-500">
                            {order.user_email || order.user_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-stone-900 space-y-2">
                        <div className="font-medium">
                          {order.user_name} {order.user_last_name}
                        </div>
                        <div className="text-stone-500 text-xs space-y-1">
                          <div>DNI: {order.dni || 'No especificado'}</div>
                          <div>Teléfono: {order.phone || 'No especificado'}</div>
                          <div>Email: {order.user_email}</div>
                        </div>
                        <OrderMap 
                          lat={order.lat} 
                          lng={order.lng} 
                          location={order.location}
                          orderId={order.id}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div className="text-sm font-semibold text-stone-900">
                          S/ {order.total.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <div className="text-sm text-stone-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparando')}
                          disabled={order.status === 'preparando' || order.status === 'camino' || order.status === 'entregado' || order.status === 'cancelado'}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Preparar
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'camino')}
                          disabled={order.status !== 'preparando'}
                          className="px-3 py-1 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Enviar
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'entregado')}
                          disabled={order.status !== 'camino'}
                          className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Entregado
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelado')}
                          disabled={order.status === 'entregado' || order.status === 'cancelado'}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-stone-200">
          <div className="text-4xl mb-4">
            <Package className="w-16 h-16 text-stone-400 mx-auto" />
          </div>
          <div className="text-stone-600 text-lg font-medium">No hay pedidos para mostrar</div>
          <div className="text-stone-500 text-sm mt-2">Los pedidos aparecerán aquí cuando los clientes realicen compras</div>
        </div>
      )}
    </div>
  );
} 