"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Menu, X, User, Bell, Heart, Package, Crown, LogOut,
  Beer, Utensils, Wine, Calendar, Users as UsersIcon, Sparkles
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useNotifications } from "@/hooks/useNotifications";
import { NavLogo } from "./navbar/NavLogo";
import { NavLinks } from "./navbar/NavLinks";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const { itemCount } = useCart();
  const { notifications, stats, markAsRead } = useNotifications();

  // Estados
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setShowNotifications(false);
  }, [pathname]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navegación principal
  const navItems = [
    { label: "Nosotros", href: "/sobre-nosotros" },
    { 
      label: "Productos", 
      dropdown: [
        { label: "Cervezas", href: "/products?filter=cerveza", icon: Beer, description: "Nuestra colección de cervezas únicas" },
        { label: "Comidas", href: "/products?filter=comidas", icon: Utensils, description: "Platos que complementan nuestras cervezas" },
        { label: "Refrescos", href: "/products?filter=refrescos", icon: Wine, description: "Bebidas refrescantes artesanales" },
      ]
    },
    { label: "Eventos", href: "/eventos" },
    { 
      label: "Comunidad",
      dropdown: [
        { label: "Club POSOQO", href: "/club", icon: Crown, description: "Únete a nuestra comunidad exclusiva" },
        { label: "Reservas", href: "/reservas", icon: Calendar, description: "Reserva tu mesa" },
        { label: "Miembros", href: "/club", icon: UsersIcon, description: "Próximos eventos y actividades" },
      ]
    },
    { label: "Contacto", href: "/contacto" },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-black/98 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border-b border-yellow-400/20" 
            : "bg-black/85 backdrop-blur-xl border-b border-yellow-400/10"
        }`}
      >
        {/* Línea decorativa superior */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
        
        {/* Efecto de brillo animado */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 pointer-events-none"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <NavLogo />

            {/* Navegación Desktop */}
            <div className="hidden lg:flex items-center space-x-2" ref={dropdownRef}>
              <NavLinks
                items={navItems}
                activeDropdown={activeDropdown}
                toggleDropdown={(label) => setActiveDropdown(activeDropdown === label ? null : label)}
                setActiveDropdown={setActiveDropdown}
              />
            </div>

            {/* Acciones Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Notificaciones */}
              {session && (
                <div className="relative" ref={notificationsRef}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-3 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-yellow-400/20 hover:to-amber-500/20 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300 group"
                  >
                    <Bell className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors duration-300" />
                    {stats.unread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg shadow-red-500/50"
                      >
                        {stats.unread}
                      </motion.span>
                    )}
                    
                    {/* Efecto de pulso */}
                    {stats.unread > 0 && (
                      <motion.div
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-3 w-96 bg-gray-900/98 backdrop-blur-2xl border border-yellow-400/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
                      >
                        {/* Header */}
                        <div className="p-5 border-b border-gray-800/50 bg-gradient-to-r from-yellow-400/10 to-amber-500/10">
                          <div className="flex items-center justify-between">
                            <h3 className="text-yellow-400 font-bold text-lg flex items-center gap-2">
                              <Sparkles className="w-5 h-5" />
                              Notificaciones
                            </h3>
                            <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                              {stats.unread} nuevas
                            </span>
                          </div>
                        </div>
                        
                        {/* Contenido */}
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-12 text-center">
                              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                              <p className="text-gray-400">No hay notificaciones</p>
                            </div>
                          ) : (
                            <div>
                              {notifications.slice(0, 5).map((notif, index) => (
                                <motion.div
                                  key={notif.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  onClick={() => markAsRead(notif.id)}
                                  className={`p-4 border-b border-gray-800/50 cursor-pointer hover:bg-yellow-400/5 transition-all duration-300 ${
                                    !notif.is_read ? "bg-yellow-400/5" : ""
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 ${!notif.is_read ? 'bg-yellow-400' : 'bg-gray-600'}`} />
                                    <div className="flex-1">
                                      <p className="text-white font-medium text-sm mb-1">{notif.title}</p>
                                      <p className="text-gray-400 text-xs">{notif.message}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Carrito */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="/cart"
                  className="relative p-3 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-yellow-400/20 hover:to-amber-500/20 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300 group"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors duration-300" />
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-amber-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg shadow-yellow-400/50"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Usuario */}
              {user ? (
                <div className="relative group">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400/10 to-amber-500/10 hover:from-yellow-400/20 hover:to-amber-500/20 border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-white font-semibold">{user.name?.split(' ')[0]}</span>
                  </motion.button>
                  
                  {/* Dropdown del usuario */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-3 w-64 bg-gray-900/98 backdrop-blur-2xl border border-yellow-400/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
                    
                    {user.role === 'admin' && (
                      <Link href="/dashboard" className="group/item relative flex items-center gap-3 px-5 py-4 text-white hover:text-yellow-400 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                        <Crown className="w-5 h-5 relative z-10" />
                        <span className="font-medium relative z-10">Dashboard</span>
                      </Link>
                    )}
                    <Link href="/profile" className="group/item relative flex items-center gap-3 px-5 py-4 text-white hover:text-yellow-400 transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      <User className="w-5 h-5 relative z-10" />
                      <span className="font-medium relative z-10">Mi Perfil</span>
                    </Link>
                    <Link href="/orders" className="group/item relative flex items-center gap-3 px-5 py-4 text-white hover:text-yellow-400 transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      <Package className="w-5 h-5 relative z-10" />
                      <span className="font-medium relative z-10">Mis Pedidos</span>
                    </Link>
                    <Link href="/favorites" className="group/item relative flex items-center gap-3 px-5 py-4 text-white hover:text-yellow-400 transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      <Heart className="w-5 h-5 relative z-10" />
                      <span className="font-medium relative z-10">Favoritos</span>
                    </Link>
                    
                    <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-2" />
                    
                    <button
                      onClick={() => signOut()}
                      className="group/item relative w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:text-red-300 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      <LogOut className="w-5 h-5 relative z-10" />
                      <span className="font-medium relative z-10">Cerrar Sesión</span>
                    </button>
                  </motion.div>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-300 hover:to-amber-400 shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all duration-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Iniciar Sesión
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Botón Móvil */}
            <div className="lg:hidden flex items-center gap-2">
              <motion.div whileTap={{ scale: 0.9 }}>
                <Link href="/cart" className="relative p-2 rounded-lg bg-gray-800/50 hover:bg-yellow-400/20 transition-all duration-300">
                  <ShoppingCart className="w-6 h-6 text-white" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </motion.div>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-yellow-400/20 transition-all duration-300"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Línea decorativa inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
      </motion.nav>

      {/* Menú Móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
              style={{ marginTop: '80px' }}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-20 bottom-0 w-80 bg-gradient-to-b from-gray-900 to-black border-l border-yellow-400/30 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Línea decorativa */}
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-yellow-400/50 via-transparent to-yellow-400/50" />
              
              <div className="p-6 space-y-6 relative z-10">
                {/* Usuario Móvil */}
                {user ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pb-6 border-b border-gray-800"
                  >
                    <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border border-yellow-400/30">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {user.role === 'admin' && (
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300">
                          <Crown className="w-5 h-5" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300">
                        <User className="w-5 h-5" />
                        <span>Mi Perfil</span>
                      </Link>
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300">
                        <Package className="w-5 h-5" />
                        <span>Mis Pedidos</span>
                      </Link>
                      <Link href="/favorites" className="flex items-center gap-3 px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300">
                        <Heart className="w-5 h-5" />
                        <span>Favoritos</span>
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Link
                      href="/login"
                      className="block w-full px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-center hover:from-yellow-300 hover:to-amber-400 shadow-lg shadow-yellow-400/30 transition-all duration-300"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Iniciar Sesión
                      </span>
                    </Link>
                  </motion.div>
                )}

                {/* Navegación Móvil */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <NavLinks
                    items={navItems}
                    activeDropdown={activeDropdown}
                    toggleDropdown={(label) => setActiveDropdown(activeDropdown === label ? null : label)}
                    setActiveDropdown={setActiveDropdown}
                    isMobile={true}
                    onMobileClose={() => setMobileMenuOpen(false)}
                  />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Estilos personalizados para el scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgb(251, 191, 36), rgb(245, 158, 11));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgb(252, 211, 77), rgb(251, 191, 36));
        }
      `}</style>
    </>
  );
}
