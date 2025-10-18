"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Menu, X, User, Bell, Heart, Package, Crown, LogOut,
  Beer, Utensils, Wine, Calendar, Users as UsersIcon, Search, Sparkles, Camera
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/hooks/useNotifications";
import { NavLogo } from "./navbar/NavLogo";
import { NavLinks } from "./navbar/NavLinks";
import { SmartSearch, PairingAssistant, ImageRecognition } from "./ai";

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
  const [showImageRecognition, setShowImageRecognition] = useState(false);
  
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
    { label: "Eventos", href: "/eventos" },
    { 
      label: "Comunidad",
      dropdown: [
        { label: "Club POSOQO", href: "/club", icon: Crown, description: "Comunidad exclusiva" },
        { label: "Reservas", href: "/reservas", icon: Calendar, description: "Reserva tu mesa" },
        { label: "Miembros", href: "/club", icon: UsersIcon, description: "Eventos y actividades" },
      ]
    },
    { label: "Contacto", href: "/contacto" },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-black/95 backdrop-blur-md border-b border-gray-800" 
            : "bg-black/90 backdrop-blur-sm border-b border-gray-900"
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

              {/* Reconocimiento de Imágenes */}
              <button
                onClick={() => setShowImageRecognition(true)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                title="Reconocimiento de Imágenes con IA"
              >
                <div className="relative">
                  <Camera className="w-5 h-5" />
                  <Sparkles className="w-3 h-3 text-indigo-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden"
                      >
                        {user.role === 'admin' && (
                          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200">
                            <Crown className="w-5 h-5" />
                            <span className="text-sm font-medium">Dashboard</span>
                          </a>
                        )}
                        <a href="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200">
                          <User className="w-5 h-5" />
                          <span className="text-sm font-medium">Mi Perfil</span>
                        </a>
                        <a href="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200">
                          <Package className="w-5 h-5" />
                          <span className="text-sm font-medium">Mis Pedidos</span>
                        </a>
                        <a href="/favorites" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200">
                          <Heart className="w-5 h-5" />
                          <span className="text-sm font-medium">Favoritos</span>
                        </a>
                        <div className="border-t border-gray-800"></div>
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 transition-colors duration-200"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm font-medium">Cerrar Sesión</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  href="/login"
                  className="px-4 py-2 text-sm font-medium bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors duration-200"
                >
                  Iniciar Sesión
                </a>
              )}
            </div>

            {/* Botón Móvil */}
            <div className="lg:hidden flex items-center gap-3">
              <a href="/cart" className="relative p-2 text-gray-400">
                <ShoppingCart className="w-5 h-5" />
                {summary.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {summary.itemCount}
                  </span>
                )}
              </a>

              
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              style={{ marginTop: '64px' }}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-16 bottom-0 w-80 bg-gray-900 border-l border-gray-800 z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Usuario Móvil */}
                {user ? (
                  <div className="pb-6 border-b border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
            </div>
                    <div className="space-y-1">
                      {user.role === 'admin' && (
                        <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                          <Crown className="w-5 h-5" />
                          <span className="text-sm">Dashboard</span>
                        </a>
                      )}
                      <a href="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <User className="w-5 h-5" />
                        <span className="text-sm">Mi Perfil</span>
                      </a>
                      <a href="/orders" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <Package className="w-5 h-5" />
                        <span className="text-sm">Mis Pedidos</span>
                      </a>
                      <a href="/favorites" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm">Favoritos</span>
                      </a>
            <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
                  </div>
                ) : (
                  <a
                    href="/login"
                    className="block w-full px-4 py-3 text-center text-sm font-medium bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Iniciar Sesión
                  </a>
                )}

                {/* Navegación Móvil */}
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
      <ImageRecognition 
        isOpen={showImageRecognition} 
        onClose={() => setShowImageRecognition(false)} 
      />
    </>
  );
}
