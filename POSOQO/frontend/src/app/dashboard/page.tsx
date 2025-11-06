"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useNotifications } from '@/hooks/useNotifications';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw,
  TrendingDown,
  DollarSign,
  Zap,
  Award,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Shield,
  Database,
  Server,
  Wifi,
  AlertCircle,
  Info,
  ChevronRight
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

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshNotifications(), refreshStats()]);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  if (statsLoading || notificationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
          <p className="text-stone-700">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">Dashboard</h1>
            <p className="text-stone-600">Bienvenido, {session?.user?.name}</p>
          </div>
          <button
            onClick={handleRefreshAll}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 font-semibold"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Alerts Section - simplificado */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-stone-800">Alertas Importantes</h2>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert, index) => (
                <Link
                  key={index}
                  href={alert.link}
                  className="block p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors border border-stone-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">{alert.icon}</div>
                    <p className="text-stone-700 text-sm">{alert.message}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards - simplificado sin motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Link
              key={index}
              href={stat.link}
              className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
                <div className="text-stone-600 text-sm font-medium mt-1">{stat.subtitle}</div>
                <div className={`text-xs font-semibold mt-2 ${stat.trendColor}`}>{stat.trend}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions - simplificado */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className={`${action.bgColor} rounded-lg p-4 text-center transition-colors`}
              >
                <div className="mx-auto mb-2">{action.icon}</div>
                <p className="text-stone-800 text-sm font-medium">{action.title}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* System Status - simplificado */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-4">Estado del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-green-600" />
                <span className="text-stone-800 font-medium">Base de Datos</span>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Server className="w-6 h-6 text-green-600" />
                <span className="text-stone-800 font-medium">Servidor</span>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Wifi className="w-6 h-6 text-green-600" />
                <span className="text-stone-800 font-medium">Conexión</span>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
    </div>
  );
}