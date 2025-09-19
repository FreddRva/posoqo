"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useNotifications } from '@/hooks/useNotifications';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import Link from 'next/link';
import { 
  BarChart3, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Loader2,
  Bell,
  Activity,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { stats: notificationStats, loading: notificationsLoading, refreshNotifications } = useNotifications();
  const { stats: dashboardStats, loading: statsLoading, refreshStats } = useDashboardStats();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if ((session.user as any).role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Memoizar las alertas para evitar recálculos innecesarios
  const alerts = useMemo(() => {
    const newAlerts = [];

    // Alertas basadas en estadísticas reales
    if (dashboardStats.pendingOrders > 0) {
      newAlerts.push({
        type: 'orders',
        message: `¡Pedidos pendientes! Tienes ${dashboardStats.pendingOrders} pedidos esperando procesamiento`,
        color: 'bg-gradient-to-r from-orange-500 to-red-500',
        icon: <ShoppingCart className="w-6 h-6" />,
        priority: 'high',
        link: '/dashboard/orders'
      });
    }

    if (dashboardStats.users > 0) {
      newAlerts.push({
        type: 'users',
        message: `¡Usuarios activos! ${dashboardStats.activeUsers} de ${dashboardStats.users} usuarios están activos`,
        color: 'bg-gradient-to-r from-blue-500 to-purple-500',
        icon: <Users className="w-6 h-6" />,
        priority: 'medium',
        link: '/dashboard/users'
      });
    }

    if (dashboardStats.products > 0) {
      newAlerts.push({
        type: 'products',
        message: `¡Catálogo actualizado! Tienes ${dashboardStats.products} productos disponibles`,
        color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        icon: <Package className="w-6 h-6" />,
        priority: 'medium',
        link: '/dashboard/products'
      });
    }

    if (dashboardStats.services > 0) {
      newAlerts.push({
        type: 'services',
        message: `¡Servicios disponibles! ${dashboardStats.services} servicios están configurados`,
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        icon: <Settings className="w-6 h-6" />,
        priority: 'low',
        link: '/dashboard/services'
      });
    }

    return newAlerts;
  }, [dashboardStats]);

  // Memoizar las estadísticas para evitar recálculos
  const statsCards = useMemo(() => [
    {
      title: 'Total Pedidos',
      value: dashboardStats.orders,
      subtitle: `${dashboardStats.pendingOrders} pendientes`,
      icon: <ShoppingCart className="w-8 h-8 text-blue-600" />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      trend: dashboardStats.pendingOrders > 0 ? 'Pendientes' : 'Al día',
      trendColor: dashboardStats.pendingOrders > 0 ? 'text-orange-600' : 'text-green-600',
      link: '/dashboard/orders'
    },
    {
      title: 'Usuarios Activos',
      value: dashboardStats.activeUsers,
      subtitle: `de ${dashboardStats.users} total`,
      icon: <Users className="w-8 h-8 text-green-600" />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      trend: `${Math.round((dashboardStats.activeUsers / Math.max(dashboardStats.users, 1)) * 100)}% activos`,
      trendColor: 'text-green-600',
      link: '/dashboard/users'
    },
    {
      title: 'Productos',
      value: dashboardStats.products,
      subtitle: 'en catálogo',
      icon: <Package className="w-8 h-8 text-purple-600" />,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      trend: 'Disponibles',
      trendColor: 'text-green-600',
      link: '/dashboard/products'
    },
    {
      title: 'Ingresos Totales',
      value: `S/ ${dashboardStats.totalRevenue.toFixed(2)}`,
      subtitle: 'desde el inicio',
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      trend: 'Revenue',
      trendColor: 'text-green-600',
      link: '/dashboard/orders'
    }
  ], [dashboardStats]);

  const quickActions = useMemo(() => [
    {
      title: 'Gestionar Pedidos',
      icon: <ShoppingCart className="w-8 h-8 text-blue-600" />,
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      link: '/dashboard/orders'
    },
    {
      title: 'Agregar Productos',
      icon: <Plus className="w-8 h-8 text-green-600" />,
      bgColor: 'bg-green-50 hover:bg-green-100',
      link: '/dashboard/products'
    },
    {
      title: 'Ver Usuarios',
      icon: <Users className="w-8 h-8 text-purple-600" />,
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      link: '/dashboard/users'
    },
    {
      title: 'Ver Reportes',
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      link: '/dashboard/reports'
    }
  ], []);

  const handleRefresh = () => {
    refreshNotifications();
    refreshStats();
    setLastUpdate(new Date());
  };

  if (statsLoading || notificationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin w-16 h-16 text-blue-500 mx-auto mb-4" />
          <p className="text-blue-400 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header del Dashboard */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-8 shadow-2xl border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 rounded-xl p-3">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Panel de Administración</h1>
                <p className="text-gray-300 text-lg">Bienvenido, {(session?.user as any)?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Actualizar</span>
              </button>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Última actualización</span>
                </div>
                <p className="text-white font-medium">{lastUpdate.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas Importantes */}
        {alerts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-800">Alertas Importantes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert, index) => (
                <Link key={index} href={alert.link}>
                  <div className={`${alert.color} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer`}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white bg-opacity-20 rounded-lg p-2">
                        {alert.icon}
                      </div>
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Activity className="w-4 h-4" />
                          <span className="text-sm opacity-90">
                            {alert.priority === 'high' ? 'Alta prioridad' : 
                             alert.priority === 'medium' ? 'Prioridad media' : 'Baja prioridad'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <Link key={index} href={card.link}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                    {card.subtitle && (
                      <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
                    )}
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className={`text-sm ${card.trendColor}`}>{card.trend}</span>
                    </div>
                  </div>
                  <div className={`${card.bgColor} rounded-xl p-3`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-800">Acciones Rápidas</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <div className={`flex flex-col items-center space-y-2 p-4 rounded-lg ${action.bgColor} transition-all duration-200 hover:scale-105 cursor-pointer`}>
                  {action.icon}
                  <span className="text-sm font-medium text-gray-700">{action.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-800">Estado del Sistema</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">Servidor</p>
                <p className="text-sm text-green-600">Operativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">Base de Datos</p>
                <p className="text-sm text-green-600">Conectada</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">API</p>
                <p className="text-sm text-green-600">Funcionando</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 