"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, Bell, ChevronDown, Crown, Heart, Package, CreditCard, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Montserrat, Playfair_Display } from "next/font/google";
import { useNotifications } from "@/hooks/useNotifications";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

type UserWithRole = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

type NavItem = {
  label: string;
  href?: string;
  dropdown?: boolean;
  highlight?: boolean;
  subitems?: {
    label: string;
    href: string;
    description?: string;
  }[];
};

// Configuración de navegación - Más limpia y organizada
const navItems: NavItem[] = [
  { label: "Nosotros", href: "/about" },
  { 
    label: "Productos", 
    dropdown: true, 
    subitems: [
      { 
        label: "Cervezas", 
        href: "/products?filter=cerveza",
        description: "Nuestra colección de cervezas únicas"
      },
      { 
        label: "Comidas", 
        href: "/products?filter=comidas",
        description: "Platos que complementan nuestras cervezas"
      },
      { 
        label: "Merchandising", 
        href: "/products?filter=merchandising",
        description: "Productos exclusivos POSOQO"
      },
    ] 
  },
  { label: "Taprooms", href: "/#taprooms" },
  { 
    label: "Comunidad", 
    dropdown: true, 
    subitems: [
      { 
        label: "Club POSOQO", 
        href: "/#club-posoqo",
        description: "Únete a nuestra comunidad"
      },
      { 
        label: "Eventos", 
        href: "/#eventos",
        description: "Festivales y eventos especiales"
      },
    ] 
  },
  { label: "Contacto", href: "/#contacto" },
];

// Componente de menú desplegable
const DropdownMenu = ({
  items,
  isMobile,
  isOpen,
  onClose,
  onItemClick,
}: {
  items: { label: string; href: string; description?: string }[];
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: () => void;
}) => {
  if (!isOpen) return null;

  return (
        <div className={`
      ${isMobile 
        ? "pl-6 space-y-3 mt-2" 
        : "absolute left-0 top-full mt-8 w-80 premium-gradient border border-yellow-400/20 rounded-2xl shadow-2xl py-4 z-[9999] animate-fade-in gold-glow transform -translate-x-1/2 left-1/2"}
    `}>
      {items.map((item, index) => (
        <Link
          key={`${item.label}-${item.href}`}
          href={item.href}
          className={`
            block px-4 py-3 text-white hover:gold-text hover:gold-glass transition-all duration-300 rounded-xl mx-3 premium-hover
            ${isMobile ? "text-base" : ""}
            ${index === 0 ? "rounded-t-xl" : ""} 
            ${index === items.length - 1 ? "rounded-b-xl" : ""}
          `}
          onClick={() => {
            onClose();
            onItemClick?.();
          }}
        >
          <div className="font-semibold text-sm gold-text">{item.label}</div>
          {item.description && (
            <div className="text-xs text-gray-300 mt-1">{item.description}</div>
          )}
        </Link>
      ))}
    </div>
  );
};

