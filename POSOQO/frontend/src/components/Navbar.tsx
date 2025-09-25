"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, User, Bell, ChevronDown, Crown, Heart, Package, CreditCard, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Montserrat, Playfair_Display } from "next/font/google";
import { useNotifications } from "@/hooks/useNotifications";
import { useCart } from "@/hooks/useCart";

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
  { label: "Nosotros", href: "/sobre-nosotros" },
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
        label: "Refrescos", 
        href: "/products?filter=refrescos",
        description: "Bebidas no alcohólicas refrescantes"
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
  dropdownRef,
}: {
  items: { label: string; href: string; description?: string }[];
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) => {
  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={`
      ${isMobile 
        ? "pl-6 space-y-3 mt-2" 
        : "fixed left-1/2 -translate-x-1/2 top-20 w-[22rem] p-3 z-[9999] animate-fade-in"}
    `}>
      {!isMobile && (
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/10 via-yellow-300/5 to-transparent blur-xl" />
          <div className="relative rounded-2xl border border-yellow-400/20 bg-[rgba(15,15,15,0.75)] backdrop-blur-xl shadow-[0_10px_40px_rgba(255,215,0,0.12)] divide-y divide-yellow-400/10">
            {items.map((item, index) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={`block px-4 py-3 transition-colors duration-200 hover:bg-yellow-400/10`}
                onClick={() => {
                  onItemClick?.();
                  setTimeout(() => { onClose(); }, 100);
                }}
              >
                <div className="font-semibold text-sm text-yellow-300">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-300/90 mt-1">{item.description}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {isMobile && items.map((item) => (
        <Link
          key={`${item.label}-${item.href}`}
          href={item.href}
          className="block px-4 py-3 text-yellow-300 hover:text-yellow-200 transition-colors duration-200 rounded-xl"
          onClick={() => { onItemClick?.(); setTimeout(() => onClose(), 100); }}
        >
          <div className="font-semibold text-base">{item.label}</div>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Hook del carrito
  const { itemCount } = useCart();
  
  
  // Referencias
  const navbarRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notificaciones
  const { notifications, stats, markAsRead, markAllAsRead, loading, loadNotifications } = useNotifications();


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
      // Cerrar dropdown solo si se hace clic en otro botón de dropdown o en elementos específicos
      if (activeDropdown && dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) &&
          !(event.target as HTMLElement).closest('button[aria-expanded="true"]') &&
          !(event.target as HTMLElement).closest('a[href]')) {
        // Solo cerrar si no es un enlace de navegación
        const target = event.target as HTMLElement;
        if (!target.closest('a') && !target.closest('button[aria-expanded]')) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen, showNotifications, activeDropdown]);

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
    const baseClasses = "text-base font-medium px-4 py-2 transition-all duration-300 relative group rounded-xl hover:bg-yellow-400/20 hover:shadow-lg";
    const isActive = item.href ? pathname?.startsWith(item.href.split('?')[0]) : false;
    const textClasses = item.highlight
      ? 'text-yellow-400 font-bold drop-shadow-lg'
      : isActive
        ? 'text-yellow-400 font-semibold'
        : 'bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 font-semibold';

    // Elementos con dropdown
    if (item.dropdown && item.subitems) {
      return (
        <div key={item.label} className="relative">
          <button
            className={`
              flex items-center gap-2 px-4 py-2 text-base font-medium transition-all duration-300 rounded-xl hover:bg-yellow-400/20 hover:shadow-lg
              ${isMobile 
                ? "w-full text-left bg-yellow-400/10" 
                : "hover:bg-yellow-400/20"}
              ${activeDropdown === item.label || isActive ? "text-yellow-400 bg-yellow-400/20 shadow-lg font-bold" : "bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 font-semibold"}
            `}
            onClick={() => toggleDropdown(item.label)}
            aria-expanded={activeDropdown === item.label}
            aria-haspopup="true"
          >
            {item.label}
            <ChevronDown 
              className={`w-4 h-4 text-white transition-transform duration-300 ${
                activeDropdown === item.label ? "rotate-180 text-yellow-400" : ""
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
                dropdownRef={dropdownRef}
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
          fixed top-0 left-0 w-full z-50 transition-all duration-500 
          ${scrolled 
            ? "bg-gradient-to-r from-black via-neutral-800 to-black border-b border-yellow-400/30 shadow-2xl shadow-yellow-500/20 backdrop-blur-md" 
            : "bg-gradient-to-r from-black via-neutral-700 to-black backdrop-blur-sm shadow-yellow-500/10"
          }
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
              <span className={`text-xl lg:text-2xl font-extrabold text-yellow-400 tracking-wide ${playfair.className} group-hover:scale-105 transition-all duration-200 drop-shadow-lg shadow-yellow-500/30`}>
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
                    className="relative p-2 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 transition-all duration-300 hover:shadow-lg"
                    aria-label="Notificaciones"
                  >
                    <Bell className="w-5 h-5 text-yellow-400" />
                    {stats.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                        {stats.unread}
                      </span>
                    )}
                  </button>

                  {/* Dropdown de notificaciones */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-yellow-400/20 bg-[rgba(15,15,15,0.75)] backdrop-blur-xl shadow-[0_10px_40px_rgba(255,215,0,0.12)] py-3 z-50 notifications-content">
                      <div className="px-4 py-3 border-b border-gray-800/50">
                        <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#FFD700]" />
                          Notificaciones
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {stats.unread} sin leer de {stats.total} total
                        </p>
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="text-gray-400 text-4xl mb-2">🔔</div>
                          <p className="text-gray-400 text-sm">No hay notificaciones</p>
                          <p className="text-gray-500 text-xs mt-1">Te notificaremos cuando haya novedades</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                          {/* Botón marcar todas como leídas */}
                          {stats.unread > 0 && (
                            <div className="px-4 py-2 border-b border-gray-800/50">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAllAsRead();
                                }}
                                className="w-full text-center text-[#FFD700] text-sm hover:text-[#FFA500] py-2 px-3 rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
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
                                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-700/50 hover:scale-[1.02] ${
                                  !notification.is_read ? 'bg-gray-700/30 border-l-4 border-posoqo-gold shadow-lg' : 'bg-gray-700/10'
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
                                      <div className="text-gray-400 text-xs mt-1 leading-relaxed">
                                        {notification.message}
                                      </div>
                                    )}
                                    <div className="text-gray-400 text-xs mt-2 flex items-center">
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
                                      <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 animate-pulse"></span>
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
                        <div className="px-4 py-2 border-t border-gray-800/50">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Ver todas las notificaciones');
                            }}
                            className="w-full text-center text-[#FFD700] text-sm hover:text-[#FFA500] py-2 px-3 rounded-xl hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center gap-2"
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
                className="relative p-2 rounded-full border border-yellow-400/30 bg-black/20 hover:bg-yellow-400/20 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-black shadow-lg">
                    {itemCount}
                  </span>
                )}
              </button>
              
              {/* Usuario */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 transition-all duration-300 hover:shadow-lg"
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
                    <div className="absolute right-0 mt-3 w-56 sm:w-64 rounded-2xl border border-yellow-400/20 bg-[rgba(15,15,15,0.75)] backdrop-blur-xl shadow-[0_10px_40px_rgba(255,215,0,0.12)] py-3 z-[9999]">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            router.push("/dashboard");
                            setUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 font-semibold transition-all duration-300 flex items-center gap-3"
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
                        className="block w-full text-left px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 flex items-center gap-3"
                      >
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </button>
                      <button
                        onClick={() => {
                          router.push("/profile/payments");
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 flex items-center gap-3"
                      >
                        <CreditCard className="w-4 h-4" />
                        Mis Pagos
                      </button>
                      <button
                        onClick={() => {
                          router.push("/favorites");
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 flex items-center gap-3"
                      >
                        <Heart className="w-4 h-4" />
                        Favoritos
                      </button>
                      <button
                        onClick={() => {
                          router.push("/orders");
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 flex items-center gap-3"
                      >
                        <Package className="w-4 h-4" />
                        Mis Pedidos
                      </button>
                      <div className="border-t border-gray-800/50 my-2"></div>
                      <button
                        onClick={() => {
                          // Cerrar sesión
                          router.push("/api/auth/signout");
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 flex items-center gap-3"
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
                  className="px-6 py-2 rounded-lg font-semibold bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300"
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
                    className="relative p-2 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 transition-all duration-300 hover:shadow-lg"
                    aria-label="Notificaciones"
                  >
                    <Bell className="w-5 h-5 text-yellow-400" />
                    {stats.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-lg">
                        {stats.unread}
                      </span>
                    )}
                  </button>

                  {/* Dropdown de notificaciones móvil */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-yellow-400/20 bg-[rgba(15,15,15,0.85)] backdrop-blur-xl shadow-[0_10px_40px_rgba(255,215,0,0.12)] py-3 z-50 notifications-dropdown notifications-content">
                      <div className="px-4 py-3 border-b border-gray-800/50">
                        <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#FFD700]" />
                          Notificaciones
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {stats.unread} sin leer de {stats.total} total
                        </p>
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <div className="text-gray-400 text-3xl mb-2">🔔</div>
                          <p className="text-gray-400 text-sm">No hay notificaciones</p>
                          <p className="text-gray-500 text-xs mt-1">Te notificaremos cuando haya novedades</p>
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          {/* Botón marcar todas como leídas */}
                          {stats.unread > 0 && (
                            <div className="px-4 py-2 border-b border-gray-800/50">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAllAsRead();
                                }}
                                className="w-full text-center text-[#FFD700] text-sm hover:text-[#FFA500] py-2 px-3 rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
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
                                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-700/50 hover:scale-[1.02] ${
                                  !notification.is_read ? 'bg-gray-700/30 border-l-4 border-posoqo-gold shadow-lg' : 'bg-gray-700/10'
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
                                      <div className="text-gray-400 text-xs mt-1 leading-relaxed">
                                        {notification.message}
                                      </div>
                                    )}
                                    <div className="text-gray-400 text-xs mt-2 flex items-center">
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
                                      <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 animate-pulse"></span>
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
                        <div className="px-4 py-2 border-t border-gray-800/50">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Ver todas las notificaciones (móvil)');
                            }}
                            className="w-full text-center text-[#FFD700] text-sm hover:text-[#FFA500] py-2 px-3 rounded-xl hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center gap-2"
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
                className="relative p-2 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 transition-all duration-300 hover:shadow-lg"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5 text-yellow-400" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-posoqo-gold to-posoqo-gold-accent text-posoqo-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-posoqo-black shadow-lg">
                    {itemCount}
                  </span>
                )}
              </button>
              
              {/* Menú móvil */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 focus:outline-none transition-all duration-300 hover:shadow-lg"
                aria-label="Menú"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Menu className="w-5 h-5 text-yellow-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú móvil - Drawer profesional */}
      <div ref={mobileMenuRef} className={`lg:hidden fixed inset-0 z-40 pointer-events-none`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 h-full w-[88%] max-w-[380px] bg-[#0b0b0b] border-l border-yellow-400/20 shadow-[0_10px_40px_rgba(255,215,0,0.12)] transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} pointer-events-auto`}
          style={{ marginTop: '64px' }}
        >
        <div className="px-6 py-6 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
          
          {/* Header del menú móvil */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                <Menu className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Menú</h2>
                <p className="text-sm text-gray-400">Navegación principal</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Navegación móvil */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Navegación</h3>
            {navItems.map((item) => renderNavItem(item, true))}
          </div>
          
          {/* Sección de usuario móvil - Más limpia */}
          {user && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Mi Cuenta</h3>
              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span>Mi Perfil</span>
                </Link>
                <Link
                  href="/profile/payments"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span>Mis Pagos</span>
                </Link>
                <Link
                  href="/favorites"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span>Favoritos</span>
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <span>Mis Pedidos</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-base font-medium text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Crown className="w-4 h-4" />
                    </div>
                    <span>Panel Admin</span>
                  </Link>
                )}
                <div className="border-t border-gray-800/50 my-2"></div>
                <button
                  onClick={() => {
                    router.push("/api/auth/signout");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Botón de login si no está autenticado */}
          {!user && (
            <div className="pt-6">
              <button
                onClick={() => {
                  router.push("/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" />
                Iniciar sesión
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}