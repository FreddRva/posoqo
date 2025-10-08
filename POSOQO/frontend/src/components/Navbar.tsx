"use client";
import React from "react";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { Montserrat } from "next/font/google";
import { useNotifications } from "@/hooks/useNotifications";
import { useCart } from "@/hooks/useCart";
import { useNavbar } from "@/hooks/useNavbar";
import { navItems } from "@/config/navigation";
import { UserWithRole } from "@/types/navbar";

// Componentes
import { NavLogo } from "./navbar/NavLogo";
import { NavLinks } from "./navbar/NavLinks";
import { NavNotifications } from "./navbar/NavNotifications";
import { NavUserMenu } from "./navbar/NavUserMenu";
import { NavMobileMenu } from "./navbar/NavMobileMenu";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

interface NavbarProps {
  scrolled?: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  const { data: session } = useSession();
  const user = session?.user as UserWithRole;
  const { itemCount } = useCart();
  const { notifications, stats, markAsRead, markAllAsRead } = useNotifications();
  
  const {
    router,
    mobileMenuOpen,
    setMobileMenuOpen,
    userMenuOpen,
    setUserMenuOpen,
    activeDropdown,
    setActiveDropdown,
    showNotifications,
    setShowNotifications,
    navbarRef,
    userMenuRef,
    mobileMenuRef,
    dropdownRef,
    toggleDropdown,
  } = useNavbar();

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
            <NavLogo />

            {/* Navegación desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavLinks
                items={navItems}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
                dropdownRef={dropdownRef as React.RefObject<HTMLDivElement>}
                setActiveDropdown={setActiveDropdown}
              />
            </div>

            {/* Acciones desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Notificaciones */}
              {session && (
                <NavNotifications
                  notifications={notifications}
                  stats={stats}
                  showNotifications={showNotifications}
                  onToggle={() => setShowNotifications(!showNotifications)}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
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
                <NavUserMenu
                  user={user}
                  isOpen={userMenuOpen}
                  onClose={() => setUserMenuOpen(!userMenuOpen)}
                  onNavigate={(path) => router.push(path)}
                  userMenuRef={userMenuRef as React.RefObject<HTMLDivElement>}
                />
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="px-6 py-2 rounded-lg font-semibold bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300"
                >
                  Iniciar sesión
                </button>
              )}
            </div>

            {/* Botones móviles */}
            <div className="flex lg:hidden items-center space-x-1">
              {/* Notificaciones móvil */}
              {session && (
                <NavNotifications
                  notifications={notifications}
                  stats={stats}
                  showNotifications={showNotifications}
                  onToggle={() => setShowNotifications(!showNotifications)}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
              )}

              {/* Carrito móvil */}
              <button
                onClick={() => router.push("/cart")}
                className="relative p-2 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 transition-all duration-300 hover:shadow-lg"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5 text-yellow-400" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-black shadow-lg">
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

      {/* Menú móvil */}
      <NavMobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        navItems={navItems}
        activeDropdown={activeDropdown}
        toggleDropdown={toggleDropdown}
        dropdownRef={dropdownRef as React.RefObject<HTMLDivElement>}
        setActiveDropdown={setActiveDropdown}
        onNavigate={(path) => router.push(path)}
        mobileMenuRef={mobileMenuRef as React.RefObject<HTMLDivElement>}
      />
    </>
  );
}
