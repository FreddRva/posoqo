"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Menu, X, User, Bell, Heart, Package, Crown, LogOut,
  Beer, Utensils, Wine, Calendar, Users as UsersIcon, Search, Sparkles
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/hooks/useNotifications";
import { NavLogo } from "./navbar/NavLogo";
import { NavLinks } from "./navbar/NavLinks";
import { SmartSearch, PairingAssistant } from "./ai";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const { summary } = useCart();
  const { notifications, stats, markAsRead } = useNotifications();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [showPairingAssistant, setShowPairingAssistant] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setShowNotifications(false);
    setShowUserMenu(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    if (pathname !== '/') {
      window.location.href = `/#${sectionId}`;
              } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const navItems = [
    { label: "Nosotros", href: "/sobre-nosotros" },
    { 
      label: "Productos", 
      dropdown: [
        { label: "Cervezas", href: "/products?filter=cerveza", icon: Beer, description: "Nuestra colección de cervezas" },
        { label: "Comidas", href: "/products?filter=comidas", icon: Utensils, description: "Platos tradicionales" },
        { label: "Refrescos", href: "/products?filter=refrescos", icon: Wine, description: "Bebidas refrescantes" },
      ]
    },
    { 
      label: "Comunidad",
      dropdown: [
        { label: "Club POSOQO", onClick: () => handleScrollToSection('club'), icon: Crown, description: "Comunidad exclusiva" },
        { label: "Reservas", href: "/reservas", icon: Calendar, description: "Reserva tu mesa" },
      ]
    },
    { label: "Contacto", onClick: () => handleScrollToSection('contacto') },
    { label: "Chela Gratis", href: "/chela-gratis" },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200" 
            : "bg-white backdrop-blur-md shadow-sm border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <NavLogo />

            {/* Navegación Desktop */}
            <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              <NavLinks
                items={navItems}
                activeDropdown={activeDropdown}
                toggleDropdown={(label) => setActiveDropdown(activeDropdown === label ? null : label)}
                setActiveDropdown={setActiveDropdown}
              />
            </div>

            {/* Acciones Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Notificaciones */}
              {session && (
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <Bell className="w-5 h-5" />
                    {stats.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {stats.unread}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                  {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-800">
                          <h3 className="text-white font-semibold">Notificaciones</h3>
                          <p className="text-sm text-gray-500">{stats.unread} sin leer</p>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              No hay notificaciones
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                                  !notif.is_read ? "bg-gray-800/50" : ""
                                }`}
                              >
                                <p className="text-white text-sm font-medium">{notif.title}</p>
                                <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                      )}
                  </AnimatePresence>
                </div>
              )}

              {/* Búsqueda Inteligente */}
              <button
                onClick={() => setShowSmartSearch(true)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                title="Búsqueda Inteligente con IA"
              >
                <div className="relative">
                  <Search className="w-5 h-5" />
                  <Sparkles className="w-3 h-3 text-purple-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              {/* Asistente de Maridaje */}
              <button
                onClick={() => setShowPairingAssistant(true)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                title="Asistente de Maridaje con IA"
              >
                <div className="relative">
                  <Wine className="w-5 h-5" />
                  <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              {/* Carrito */}
              <a
                href="/cart"
                className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {summary.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {summary.itemCount}
                  </span>
                )}
              </a>


              
              {/* Usuario */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-0.5 hover:scale-105 transition-transform duration-200"
                  >
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <span className="text-lg font-bold bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                      >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-0.5">
                              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                <span className="text-xl font-bold bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 font-bold text-base truncate">{user.name}</p>
                              <p className="text-gray-600 text-sm truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          {user.role === 'admin' && (
                            <a 
                              href="/dashboard" 
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 rounded-xl transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                <Crown className="w-5 h-5 text-amber-600" />
                              </div>
                              <span className="text-gray-900 font-medium text-sm">Dashboard Admin</span>
                            </a>
                          )}
                          <a 
                            href="/profile" 
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              <User className="w-5 h-5 text-gray-700" />
                            </div>
                            <span className="text-gray-900 font-medium text-sm">Mi Perfil</span>
                          </a>
                          <a 
                            href="/orders" 
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-gray-900 font-medium text-sm">Mis Pedidos</span>
                          </a>
                          <a 
                            href="/favorites" 
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <Heart className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-gray-900 font-medium text-sm">Favoritos</span>
                          </a>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 p-2">
                          <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                              <LogOut className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-red-600 font-medium text-sm">Cerrar Sesión</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  href="/login"
                  className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full transition-all duration-200"
                >
                  Iniciar Sesión
                </a>
              )}
            </div>

            {/* Botón Móvil */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Carrito móvil */}
              <a 
                href="/cart" 
                className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <ShoppingCart className="w-6 h-6" />
                {summary.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {summary.itemCount}
                  </span>
                )}
              </a>
              
              {/* Botón menú hamburguesa */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú Móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              style={{ marginTop: '64px' }}
            />
            
            {/* Panel lateral */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-16 bottom-0 w-full max-w-sm bg-white z-50 overflow-y-auto shadow-2xl"
            >
              <div className="p-5 space-y-5">
                {/* Usuario Móvil */}
                {user ? (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                    {/* Avatar y datos */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-0.5 flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          <span className="text-2xl font-bold bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-bold text-base truncate">{user.name}</p>
                        <p className="text-gray-600 text-sm truncate">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-amber-200 text-amber-800' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                      </div>
                    </div>

                    {/* Opciones rápidas */}
                    <div className="space-y-1.5">
                      {user.role === 'admin' && (
                        <a 
                          href="/dashboard" 
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
                        >
                          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                            <Crown className="w-5 h-5 text-amber-600" />
                          </div>
                          <span className="text-gray-900 font-medium text-sm">Dashboard</span>
                        </a>
                      )}
                      <a 
                        href="/profile" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-700" />
                        </div>
                        <span className="text-gray-900 font-medium text-sm">Mi Perfil</span>
                      </a>
                      <a 
                        href="/orders" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-900 font-medium text-sm">Mis Pedidos</span>
                      </a>
                      <a 
                        href="/favorites" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-gray-900 font-medium text-sm">Favoritos</span>
                      </a>
                      <button
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                          <LogOut className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-red-600 font-medium text-sm">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-6 py-3.5 text-center text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl shadow-lg transition-all duration-200"
                  >
                    Iniciar Sesión
                  </a>
                )}

                {/* Navegación Móvil */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                    Menú
                  </h3>
                  <div className="space-y-1">
                    <NavLinks
                      items={navItems}
                      activeDropdown={activeDropdown}
                      toggleDropdown={(label) => setActiveDropdown(activeDropdown === label ? null : label)}
                      setActiveDropdown={setActiveDropdown}
                      isMobile={true}
                      onMobileClose={() => setMobileMenuOpen(false)}
                    />
                  </div>
                </div>

                {/* Herramientas IA */}
                <div className="pt-5 border-t border-gray-200">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                    Herramientas IA
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setShowSmartSearch(true);
                        setMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center gap-2.5 p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-colors"
                    >
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Search className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-xs font-semibold text-gray-900">Búsqueda</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowPairingAssistant(true);
                        setMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center gap-2.5 p-4 bg-amber-50 hover:bg-amber-100 rounded-2xl transition-colors"
                    >
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Wine className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className="text-xs font-semibold text-gray-900">Maridaje</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modales de IA */}
      <SmartSearch 
        isOpen={showSmartSearch} 
        onClose={() => setShowSmartSearch(false)} 
      />
      <PairingAssistant 
        isOpen={showPairingAssistant} 
        onClose={() => setShowPairingAssistant(false)} 
      />
    </>
  );
}
