"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { 
  ShoppingBagIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  XCircleIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case 'recibido':
      return {
        icon: <ClockIcon className="w-5 h-5" />,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
        text: 'Recibido'
      };
    case 'preparando':
      return {
        icon: <ShoppingBagIcon className="w-5 h-5" />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        text: 'Preparando'
      };
    case 'camino':
      return {
        icon: <TruckIcon className="w-5 h-5" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10',
        text: 'En Camino'
      };
    case 'entregado':
      return {
        icon: <CheckCircleIcon className="w-5 h-5" />,
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        text: 'Entregado'
      };
    case 'cancelado':
      return {
        icon: <XCircleIcon className="w-5 h-5" />,
        color: 'text-red-400',
        bgColor: 'bg-red-400/10',
        text: 'Cancelado'
      };
    default:
      return {
        icon: <ClockIcon className="w-5 h-5" />,
        color: 'text-stone-400',
        bgColor: 'bg-stone-400/10',
        text: status
      };
  }
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const loadOrders = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      const response = await apiFetch<{ orders: any[]; pagination: any }>('/protected/orders');
      console.log('🔍 [ORDERS] Respuesta del backend:', response);
      
      if (response.orders) {
        // Mapear los datos del backend al formato esperado por el frontend
        const mappedOrders = response.orders.map((order: any) => ({
          id: order.id,
          user_id: order.user_id || '',
          total_amount: order.total,
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at,
          location: order.location,
          items: [] // Los items se cargarán por separado si es necesario
        }));
        
        console.log('🔍 [ORDERS] Pedidos mapeados:', mappedOrders);
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [session]);

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-yellow-400 mb-4">Acceso Requerido</h1>
            <p className="text-stone-300 mb-8">Debes iniciar sesión para ver tus pedidos</p>
            <Link
              href="/login"
              className="px-6 py-3 bg-amber-400 text-stone-900 font-bold rounded-full hover:bg-amber-300 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
            📦 Mis Pedidos
          </h1>
          <p className="text-stone-300 text-lg">
            Historial de todos tus pedidos y su estado actual
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-stone-300 mb-4">No tienes pedidos aún</h2>
            <p className="text-stone-400 mb-8">
              Realiza tu primer pedido para ver el historial aquí
            </p>
            <Link
              href="/products"
              className="px-6 py-3 bg-amber-400 text-stone-900 font-bold rounded-full hover:bg-amber-300 transition-colors"
            >
              Hacer Mi Primer Pedido
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {orders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              
              return (
                <motion.div
                  key={order.id}
                  className="bg-stone-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-yellow-400/20 hover:shadow-2xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Información del pedido */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-xl font-bold text-yellow-100">
                            Pedido #{order.id.slice(-8)}
                          </h3>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span className="text-sm font-semibold">{statusInfo.text}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-stone-400">Total:</span>
                            <div className="text-green-400 font-bold">
                              S/ {order.total_amount.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-400">Fecha:</span>
                            <div className="text-stone-300">
                              {new Date(order.created_at).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-400">Hora:</span>
                            <div className="text-stone-300">
                              {new Date(order.created_at).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div>
                            <span className="text-stone-400">Items:</span>
                            <div className="text-stone-300">
                              {order.items?.length || 0} producto{order.items?.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botón ver detalles */}
                      <button
                        onClick={() => openOrderModal(order)}
                        className="flex items-center gap-2 bg-stone-700 text-yellow-300 hover:bg-stone-600 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Contador de pedidos */}
        {orders.length > 0 && (
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-stone-400">
              Tienes <span className="text-yellow-400 font-bold">{orders.length}</span> pedido{orders.length !== 1 ? 's' : ''} en total
            </p>
          </motion.div>
        )}

        {/* Modal de detalles del pedido */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-stone-900 rounded-2xl shadow-2xl border border-yellow-400/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header del modal */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-yellow-100">
                      Pedido #{selectedOrder.id.slice(-8)}
                    </h2>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mt-2 ${getStatusInfo(selectedOrder.status).bgColor} ${getStatusInfo(selectedOrder.status).color}`}>
                      {getStatusInfo(selectedOrder.status).icon}
                      <span className="text-sm font-semibold">{getStatusInfo(selectedOrder.status).text}</span>
                    </div>
                  </div>
                  <button
                    onClick={closeOrderModal}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Información del pedido */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-stone-400 text-sm">Total del Pedido:</span>
                      <div className="text-2xl font-bold text-green-400">
                        S/ {selectedOrder.total_amount.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-stone-400 text-sm">Fecha de Creación:</span>
                      <div className="text-stone-300">
                        {new Date(selectedOrder.created_at).toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>

                  {/* Items del pedido */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-100 mb-4">Productos del Pedido</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 bg-stone-800/50 rounded-lg p-4">
                            <div className="w-16 h-16 bg-stone-700 rounded-lg flex items-center justify-center">
                              {item.image_url ? (
                                <img
                                  src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:4000${item.image_url}`}
                                  alt={item.product_name}
                                  className="w-full h-full object-contain rounded-lg"
                                />
                              ) : (
                                <span className="text-stone-400">📦</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-stone-200">{item.product_name}</h4>
                              <p className="text-stone-400 text-sm">
                                Cantidad: {item.quantity} x S/ {item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-400">
                                S/ {(item.quantity * item.price).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 