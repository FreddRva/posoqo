// components/navbar/NavMobileMenu.tsx
import React from 'react';
import Link from 'next/link';
import { X, Menu, User, CreditCard, Heart, Package, Crown, LogOut } from 'lucide-react';
import { UserWithRole } from '@/types/navbar';
import { NavItem } from '@/types/navbar';
import { NavLinks } from './NavLinks';

interface NavMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithRole | null;
  navItems: NavItem[];
  activeDropdown: string | null;
  toggleDropdown: (label: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  setActiveDropdown: (value: string | null) => void;
  onNavigate: (path: string) => void;
  mobileMenuRef: React.RefObject<HTMLDivElement>;
}

export const NavMobileMenu: React.FC<NavMobileMenuProps> = ({
  isOpen,
  onClose,
  user,
  navItems,
  activeDropdown,
  toggleDropdown,
  dropdownRef,
  setActiveDropdown,
  onNavigate,
  mobileMenuRef,
}) => {
  return (
    <div ref={mobileMenuRef} className={`lg:hidden fixed inset-0 z-40 pointer-events-none`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-[88%] max-w-[380px] bg-[#0b0b0b] border-l border-yellow-400/20 shadow-[0_10px_40px_rgba(255,215,0,0.12)] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} pointer-events-auto`}
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
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Navegación móvil */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Navegación</h3>
            <NavLinks
              items={navItems}
              activeDropdown={activeDropdown}
              toggleDropdown={toggleDropdown}
              dropdownRef={dropdownRef}
              setActiveDropdown={setActiveDropdown}
              isMobile={true}
              onMobileClose={onClose}
            />
          </div>
          
          {/* Sección de usuario móvil */}
          {user && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Mi Cuenta</h3>
              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                  onClick={onClose}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span>Mi Perfil</span>
                </Link>
                <Link
                  href="/profile/payments"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                  onClick={onClose}
                >
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <span>Mis Pagos</span>
                </Link>
                <Link
                  href="/favorites"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                  onClick={onClose}
                >
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span>Favoritos</span>
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                  onClick={onClose}
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <span>Mis Pedidos</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-base font-medium text-white hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                    onClick={onClose}
                  >
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <span>Panel Admin</span>
                  </Link>
                )}
                <div className="border-t border-gray-800/50 my-2"></div>
                <button
                  onClick={() => {
                    onNavigate("/api/auth/signout");
                    onClose();
                  }}
                  className="block w-full px-4 py-3 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-white" />
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
                  onNavigate("/login");
                  onClose();
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
  );
};
