"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import OrderMap from '@/components/OrderMap';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  Phone,
  Mail,
  MapPinned,
  CreditCard,
  ArrowRight,
  Eye,
  RefreshCw,
  AlertCircle
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      await apiFetch<{ success: boolean; error?: string }>(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('notification-update'));
      }, 1000);
    } catch (error) {
      console.error('Error actualizando pedido:', error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recibido': return { bg: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/40', text: 'text-blue-300', glow: 'shadow-blue-500/20' };
      case 'preparando': return { bg: 'from-yellow-500/20 to-yellow-600/20', border: 'border-yellow-500/40', text: 'text-yellow-300', glow: 'shadow-yellow-500/20' };
      case 'camino': return { bg: 'from-orange-500/20 to-orange-600/20', border: 'border-orange-500/40', text: 'text-orange-300', glow: 'shadow-orange-500/20' };
      case 'entregado': return { bg: 'from-green-500/20 to-green-600/20', border: 'border-green-500/40', text: 'text-green-300', glow: 'shadow-green-500/20' };
      case 'cancelado': return { bg: 'from-red-500/20 to-red-600/20', border: 'border-red-500/40', text: 'text-red-300', glow: 'shadow-red-500/20' };
      default: return { bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500/40', text: 'text-gray-300', glow: 'shadow-gray-500/20' };
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
      totalRevenue: orders.filter(o => o.status === 'entregado').reduce((sum, o) => sum + o.total, 0)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
            <p className="text-stone-600">Cargando Pedidos...</p>
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
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Gestión de Pedidos</h1>
            <p className="text-stone-600">Control total de órdenes en tiempo real</p>
          </div>
          <button
            onClick={loadOrders}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { label: 'Total', value: stats.total, icon: <TrendingUp className="w-8 h-8 text-blue-600" />, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
            { label: 'Recibidos', value: stats.recibido, icon: <Package className="w-8 h-8 text-green-600" />, bgColor: 'bg-green-100', textColor: 'text-green-600' },
            { label: 'Preparando', value: stats.preparando, icon: <ChefHat className="w-8 h-8 text-yellow-600" />, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
            { label: 'En Camino', value: stats.camino, icon: <Truck className="w-8 h-8 text-orange-600" />, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
            { label: 'Entregados', value: stats.entregado, icon: <CheckCircle className="w-8 h-8 text-green-600" />, bgColor: 'bg-green-100', textColor: 'text-green-600' },
            { label: 'Cancelados', value: stats.cancelado, icon: <XCircle className="w-8 h-8 text-red-600" />, bgColor: 'bg-red-100', textColor: 'text-red-600' }
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
                  <div className="text-stone-600 text-sm font-medium">{stat.label}</div>
                </div>
                <div className={stat.bgColor}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Buscar Pedidos</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ID, cliente, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 placeholder-stone-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Filtrar por Estado</label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

        {/* Lista de Pedidos Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-yellow-400/20"
              >
                <Package className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-medium">No hay pedidos para mostrar</p>
                <p className="text-gray-500 text-sm mt-2">Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
              </motion.div>
            ) : (
              filteredOrders.map((order, index) => {
                const statusColor = getStatusColor(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="relative group"
                  >
                    <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300 shadow-xl">
                      {/* Header del pedido */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-xl p-3 border border-yellow-400/30">
                            <Package className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-200">Pedido #{order.id.slice(-8)}</div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${statusColor.bg} border ${statusColor.border} rounded-xl ${statusColor.glow} shadow-lg`}>
                          {getStatusIcon(order.status)}
                          <span className={`font-bold text-sm uppercase ${statusColor.text}`}>{order.status}</span>
                        </div>
                      </div>

                      {/* Grid de información */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Cliente */}
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase">Cliente</span>
                          </div>
                          <div className="text-gray-200 font-medium">{order.user_name || 'Cliente'}</div>
                          <div className="text-gray-500 text-sm">{order.user_email}</div>
                        </div>

                        {/* Contacto */}
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                          <div className="flex items-center space-x-2 mb-2">
                            <Phone className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase">Contacto</span>
                          </div>
                          <div className="text-gray-200 font-medium">{order.phone || 'No especificado'}</div>
                          <div className="text-gray-500 text-sm">DNI: {order.dni || 'N/A'}</div>
                        </div>

                        {/* Total */}
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase">Total</span>
                          </div>
                          <div className="text-2xl font-black bg-gradient-to-r from-yellow-200 to-amber-400 bg-clip-text text-transparent">
                            S/ {order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Mapa */}
                      {order.lat && order.lng && (
                        <div className="mb-4">
                          <OrderMap lat={order.lat} lng={order.lng} location={order.location} orderId={order.id} />
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order.id, 'preparando')}
                          disabled={order.status !== 'recibido'}
                          className="px-4 py-2 text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Preparar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order.id, 'camino')}
                          disabled={order.status !== 'preparando'}
                          className="px-4 py-2 text-sm font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-xl hover:bg-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Enviar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order.id, 'entregado')}
                          disabled={order.status !== 'camino'}
                          className="px-4 py-2 text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl hover:bg-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Entregado
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateOrderStatus(order.id, 'cancelado')}
                          disabled={order.status === 'entregado' || order.status === 'cancelado'}
                          className="px-4 py-2 text-sm font-medium bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Cancelar
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
