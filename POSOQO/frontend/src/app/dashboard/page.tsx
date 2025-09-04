"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useNotifications } from '@/hooks/useNotifications';
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
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { stats, loading } = useNotifications();
  const [alerts, setAlerts] = useState<any[]>([]);

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

  useEffect(() => {
    const newAlerts = [];

    // Solo mostrar alertas para números significativos
    if (stats.orders > 5) {
      newAlerts.push({
        type: 'orders',
        message: `¡Nuevos pedidos! Tienes ${stats.orders} pedidos pendientes de revisión`,
        color: 'bg-gradient-to-r from-orange-500 to-red-500',
        icon: <ShoppingCart className="w-6 h-6" />,
        priority: 'high'
      });
    }

    if (stats.users > 3) {
      newAlerts.push({
        type: 'users',
        message: `¡Nuevos usuarios! ${stats.users} usuarios se han registrado recientemente`,
        color: 'bg-gradient-to-r from-blue-500 to-purple-500',
        icon: <Users className="w-6 h-6" />,
        priority: 'medium'
      });
    }

    if (stats.products > 5) {
      newAlerts.push({
        type: 'products',
        message: `¡Nuevos productos! ${stats.products} productos han sido agregados`,
        color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        icon: <Package className="w-6 h-6" />,
        priority: 'medium'
      });
    }

    if (stats.system > 3) {
      newAlerts.push({
        type: 'system',
        message: `¡Alertas del sistema! ${stats.system} eventos requieren atención`,
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        icon: <Settings className="w-6 h-6" />,
        priority: 'low'
      });
    }

    setAlerts(newAlerts);
  }, [stats]);

  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header del Dashboard */}
        <div className="bg-gradient-to-r from-stone-800 to-stone-700 rounded-2xl p-8 shadow-2xl border border-stone-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 rounded-xl p-3">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Panel de Administración</h1>
                <p className="text-stone-300 text-lg">Bienvenido, {(session?.user as any)?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-stone-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Última actualización</span>
              </div>
              <p className="text-white font-medium">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Alertas Importantes */}
        {alerts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-stone-800">Alertas Importantes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert, index) => (
                <div key={index} className={`${alert.color} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200`}>
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
              ))}
            </div>
          </div>
        )}

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Total Pedidos</p>
                <p className="text-3xl font-bold text-stone-800">{stats.orders}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+12%</span>
                </div>
              </div>
              <div className="bg-blue-100 rounded-xl p-3">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Usuarios Activos</p>
                <p className="text-3xl font-bold text-stone-800">{stats.users}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+8%</span>
                </div>
              </div>
              <div className="bg-green-100 rounded-xl p-3">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Productos</p>
                <p className="text-3xl font-bold text-stone-800">{stats.products}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+15%</span>
                </div>
              </div>
              <div className="bg-purple-100 rounded-xl p-3">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Alertas Sistema</p>
                <p className="text-3xl font-bold text-stone-800">{stats.system}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600">Requiere atención</span>
                </div>
              </div>
              <div className="bg-orange-100 rounded-xl p-3">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="w-6 h-6 text-stone-600" />
            <h2 className="text-2xl font-bold text-stone-800">Acciones Rápidas</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-stone-700">Gestionar Pedidos</span>
            </button>
            <button className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <Package className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-stone-700">Agregar Productos</span>
            </button>
            <button className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-stone-700">Ver Usuarios</span>
            </button>
            <button className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-stone-700">Ver Reportes</span>
            </button>
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-6 h-6 text-stone-600" />
            <h2 className="text-2xl font-bold text-stone-800">Estado del Sistema</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-stone-800">Servidor</p>
                <p className="text-sm text-green-600">Operativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-stone-800">Base de Datos</p>
                <p className="text-sm text-green-600">Conectada</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-stone-800">API</p>
                <p className="text-sm text-green-600">Funcionando</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 