// Componente principal del Navbar
export default function Navbar({ scrolled }: { scrolled?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as UserWithRole;
  
  // Estados
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Referencias
  const navbarRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Notificaciones
  const { notifications, stats, markAsRead, markAllAsRead, loading, loadNotifications } = useNotifications();

  // Actualizar contador del carrito
  useEffect(() => {
    const updateCartCount = () => {
      const stored = localStorage.getItem("cart");
      const cart = stored ? JSON.parse(stored) : [];
      const count = cart.reduce((acc: number, item: { quantity?: number }) => 
        acc + (item.quantity || 1), 0);
      setCartCount(count);
    };
    
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [pathname]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && mobileMenuOpen && 
          !mobileMenuRef.current.contains(event.target as Node) &&
          !(event.target as HTMLElement).closest('button[aria-label="Menú"]')) {
        setMobileMenuOpen(false);
      }
      if (showNotifications && 
          !(event.target as HTMLElement).closest('button[aria-label="Notificaciones"]') &&
          !(event.target as HTMLElement).closest('.notifications-dropdown') &&
          !(event.target as HTMLElement).closest('.notifications-content')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen, showNotifications]);

  // Manejar teclado para accesibilidad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
        setUserMenuOpen(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Obtener icono de notificación
  const getNotificationIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      order: '🛒',
      user: '👤',
      product: '🍺',
      system: '⚙️',
      admin: '👑',
      order_status: '🛒',
      service: '🔧',
    };
    return icons[type] || '📢';
  };

  // Toggle dropdown
  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  // Renderizar elemento de navegación
  const renderNavItem = (item: NavItem, isMobile = false) => {
    const baseClasses = "text-base font-medium px-4 py-2 transition-all duration-300 relative group rounded-xl premium-hover";
    const textClasses = item.highlight ? 'gold-text font-bold premium-text-shadow' : 'text-white hover:gold-text';

    // Elementos con dropdown
    if (item.dropdown && item.subitems) {
      return (
        <div key={item.label} className="relative">
          <button
            className={`
              flex items-center gap-2 px-4 py-2 text-base font-medium transition-all duration-300 rounded-xl premium-hover
              ${isMobile 
                ? "w-full text-left gold-glass" 
                : "hover:gold-glass"}
              ${activeDropdown === item.label ? "gold-text gold-glass" : "text-white hover:gold-text"}
            `}
            onClick={() => toggleDropdown(item.label)}
            aria-expanded={activeDropdown === item.label}
            aria-haspopup="true"
          >
            {item.label}
            <ChevronDown 
              className={`w-4 h-4 text-white transition-transform duration-300 ${
                activeDropdown === item.label ? "rotate-180 gold-text" : ""
              }`}
            />
          </button>
          {activeDropdown === item.label && item.subitems && (
            <div className="relative z-[9999]">
              <DropdownMenu
                items={item.subitems}
                isMobile={isMobile}
                isOpen={true}
                onClose={() => setActiveDropdown(null)}
                onItemClick={() => {
                  if (isMobile) setMobileMenuOpen(false);
                }}
              />
            </div>
          )}
        </div>
      );
    }

    // Scroll suave para Taprooms
    if (item.href === "/#taprooms") {
      return (
        <a
          key={item.href}
          href={item.href}
          className={`${baseClasses} ${textClasses}`}
          onClick={e => {
            e.preventDefault();
            if (window.location.pathname === "/") {
              const el = document.getElementById("taprooms");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            } else {
              router.push("/#taprooms");
            }
            if (isMobile) setMobileMenuOpen(false);
          }}
        >
          {item.label}
          {item.highlight && (
            <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-bold bg-gradient-to-r from-posoqo-gold to-posoqo-gold-accent text-posoqo-black rounded-full shadow-lg">
              ¡GRATIS!
            </span>
          )}
        </a>
      );
    }

    // Scroll suave para Contacto
    if (item.href === "/#contacto") {
      return (
        <a
          key={item.href}
          href={item.href}
          className={`${baseClasses} ${textClasses}`}
          onClick={e => {
            e.preventDefault();
            if (window.location.pathname === "/") {
              const el = document.getElementById("contacto");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            } else {
              router.push("/#contacto");
            }
            if (isMobile) setMobileMenuOpen(false);
          }}
        >
          {item.label}
        </a>
      );
    }

    // Links normales
    if (item.href) {
      return (
        <a
          key={item.href}
          href={item.href}
          className={`${baseClasses} ${textClasses}`}
          onClick={e => {
            e.preventDefault();
            router.push(item.href!);
            if (isMobile) setMobileMenuOpen(false);
          }}
        >
          {item.label}
          {item.highlight && (
            <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-bold bg-gradient-to-r from-posoqo-gold to-posoqo-gold-accent text-posoqo-black rounded-full shadow-lg">
              ¡GRATIS!
            </span>
          )}
        </a>
      );
    }
    return null;
  };

  return (
    <>
      <nav 
        ref={navbarRef}
        className={`
          fixed top-0 left-0 w-full z-50 transition-all duration-300 
          ${scrolled ? "navbar-premium border-b border-yellow-400/20 shadow-2xl gold-glow" : "navbar-premium"}
          ${montserrat.className}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            
            {/* Logo */}
            <Link 
              href="/" 
              className="flex-shrink-0 flex items-center gap-3 group"
              aria-label="Inicio"
            >
              <div className="relative">
                <Image 
                  src="/Logo.png" 
                  alt="POSOQO" 
                  width={48} 
                  height={48} 
                  className="h-8 w-8 lg:h-10 lg:w-10 object-contain transition-transform duration-200 group-hover:scale-110"
                  priority
                />
              </div>
              <span className={`text-xl lg:text-2xl font-extrabold gold-text tracking-wide ${playfair.className} group-hover:scale-105 transition-all duration-200 premium-text-shadow`}>
                POSOQO
              </span>
            </Link>

            {/* Navegación desktop - Más limpia y organizada */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => renderNavItem(item))}
            </div>

            {/* Acciones desktop - Más organizadas */}
            <div className="hidden lg:flex items-center space-x-2">
              
              {/* Notificaciones */}
              {session && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl gold-glass hover:gold-glow transition-all duration-300 premium-hover"
                    aria-label="Notificaciones"
                  >
                    <Bell className="w-5 h-5 text-white" />
                    {stats.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                        {stats.unread}
                      </span>
                    )}
                  </button>

                  {/* Dropdown de notificaciones */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-gray-900 rounded-2xl shadow-2xl border border-posoqo-gray-dark/50 py-3 z-50 notifications-content">
                      <div className="px-4 py-3 border-b border-posoqo-gray-dark/50">
                        <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#FFD700]" />
                          Notificaciones
                        </h3>
                        <p className="text-posoqo-gray-light text-xs mt-1">
                          {stats.unread} sin leer de {stats.total} total
                        </p>
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="text-posoqo-gray-light text-4xl mb-2">🔔</div>
                          <p className="text-posoqo-gray-light text-sm">No hay notificaciones</p>
                          <p className="text-posoqo-gray-medium text-xs mt-1">Te notificaremos cuando haya novedades</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                          {/* Botón marcar todas como leídas */}
                          {stats.unread > 0 && (
                            <div className="px-4 py-2 border-b border-posoqo-gray-dark/50">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAllAsRead();
                                }}
                                className="w-full text-center text-[#FFD700] text-sm hover:text-[#FFA500] py-2 px-3 rounded-xl hover:bg-posoqo-black-light/50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                              >
                                <span className="text-lg">📋</span>
                                Marcar todas como leídas ({stats.unread})
                              </button>
                            </div>
                          )}
                          
                          {/* Lista de notificaciones */}
                          <div className="space-y-1 p-2">
                            {notifications.slice(0, 8).map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-posoqo-black-light/50 hover:scale-[1.02] ${
                                  !notification.is_read ? 'bg-posoqo-black-light/30 border-l-4 border-posoqo-gold shadow-lg' : 'bg-posoqo-black-light/10'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <span className="text-lg flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</span>
                                  <div className="flex-1 min-w-0">
                                                                          <div className="text-[#FFD700] text-sm font-medium leading-tight">
                                      {notification.title}
                                    </div>
                                    {notification.message && notification.message !== notification.title && (
                                      <div className="text-posoqo-gray-light text-xs mt-1 leading-relaxed">
                                        {notification.message}
                                      </div>
                                    )}
                                    <div className="text-posoqo-gray-light text-xs mt-2 flex items-center">
                                      <span className="mr-2">🕒</span>
                                      {new Date(notification.created_at).toLocaleString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                  {!notification.is_read && (
                                    <div className="flex flex-col items-center space-y-1">
                                      <span className="w-2 h-2 bg-posoqo-gold rounded-full flex-shrink-0 animate-pulse"></span>
                                                                              <span className="text-xs text-[#FFD700] font-medium">Nueva</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {notifications.length > 8 && (
                        <div className="px-4 py-2 border-t border-posoqo-gray-dark/50">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Ver todas las notificaciones');
                            }}
                            className="w-full text-center text-[#FFD700] text-sm hover:text-[#FFA500] py-2 px-3 rounded-xl hover:bg-posoqo-black-light/50 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <span className="text-lg">📋</span>
                            Ver todas las notificaciones
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Carrito */}
              <button
                onClick={() => router.push("/cart")}
                className="relative p-2 rounded-xl gold-glass hover:gold-glow transition-all duration-300 premium-hover"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-posoqo-gold to-posoqo-gold-accent text-posoqo-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-posoqo-black shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Usuario */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    className="flex items-center gap-2 p-2.5 rounded-xl gold-glass hover:gold-glow transition-all duration-300 premium-hover"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="Menú de usuario"
                    aria-expanded={userMenuOpen}
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "Usuario"}
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-7 h-7 text-white" />
                    )}
                    <span className="text-white font-medium text-sm max-w-[120px] truncate">
                      {user.name || "Mi cuenta"}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 premium-gradient border border-yellow-400/20 rounded-2xl shadow-2xl py-3 z-50 gold-glow">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            router.push("/dashboard");
                            setUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-3 text-white hover:gold-text hover:gold-glass font-semibold transition-all duration-300 flex items-center gap-3 premium-hover"
                        >
                          <Crown className="w-4 h-4" />
                          Panel Admin
                        </button>
                      )}
                      <button
                        onClick={() => {
                          router.push("/profile");
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-white hover:gold-text hover:gold-glass transition-all duration-300 flex items-center gap-3 premium-hover"
                      >
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </button>
                      <button
                        onClick={() => {
                          router.push("/profile/payments");
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-white hover:gold-text hover:gold-glass transition-all duration-300 flex items-center gap-3 premium-hover"
                      >
                        <CreditCard className="w-4 h-4" />
                        Mis Pagos
                      </button>
                      <button
                        onClick={() => {
                          router.push("/favorites");
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-white hover:gold-text hover:gold-glass transition-all duration-300 flex items-center gap-3 premium-hover"
                      >
                        <Heart className="w-4 h-4" />
                        Favoritos
                      </button>
                      <button
                        onClick={() => {
                          router.push("/orders");
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-white hover:gold-text hover:gold-glass transition-all duration-300 flex items-center gap-3 premium-hover"
                      >
                        <Package className="w-4 h-4" />
                        Mis Pedidos
                      </button>
                      <div className="border-t border-posoqo-gray-dark/50 my-2"></div>
                      <button
                        onClick={() => {
                          router.push("/api/auth/signout");
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="px-6 py-2 rounded-xl font-semibold gold-gradient text-black hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl gold-glow premium-hover"
                >
                  Iniciar sesión
                </button>
              )}
            </div>

            {/* Botones móviles - Más organizados */}
            <div className="flex lg:hidden items-center space-x-1">
              
              {/* Notificaciones móvil */}
              {session && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl gold-glass hover:gold-glow transition-all duration-300 premium-hover"
                    aria-label="Notificaciones"
                  >
                    <Bell className="w-5 h-5 text-white" />
                    {stats.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-lg">
                        {stats.unread}
                      </span>
                    )}
                  </button>

                  {/* Dropdown de notificaciones móvil */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-2xl shadow-2xl border border-posoqo-gray-dark/50 py-3 z-50 notifications-dropdown notifications-content">
                      <div className="px-4 py-3 border-b border-posoqo-gray-dark/50">
                        <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#FFD700]" />
                          Notificaciones
                        </h3>
                        <p className="text-posoqo-gray-light text-xs mt-1">
                          {stats.unread} sin leer de {stats.total} total
                        </p>
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <div className="text-posoqo-gray-light text-3xl mb-2">🔔</div>
                          <p className="text-posoqo-gray-light text-sm">No hay notificaciones</p>
                          <p className="text-posoqo-gray-medium text-xs mt-1">Te notificaremos cuando haya novedades</p>
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          {/* Botón marcar todas como leídas */}
                          {stats.unread > 0 && (
                            <div className="px-4 py-2 border-b border-posoqo-gray-dark/50">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAllAsRead();
                                }}
                                className="w-full text-center text-[#FFD700] text-sm hover:text-[#FFA500] py-2 px-3 rounded-xl hover:bg-posoqo-black-light/50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                              >
                                <span className="text-lg">📋</span>
                                Marcar todas como leídas ({stats.unread})
                              </button>
                            </div>
                          )}
                          
                          {/* Lista de notificaciones */}
                          <div className="space-y-1 p-2">
                            {notifications.slice(0, 6).map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-posoqo-black-light/50 hover:scale-[1.02] ${
                                  !notification.is_read ? 'bg-posoqo-black-light/30 border-l-4 border-posoqo-gold shadow-lg' : 'bg-posoqo-black-light/10'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <span className="text-lg flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</span>
                                  <div className="flex-1 min-w-0">
                                                                          <div className="text-[#FFD700] text-sm font-medium leading-tight">
                                      {notification.title}
                                    </div>
                                    {notification.message && notification.message !== notification.title && (
                                      <div className="text-posoqo-gray-light text-xs mt-1 leading-relaxed">
                                        {notification.message}
                                      </div>
                                    )}
                                    <div className="text-posoqo-gray-light text-xs mt-2 flex items-center">
                                      <span className="mr-2">🕒</span>
                                      {new Date(notification.created_at).toLocaleString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                  {!notification.is_read && (
                                    <div className="flex flex-col items-center space-y-1">
                                      <span className="w-2 h-2 bg-posoqo-gold rounded-full flex-shrink-0 animate-pulse"></span>
                                                                              <span className="text-xs text-[#FFD700] font-medium">Nueva</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {notifications.length > 6 && (
                        <div className="px-4 py-2 border-t border-posoqo-gray-dark/50">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Ver todas las notificaciones (móvil)');
                            }}
                            className="w-full text-center text-[#FFD700] text-sm hover:text-[#FFA500] py-2 px-3 rounded-xl hover:bg-posoqo-black-light/50 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <span className="text-lg">📋</span>
                            Ver todas las notificaciones
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Carrito móvil */}
              <button
                onClick={() => router.push("/cart")}
                className="relative p-2 rounded-xl gold-glass hover:gold-glow transition-all duration-300 premium-hover"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-posoqo-gold to-posoqo-gold-accent text-posoqo-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-posoqo-black shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Menú móvil */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl gold-glass hover:gold-glow focus:outline-none transition-all duration-300 premium-hover"
                aria-label="Menú"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú móvil - Más limpio y organizado */}
      <div 
        ref={mobileMenuRef}
        className={`
          lg:hidden fixed inset-0 z-40 premium-gradient transition-all duration-300 ease-in-out
          ${mobileMenuOpen 
            ? "opacity-100 translate-y-0 mt-16" 
            : "opacity-0 -translate-y-full pointer-events-none"}
        `}
      >
        <div className="px-6 py-8 space-y-1 overflow-y-auto h-full pt-4">
          
          {/* Navegación móvil */}
          {navItems.map((item) => renderNavItem(item, true))}
          
          {/* Sección de usuario móvil - Más limpia */}
          <div className="pt-6 border-t border-posoqo-gray-dark/50 space-y-1">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-base font-medium text-white hover:gold-text hover:gold-glass rounded-xl transition-all duration-300 flex items-center gap-3 premium-hover"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Mi Perfil
                </Link>
                <Link
                  href="/profile/payments"
                  className="block px-4 py-3 text-base font-medium text-white hover:gold-text hover:gold-glass rounded-xl transition-all duration-300 flex items-center gap-3 premium-hover"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CreditCard className="w-5 h-5" />
                  Mis Pagos
                </Link>
                <Link
                  href="/favorites"
                  className="block px-4 py-3 text-base font-medium text-white hover:gold-text hover:gold-glass rounded-xl transition-all duration-300 flex items-center gap-3 premium-hover"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  Favoritos
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-3 text-base font-medium text-white hover:gold-text hover:gold-glass rounded-xl transition-all duration-300 flex items-center gap-3 premium-hover"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5" />
                  Mis Pedidos
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-base font-medium text-white hover:gold-text hover:gold-glass rounded-xl transition-all duration-300 flex items-center gap-3 premium-hover"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Crown className="w-5 h-5" />
                    Panel Admin
                  </Link>
                )}
                <div className="border-t border-posoqo-gray-dark/50 my-2"></div>
                <button
                  onClick={() => {
                    router.push("/api/auth/signout");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-red-400 hover:bg-posoqo-black-light/50 rounded-xl transition-all duration-200 flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </>
            ) : (
                <button
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 rounded-xl font-semibold gold-gradient text-black hover:scale-105 transition-all duration-300 shadow-lg gold-glow premium-hover"
                >
                  Iniciar sesión
                </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}