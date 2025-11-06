"use client";

import React, { useState, useEffect, useRef } from "react";

import { usePathname } from "next/navigation";

import { useSession, signOut } from "next-auth/react";

import { motion, AnimatePresence } from "framer-motion";

import { 

  ShoppingCart, Menu, X, User, Bell, Heart, Package, Crown, LogOut,

  Beer, Utensils, Calendar, Users as UsersIcon, Search, Sparkles, Store, ArrowRight
} from "lucide-react";

import { useCart } from "@/contexts/CartContext";

import { useNotifications } from "@/hooks/useNotifications";

import { NavLogo } from "./navbar/NavLogo";

import { NavLinks } from "./navbar/NavLinks";

import { SmartSearch } from "./ai";



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

        { label: "Refrescos", href: "/products?filter=refrescos", icon: Utensils, description: "Bebidas refrescantes" },

      ]

    },

    { 

      label: "Comunidad",

      dropdown: [

        { label: "Eventos", href: "/eventos", icon: Sparkles, description: "Eventos y actividades" },

        { label: "Reservas", href: "/reservas", icon: Calendar, description: "Reserva tu mesa" },

      ]

    },

    { label: "Contacto", onClick: () => handleScrollToSection('contacto') },

    { label: "Chela Gratis", href: "/chela-gratis" },

  ];



  const isDashboard = pathname.startsWith('/dashboard');

  return (

    <>

      <nav 
        
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isDashboard
            ? scrolled
              ? "bg-gray-900 shadow-lg border-b border-gray-800"
              : "bg-gray-900 shadow-md border-b border-gray-800"
            : scrolled 
              ? "bg-white/5 backdrop-blur-2xl border-b border-white/10" 
              : "bg-transparent"
        }`}
        style={!isDashboard ? {
          background: scrolled 
            ? 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.7) 100%)' 
            : 'transparent'
        } : {}}
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

                    className={`relative p-2 rounded-lg transition-all duration-200 ${
                      isDashboard
                        ? "text-gray-300 hover:text-white hover:bg-gray-800"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >

                    <Bell className="w-5 h-5" />

                    {stats.unread > 0 && (

                      <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                        {stats.unread}

                      </span>

                    )}

                  </button>



                  <AnimatePresence>

                  {showNotifications && (

                      <motion.div

                        initial={{ opacity: 0, y: 8 }}

                        animate={{ opacity: 1, y: 0 }}

                        exit={{ opacity: 0, y: 8 }}

                        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}

                        className="absolute right-0 top-full mt-2 w-80 bg-black/95 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-50"
                        style={{
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)'
                        }}
                      >

                        <div className="p-4 border-b border-white/10">
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                              <Bell className="w-4 h-4 text-yellow-400" />
                              Notificaciones
                            </h3>
                            {stats.unread > 0 && (
                              <span className="text-xs text-yellow-400 font-medium">{stats.unread} nuevas</span>
                            )}
                          </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto">

                          {notifications.length === 0 ? (

                            <div className="p-8 text-center">
                              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Bell className="w-6 h-6 text-gray-400" />
                              </div>
                              <p className="text-gray-400 text-sm">No hay notificaciones</p>
                            </div>

                          ) : (

                            <div className="p-2">
                              {notifications.slice(0, 5).map((notif) => (

                                <div

                                  key={notif.id}

                                  onClick={() => markAsRead(notif.id)}

                                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                                    !notif.is_read 
                                      ? "bg-white/5" 
                                      : "hover:bg-white/5"
                                  }`}

                                >
                                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                                    !notif.is_read
                                      ? "bg-yellow-400/20"
                                      : "bg-white/5 group-hover:bg-white/10"
                                  }`}>
                                    <Bell className={`w-4 h-4 transition-colors duration-150 ${
                                      !notif.is_read
                                        ? "text-yellow-400"
                                        : "text-gray-400 group-hover:text-yellow-400"
                                    }`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium group-hover:text-white transition-colors duration-150">
                                      {notif.title}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-0.5 group-hover:text-gray-400 transition-colors duration-150 line-clamp-2">
                                      {notif.message}
                                    </p>
                                  </div>
                                  {!notif.is_read && (
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
                                  )}
                                </div>

                              ))}
                            </div>

                          )}

                        </div>

                        {notifications.length > 5 && (
                          <div className="p-3 border-t border-white/10">
                            <a 
                              href="/dashboard" 
                              className="group flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-150"
                            >
                              <span className="text-xs text-gray-400 group-hover:text-white font-medium transition-colors duration-150">Ver todas</span>
                              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-yellow-400 transition-colors duration-150" />
                            </a>
                          </div>
                        )}

                      </motion.div>

                      )}

                  </AnimatePresence>

                </div>

              )}



              {/* Búsqueda Inteligente */}

              <button

                onClick={() => setShowSmartSearch(true)}

                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDashboard
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                title="Búsqueda Inteligente con IA"

              >

                <Search className="w-5 h-5" />

              </button>






              {/* Carrito */}

              <a

                href="/cart"

                className={`relative p-2 rounded-lg transition-all duration-200 ${
                  isDashboard
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >

                <ShoppingCart className="w-5 h-5" />

                {summary.itemCount > 0 && (

                  <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                    {summary.itemCount}

                  </span>

                )}

              </a>





              

              {/* Usuario */}

              {user ? (

                <div className="relative" ref={userMenuRef}>

                  <button

                    onClick={() => setShowUserMenu(!showUserMenu)}

                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isDashboard
                        ? "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                        : "bg-white/10 hover:bg-white/15 border border-white/10"
                    }`}
                  >

                    <span className={`text-sm font-medium ${
                      isDashboard ? "text-white" : "text-white"
                    }`}>
                      {user.name?.charAt(0).toUpperCase()}

                    </span>

                  </button>



                  <AnimatePresence>

                    {showUserMenu && (

                      <motion.div

                        initial={{ opacity: 0, y: 8 }}

                        animate={{ opacity: 1, y: 0 }}

                        exit={{ opacity: 0, y: 8 }}

                        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}

                        className="absolute right-0 top-full mt-2 w-72 bg-black/95 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-50"
                        style={{
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)'
                        }}
                      >

                        {/* Header */}

                        <div className="p-4 border-b border-white/10">
                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.name?.charAt(0).toUpperCase()}

                              </span>

                            </div>

                            <div className="flex-1 min-w-0">

                              <p className="text-white font-medium text-sm truncate">{user.name}</p>
                              <p className="text-gray-500 text-xs truncate">{user.email}</p>
                            </div>

                          </div>

                        </div>



                        {/* Menu Items */}

                        <div className="p-2">

                          {user.role === 'admin' && (

                            <a 

                              href="/dashboard" 

                              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-150"
                            >

                              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all duration-150">
                                <Crown className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors duration-150" />
                              </div>

                              <span className="text-white/90 font-medium text-sm group-hover:text-white transition-colors duration-150">Dashboard</span>
                            </a>

                          )}

                          <a 

                            href="/profile" 

                            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-150"
                          >

                            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all duration-150">
                              <User className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors duration-150" />
                            </div>

                            <span className="text-white/90 font-medium text-sm group-hover:text-white transition-colors duration-150">Mi Perfil</span>
                          </a>

                          <a 

                            href="/orders" 

                            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-150"
                          >

                            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all duration-150">
                              <Package className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors duration-150" />
                            </div>

                            <span className="text-white/90 font-medium text-sm group-hover:text-white transition-colors duration-150">Mis Pedidos</span>
                          </a>

                          <a 

                            href="/favorites" 

                            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-150"
                          >

                            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all duration-150">
                              <Heart className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors duration-150" />
                            </div>

                            <span className="text-white/90 font-medium text-sm group-hover:text-white transition-colors duration-150">Favoritos</span>
                          </a>

                        </div>



                        {/* Footer */}

                        <div className="border-t border-white/10 p-2">
                          <button

                            onClick={() => signOut()}

                            className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-150"
                          >

                            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 group-hover:bg-red-500/20 transition-all duration-150">
                              <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors duration-150" />
                            </div>

                            <span className="text-red-400 font-medium text-sm group-hover:text-red-300 transition-colors duration-150">Cerrar Sesión</span>
                          </button>

                        </div>

                      </motion.div>

                    )}

                  </AnimatePresence>

                </div>

              ) : (

                <a

                  href="/login"

                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black rounded-lg transition-all duration-200 font-semibold"
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

                className={`relative p-2.5 rounded-lg transition-all duration-300 group ${
                  isDashboard
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-400 hover:text-[#FFD700] hover:bg-[#D4AF37]/10"
                }`}

              >

                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />

                {summary.itemCount > 0 && (

                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg shadow-[#D4AF37]/50 animate-pulse">

                    {summary.itemCount}

                  </span>

                )}

              </a>

              

              {/* Botón menú hamburguesa */}

              <button 

                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}

                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDashboard
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}

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

              className="fixed inset-0 bg-black/70 backdrop-blur-xl z-40 lg:hidden"

              style={{ marginTop: '64px' }}

            />

            

            {/* Panel lateral */}

            <motion.div

              initial={{ x: '100%' }}

              animate={{ x: 0 }}

              exit={{ x: '100%' }}

              transition={{ type: 'spring', damping: 30, stiffness: 300 }}

              className="fixed right-0 top-16 bottom-0 w-full max-w-sm bg-white/5 backdrop-blur-2xl z-50 overflow-y-auto shadow-2xl border-l border-white/10"

            >

              <div className="p-5 space-y-5">

                {/* Usuario Móvil */}

                {user ? (

                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">

                    {/* Avatar y datos */}

                    <div className="flex items-center gap-3 mb-4">

                      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">

                        <span className="text-lg font-medium text-white">

                          {user.name?.charAt(0).toUpperCase()}

                        </span>

                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="text-white font-bold text-base truncate">{user.name}</p>

                        <p className="text-gray-400 text-sm truncate">{user.email}</p>

                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-lg ${

                          user.role === 'admin' 

                            ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 

                            : 'bg-white/5 text-gray-400'

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

                          className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-all duration-150"

                        >

                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">

                            <Crown className="w-4 h-4 text-[#D4AF37]" />

                          </div>

                          <span className="text-white font-medium text-sm">Dashboard</span>

                        </a>

                      )}

                      <a 

                        href="/profile" 

                        onClick={() => setMobileMenuOpen(false)}

                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-all duration-150"

                      >

                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">

                          <User className="w-4 h-4 text-gray-400" />

                        </div>

                        <span className="text-white font-medium text-sm">Mi Perfil</span>

                      </a>

                      <a 

                        href="/orders" 

                        onClick={() => setMobileMenuOpen(false)}

                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-all duration-150"

                      >

                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">

                          <Package className="w-5 h-5 text-gray-300 group-hover:text-white" />

                        </div>

                        <span className="text-white font-medium text-sm">Mis Pedidos</span>

                      </a>

                      <a 

                        href="/favorites" 

                        onClick={() => setMobileMenuOpen(false)}

                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-all duration-150"

                      >

                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">

                          <Heart className="w-5 h-5 text-gray-300 group-hover:text-white" />

                        </div>

                        <span className="text-white font-medium text-sm">Favoritos</span>

                      </a>

                      <button

                        onClick={() => {

                          signOut();

                          setMobileMenuOpen(false);

                        }}

                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-all duration-150"

                      >

                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">

                          <LogOut className="w-4 h-4 text-red-400" />

                        </div>

                        <span className="text-red-400 font-medium text-sm">Cerrar Sesión</span>

                      </button>

                    </div>

                  </div>

                ) : (

                  <a

                    href="/login"

                    onClick={() => setMobileMenuOpen(false)}

                    className="block w-full px-4 py-3 text-center text-sm font-medium bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black rounded-lg transition-all duration-200 font-semibold"

                  >

                    Iniciar Sesión

                  </a>

                )}



                {/* Navegación Móvil */}

                <div>

                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                    Menú

                  </h3>

                  <div className="space-y-1">

                    <NavLinks

                      items={navItems}

                      activeDropdown={activeDropdown}

                      toggleDropdown={(label) => {
                        setActiveDropdown((prev) => {
                          // Si el dropdown clickeado es el mismo que el activo, cerrarlo
                          if (prev === label) {
                            return null;
                          }
                          // Si es diferente, abrir el nuevo (esto cierra el anterior automáticamente)
                          return label;
                        });
                      }}

                      setActiveDropdown={setActiveDropdown}

                      isMobile={true}

                      onMobileClose={() => setMobileMenuOpen(false)}

                    />

                  </div>

                </div>



                {/* Herramientas IA */}

                <div className="pt-5 border-t border-gray-800/50">

                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-3 px-3 flex items-center gap-2">

                    <div className="w-1 h-4 bg-gradient-to-b from-[#D4AF37] to-[#FFD700] rounded-full" />
                    Herramientas IA

                  </h3>

                  <div className="grid grid-cols-2 gap-3">

                    <button

                      onClick={() => {

                        setShowSmartSearch(true);

                        setMobileMenuOpen(false);

                      }}

                      className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-150 border border-white/10"

                    >

                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">

                        <Search className="w-5 h-5 text-gray-400" />

                      </div>

                      <span className="text-xs font-medium text-gray-400">Búsqueda</span>

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



    </>

  );

}


