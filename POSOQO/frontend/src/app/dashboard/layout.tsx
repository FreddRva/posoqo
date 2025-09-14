"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Tags, 
  Wrench, 
  Users, 
  Image, 
  AlertTriangle, 
  Calendar, 
  PieChart, 
  Settings, 
  Home,
  LogOut,
  User
} from 'lucide-react';
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cargar estado del sidebar desde localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setSidebarOpen(JSON.parse(savedState));
    } else {
      // Por defecto, empezar cerrado
      setSidebarOpen(false);
    }
  }, []);

  // Guardar estado del sidebar en localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Pedidos', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Productos', href: '/dashboard/products', icon: Package },
    { name: 'Categorías', href: '/dashboard/categories', icon: Tags },
    { name: 'Servicios', href: '/dashboard/services', icon: Wrench },
    { name: 'Usuarios', href: '/dashboard/users', icon: Users },
    { name: 'Banners', href: '/dashboard/banners', icon: Image },
    { name: 'Reclamos', href: '/dashboard/complaints', icon: AlertTriangle },
    { name: 'Reservas', href: '/dashboard/reservations', icon: Calendar },
    { name: 'Reportes', href: '/dashboard/reports', icon: PieChart },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Navbar Principal */}
      <Navbar />
      
      {/* Botón flotante para abrir sidebar cuando está cerrado */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-24 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out top-20 ${
        sidebarOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center border-b border-stone-200 transition-all duration-300 ${
            sidebarOpen ? 'justify-between p-6' : 'justify-center p-4'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <h1 className="text-xl font-bold text-stone-800">POSOQO</h1>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-6 space-y-2 transition-all duration-300 ${
            sidebarOpen ? 'px-4' : 'px-2'
          }`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-xl transition-all duration-300 group ${
                    sidebarOpen ? 'space-x-3 px-4 py-3' : 'justify-center p-3'
                  } ${
                    typeof window !== 'undefined' && window.location.pathname === item.href
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* User Info */}
          <div className={`border-t border-stone-200 transition-all duration-300 ${
            sidebarOpen ? 'p-4' : 'p-2'
          }`}>
            <div className={`flex items-center ${
              sidebarOpen ? 'space-x-3' : 'justify-center'
            }`}>
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-stone-600" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {session.user?.name || 'Usuario'}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    {session.user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out pt-20 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-stone-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
                title={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5 text-stone-600" />
                ) : (
                  <Menu className="w-5 h-5 text-stone-600" />
                )}
              </button>
              <h2 className="text-2xl font-bold text-stone-800">
                {menuItems.find(item => 
                  typeof window !== 'undefined' && window.location.pathname === item.href
                )?.name || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* Botón de cerrar sesión removido */}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden top-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 