"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BarChart3,
  Download,
  FileText,
  FileDown,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
  PieChart,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ReportStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalReservations: number;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ReportStats>({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalReservations: 0
  });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
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

  const loadStats = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      // Aquí podrías cargar estadísticas desde el backend
      // Por ahora usamos datos de ejemplo
      setStats({
        totalSales: 15420.50,
        totalOrders: 45,
        totalUsers: 128,
        totalReservations: 23
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [session]);

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

  const downloadReport = async (type: string, format: string) => {
    try {
      setDownloading(`${type}_${format}`);
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://posoqo-backend.onrender.com'}/api/admin/reports/${type}/${format}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${type}_report.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        showSuccessAlert('Descarga exitosa', `Reporte de ${type} descargado correctamente`);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error descargando reporte:', error);
      showErrorAlert('Error de descarga', 'No se pudo descargar el reporte. Intenta de nuevo.');
    } finally {
      setDownloading(null);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="mb-6">
              <BarChart3 className="w-16 h-16 text-blue-600 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-4">Acceso Requerido</h1>
            <p className="text-stone-600 mb-8">Debes iniciar sesión como administrador para ver los reportes</p>
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <BarChart3 className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
          </motion.div>
          <p className="text-yellow-300 text-2xl font-bold">Cargando Reportes...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-gradient-to-r from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-yellow-400/20 text-center">
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="inline-block relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-50" />
            <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-2xl p-4">
              <BarChart3 className="w-12 h-12 text-black" />
            </div>
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-4">
            Reportes y Estadísticas
          </h1>
          <p className="text-gray-400 text-sm md:text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Genera reportes detallados de ventas, usuarios y más
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.05, y: -5 }} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-xl p-4 border border-green-400/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm font-medium">Ventas Totales</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-400">S/ {stats.totalSales.toFixed(2)}</p>
              </div>
              <div className="text-green-600">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Pedidos</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
              </div>
              <div className="text-blue-600">
                <ShoppingCart className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Usuarios</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
              <div className="text-purple-600">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Reservas</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalReservations}</p>
              </div>
              <div className="text-orange-600">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reportes disponibles */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Reporte de Ventas */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800">Reporte de Ventas</h2>
                <p className="text-stone-600">Información detallada de todas las ventas realizadas</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => downloadReport('sales', 'csv')}
                disabled={downloading === 'sales_csv'}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {downloading === 'sales_csv' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                {downloading === 'sales_csv' ? 'Descargando...' : 'Descargar CSV'}
              </button>
              <button
                onClick={() => downloadReport('sales', 'pdf')}
                disabled={downloading === 'sales_pdf'}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {downloading === 'sales_pdf' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileDown className="w-5 h-5" />
                )}
                {downloading === 'sales_pdf' ? 'Descargando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>

          {/* Reporte de Usuarios */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800">Reporte de Usuarios</h2>
                <p className="text-stone-600">Lista completa de usuarios registrados en el sistema</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => downloadReport('users', 'csv')}
                disabled={downloading === 'users_csv'}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {downloading === 'users_csv' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                {downloading === 'users_csv' ? 'Descargando...' : 'Descargar CSV'}
              </button>
              <button
                onClick={() => downloadReport('users', 'pdf')}
                disabled={downloading === 'users_pdf'}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {downloading === 'users_pdf' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileDown className="w-5 h-5" />
                )}
                {downloading === 'users_pdf' ? 'Descargando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-stone-800">Información sobre los Reportes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-stone-700 mb-2">Reporte de Ventas incluye:</h4>
                <ul className="space-y-1 text-stone-600">
                  <li>• ID del pedido</li>
                  <li>• Nombre del cliente</li>
                  <li>• Email del cliente</li>
                  <li>• Total de la venta</li>
                  <li>• Estado del pedido</li>
                  <li>• Fecha de creación</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-stone-700 mb-2">Reporte de Usuarios incluye:</h4>
                <ul className="space-y-1 text-stone-600">
                  <li>• ID del usuario</li>
                  <li>• Nombre completo</li>
                  <li>• Email</li>
                  <li>• Rol en el sistema</li>
                  <li>• Fecha de registro</li>
                  <li>• Estado de la cuenta</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notas importantes */}
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-stone-800">Notas Importantes</h3>
          </div>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Los reportes se generan en tiempo real con los datos actuales</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Los archivos CSV pueden abrirse en Excel o Google Sheets</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Los archivos PDF están optimizados para impresión</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Los reportes incluyen todos los registros del sistema</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Se recomienda descargar los reportes durante horarios de baja actividad</span>
            </li>
          </ul>
        </motion.div>

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
    </div>
  );
} 