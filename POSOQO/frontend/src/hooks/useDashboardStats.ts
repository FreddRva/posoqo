import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useSession } from 'next-auth/react';

export interface DashboardStats {
  orders: number;
  users: number;
  products: number;
  services: number;
  totalRevenue: number;
  pendingOrders: number;
  activeUsers: number;
}

export function useDashboardStats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    orders: 0,
    users: 0,
    products: 0,
    services: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    if (!session || (session.user as any)?.role !== 'admin') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Obtener estadísticas reales del sistema
      const [ordersRes, usersRes, productsRes, servicesRes] = await Promise.all([
        apiFetch('/admin/orders/list?limit=1000'),
        apiFetch('/admin/users/list'),
        apiFetch('/products'),
        apiFetch('/admin/services/list')
      ]);

      // Procesar pedidos
      const orders = (ordersRes as any)?.data || [];
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((order: any) => 
        order.status === 'pending' || order.status === 'processing'
      ).length;

      // Procesar usuarios
      const users = (usersRes as any)?.data || [];
      const totalUsers = users.length;
      const activeUsers = users.filter((user: any) => 
        user.is_active !== false
      ).length;

      // Procesar productos
      const products = (productsRes as any)?.data || [];
      const totalProducts = products.length;

      // Procesar servicios
      const services = (servicesRes as any)?.data || [];
      const totalServices = services.length;

      // Calcular ingresos totales
      const totalRevenue = orders.reduce((sum: number, order: any) => {
        return sum + (parseFloat(order.total) || 0);
      }, 0);

      setStats({
        orders: totalOrders,
        users: totalUsers,
        products: totalProducts,
        services: totalServices,
        totalRevenue,
        pendingOrders,
        activeUsers
      });

    } catch (error) {
      console.error('Error cargando estadísticas del dashboard:', error);
      // Mantener valores por defecto en caso de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadStats();
      
      // Polling cada 2 minutos (menos frecuente para evitar recargas)
      const interval = setInterval(loadStats, 120000);
      
      return () => clearInterval(interval);
    }
  }, [session]);

  const refreshStats = () => {
    loadStats();
  };

  return {
    stats,
    loading,
    refreshStats
  };
}
