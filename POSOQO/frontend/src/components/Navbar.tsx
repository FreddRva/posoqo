"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Menu, 
  X, 
  User, 
  Bell,
  ChevronDown,
  Heart,
  Package,
  CreditCard,
  Crown,
  LogOut,
  Beer,
  Utensils,
  Wine,
  MapPin,
  Calendar,
  Users as UsersIcon,
  Mail
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useNotifications } from "@/hooks/useNotifications";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;
  const { itemCount } = useCart();
  const { notifications, stats, markAsRead, markAllAsRead } = useNotifications();

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
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
        { label: "Cervezas", href: "/products?filter=cerveza", icon: Beer },
        { label: "Comidas", href: "/products?filter=comidas", icon: Utensils },
        { label: "Refrescos", href: "/products?filter=refrescos", icon: Wine },
      ]
    },
    { label: "Eventos", href: "/eventos" },
    { 
      label: "Comunidad",
      dropdown: [
        { label: "Club POSOQO", href: "/club", icon: Crown },
        { label: "Reservas", href: "/reservas", icon: Calendar },
        { label: "Miembros", href: "/club", icon: UsersIcon },
      ]
    },
    { label: "Contacto", href: "/contacto" },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-black/95 backdrop-blur-xl shadow-2xl shadow-yellow-500/10 border-b border-yellow-400/20" 
            : "bg-black/80 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/Logo.png"
                alt="POSOQO"
                width={40}
                height={40}
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
              <span className="text-2xl font-extrabold text-yellow-400 tracking-wide group-hover:text-yellow-300 transition-colors duration-300">
                POSOQO
              </span>
            </Link>

            {/* Navegación Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.dropdown ? (
                    <>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                        className={`flex items-center gap-2 px-4 py-2 text-base font-semibold rounded-lg transition-all duration-300 ${
                          activeDropdown === item.label
                            ? "text-yellow-400 bg-yellow-400/10"
                            : "text-white hover:text-yellow-400 hover:bg-white/5"
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`} />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-yellow-400/20 rounded-xl shadow-2xl overflow-hidden"
                          >
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActiveDropdown(null);
                                  router.push(subItem.href);
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 cursor-pointer"
                              >
                                <subItem.icon className="w-5 h-5" />
                                <span className="font-medium">{subItem.label}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href!}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(item.href!);
                      }}
                      className={`px-4 py-2 text-base font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                        pathname === item.href
                          ? "text-yellow-400 bg-yellow-400/10"
                          : "text-white hover:text-yellow-400 hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Acciones Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Notificaciones */}
              {session && (
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg bg-white/5 hover:bg-yellow-400/10 transition-all duration-300"
                  >
                    <Bell className="w-5 h-5 text-white" />
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
                        className="absolute right-0 top-full mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-yellow-400/20 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto"
                      >
                        <div className="p-4 border-b border-gray-800">
                          <h3 className="text-yellow-400 font-bold">Notificaciones</h3>
                          <p className="text-gray-400 text-sm">{stats.unread} sin leer</p>
                        </div>
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">
                            No hay notificaciones
                          </div>
                        ) : (
                          <div>
                            {notifications.slice(0, 5).map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-white/5 ${
                                  !notif.is_read ? "bg-yellow-400/5" : ""
                                }`}
                              >
                                <p className="text-white font-medium text-sm">{notif.title}</p>
                                <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Carrito */}
              <Link
                href="/cart"
                className="relative p-2 rounded-lg bg-white/5 hover:bg-yellow-400/10 transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Usuario */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 transition-all duration-300">
                    <User className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">{user.name?.split(' ')[0]}</span>
                  </button>
                  
                  <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-yellow-400/20 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    {user.role === 'admin' && (
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300">
                        <Crown className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    )}
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300">
                      <User className="w-5 h-5" />
                      <span className="font-medium">Mi Perfil</span>
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300">
                      <Package className="w-5 h-5" />
                      <span className="font-medium">Mis Pedidos</span>
                    </Link>
                    <Link href="/favorites" className="flex items-center gap-3 px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300">
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">Favoritos</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2 rounded-lg font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-300 hover:to-amber-400 transition-all duration-300"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Botón Móvil */}
            <div className="lg:hidden flex items-center gap-2">
              <Link href="/cart" className="relative p-2">
                <ShoppingCart className="w-6 h-6 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-white/5 hover:bg-yellow-400/10 transition-all duration-300"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
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
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-16 bottom-0 w-80 bg-gray-900 border-l border-yellow-400/20 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Usuario Móvil */}
                {user ? (
                  <div className="pb-6 border-b border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {user.role === 'admin' && (
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-300">
                          <Crown className="w-5 h-5" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-300">
                        <User className="w-5 h-5" />
                        <span>Mi Perfil</span>
                      </Link>
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2 text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-300">
                        <Package className="w-5 h-5" />
                        <span>Mis Pedidos</span>
                      </Link>
                      <Link href="/favorites" className="flex items-center gap-3 px-4 py-2 text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-300">
                        <Heart className="w-5 h-5" />
                        <span>Favoritos</span>
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-center hover:from-yellow-300 hover:to-amber-400 transition-all duration-300"
                  >
                    Iniciar Sesión
                  </Link>
                )}

                {/* Navegación Móvil */}
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <div key={item.label}>
                      {item.dropdown ? (
                        <>
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                            className="w-full flex items-center justify-between px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-300"
                          >
                            <span className="font-semibold">{item.label}</span>
                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${
                              activeDropdown === item.label ? "rotate-180" : ""
                            }`} />
                          </button>
                          {activeDropdown === item.label && (
                            <div className="pl-4 space-y-1 mt-1">
                              {item.dropdown.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setMobileMenuOpen(false);
                                    setActiveDropdown(null);
                                    router.push(subItem.href);
                                  }}
                                  className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-300 cursor-pointer"
                                >
                                  <subItem.icon className="w-4 h-4" />
                                  <span>{subItem.label}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href!}
                          onClick={(e) => {
                            e.preventDefault();
                            setMobileMenuOpen(false);
                            router.push(item.href!);
                          }}
                          className="block px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-300 font-semibold cursor-pointer"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
