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

  const handleRefresh = () => {
    refreshNotifications();
    refreshStats();
    setLastUpdate(new Date());
  };

  if (statsLoading || notificationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-yellow-300 text-2xl font-bold"
          >
            Cargando Dashboard Premium...
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1 w-64 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-full mt-4 mx-auto"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 md:p-8 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-10">
        {/* Header del Dashboard - Premium */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-yellow-400/20 overflow-hidden"
        >
          {/* Efectos decorativos */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-amber-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-2xl p-4">
                  <Award className="w-8 h-8 text-black" />
                </div>
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent"
                >
                  Dashboard Premium
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-sm md:text-base mt-1 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Bienvenido, <span className="text-yellow-300 font-semibold">{(session?.user as any)?.name}</span>
                </motion.p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 hover:from-yellow-400/30 hover:to-amber-500/30 rounded-xl border border-yellow-400/30 transition-all duration-300 group w-full md:w-auto justify-center"
              >
                <RefreshCw className="w-4 h-4 text-yellow-300 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-yellow-200 text-sm font-medium">Actualizar</span>
              </motion.button>
              
              <div className="text-left md:text-right">
                <div className="flex items-center space-x-2 text-gray-500 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Última actualización</span>
                </div>
                <p className="text-yellow-200 font-medium text-sm mt-0.5">
                  {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alertas Importantes - Premium */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Bell className="w-6 h-6 text-yellow-400" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  Alertas del Sistema
                </h2>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full"
                >
                  <span className="text-red-400 text-xs font-bold">{alerts.length}</span>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <Link href={alert.link}>
                      <div className="relative group overflow-hidden rounded-2xl">
                        {/* Efecto de brillo en hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                        
                        <div className={`relative ${alert.color} p-6 text-white shadow-2xl cursor-pointer border border-white/10`}>
                          <div className="flex items-start space-x-4">
                            <motion.div
                              whileHover={{ rotate: 360, scale: 1.2 }}
                              transition={{ duration: 0.6 }}
                              className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex-shrink-0"
                            >
                              {alert.icon}
                            </motion.div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm md:text-base mb-2">{alert.message}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {alert.priority === 'high' && <Zap className="w-4 h-4" />}
                                  {alert.priority === 'medium' && <Activity className="w-4 h-4" />}
                                  {alert.priority === 'low' && <Info className="w-4 h-4" />}
                                  <span className="text-xs opacity-90 font-medium">
                                    {alert.priority === 'high' ? 'Urgente' : 
                                     alert.priority === 'medium' ? 'Normal' : 'Info'}
                                  </span>
                                </div>
                                <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estadísticas Principales - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Métricas de Rendimiento
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statsCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link href={card.link}>
                  <div className="relative group h-full">
                    {/* Efecto de brillo dorado */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />

                    <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300 h-full">
                      {/* Decoración superior */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/5 to-transparent rounded-bl-full" />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <p className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider mb-2">
                              {card.title}
                            </p>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-200 to-amber-400 bg-clip-text text-transparent"
                            >
                              {card.value}
                            </motion.p>
                            {card.subtitle && (
                              <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
                            )}
                          </div>
                          
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.2 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                          >
                            <div className={`${card.bgColor} rounded-xl p-3 border border-yellow-400/20 shadow-lg`}>
                              {card.icon}
                            </div>
                          </motion.div>
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {card.trend.includes('Pendientes') || card.trendColor === 'text-orange-600' ? (
                              <AlertCircle className="w-4 h-4 text-orange-400" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            )}
                            <span className={`text-xs md:text-sm font-semibold ${
                              card.trendColor === 'text-orange-600' ? 'text-orange-400' : 
                              card.trendColor === 'text-green-600' ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              {card.trend}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Acciones Rápidas - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-yellow-400/20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Acciones Rápidas
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={action.link}>
                  <div className="relative group">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className={`relative flex flex-col items-center space-y-3 p-4 md:p-5 rounded-xl ${action.bgColor.replace('50', '900/50').replace('100', '800/50')} border border-yellow-400/10 group-hover:border-yellow-400/30 transition-all duration-300 cursor-pointer backdrop-blur-sm`}>
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {action.icon}
                      </motion.div>
                      <span className="text-xs md:text-sm font-semibold text-gray-300 text-center group-hover:text-yellow-300 transition-colors">
                        {action.title}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Estado del Sistema - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-yellow-400/20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-200 to-emerald-400 bg-clip-text text-transparent">
              Estado del Sistema
            </h2>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
            >
              <span className="text-green-400 text-xs font-bold">Online</span>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Server className="w-7 h-7" />, label: 'Servidor Backend', status: 'Operativo', color: 'green' },
              { icon: <Database className="w-7 h-7" />, label: 'Base de Datos', status: 'Conectada', color: 'green' },
              { icon: <Wifi className="w-7 h-7" />, label: 'API REST', status: 'Activa', color: 'green' }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="relative group"
              >
                <div className={`flex items-center space-x-4 p-4 rounded-xl bg-${service.color}-500/10 border border-${service.color}-500/20 group-hover:border-${service.color}-500/40 transition-all duration-300`}>
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(34, 197, 94, 0.4)',
                        '0 0 0 10px rgba(34, 197, 94, 0)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`bg-${service.color}-500/20 rounded-lg p-3 text-${service.color}-400 flex-shrink-0`}
                  >
                    {service.icon}
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-200 text-sm md:text-base">{service.label}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`w-2 h-2 rounded-full bg-${service.color}-400`}
                      />
                      <p className={`text-xs md:text-sm font-medium text-${service.color}-400`}>{service.status}</p>
                    </div>
                  </div>
                  <CheckCircle className={`w-5 h-5 text-${service.color}-400 opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 