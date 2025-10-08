// components/navbar/NavUserMenu.tsx
import React from 'react';
import Image from 'next/image';
import { User, Crown, Heart, Package, CreditCard, LogOut } from 'lucide-react';
import { UserWithRole } from '@/types/navbar';

interface NavUserMenuProps {
  user: UserWithRole;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  userMenuRef: React.RefObject<HTMLDivElement>;
}

export const NavUserMenu: React.FC<NavUserMenuProps> = ({
  user,
  isOpen,
  onClose,
  onNavigate,
  userMenuRef,
}) => {
  const handleNavigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div className="relative" ref={userMenuRef}>
      <button
        className="flex items-center gap-2 p-2.5 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 transition-all duration-300 hover:shadow-lg"
        onClick={() => onClose()}
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
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
          {user.name ? user.name.substring(0, 20) : "Mi cuenta"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 sm:w-64 rounded-2xl border border-yellow-400/20 bg-[rgba(15,15,15,0.75)] backdrop-blur-xl shadow-[0_10px_40px_rgba(255,215,0,0.12)] py-3 z-[9999]">
          {user?.role === 'admin' && (
            <button
              onClick={() => handleNavigate("/dashboard")}
              className="block w-full text-left px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 font-semibold transition-all duration-300 flex items-center gap-3"
            >
              <Crown className="w-4 h-4" />
              Panel Admin
            </button>
          )}
          <button
            onClick={() => handleNavigate("/profile")}
            className="block w-full text-left px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 flex items-center gap-3"
          >
            <User className="w-4 h-4" />
            Mi Perfil
          </button>
          <button
            onClick={() => handleNavigate("/profile/payments")}
            className="block w-full text-left px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 flex items-center gap-3"
          >
            <CreditCard className="w-4 h-4" />
            Mis Pagos
          </button>
          <button
            onClick={() => handleNavigate("/favorites")}
            className="block w-full text-left px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 flex items-center gap-3"
          >
            <Heart className="w-4 h-4" />
            Favoritos
          </button>
          <button
            onClick={() => handleNavigate("/orders")}
            className="block w-full text-left px-4 py-3 text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 flex items-center gap-3"
          >
            <Package className="w-4 h-4" />
            Mis Pedidos
          </button>
          <div className="border-t border-gray-800/50 my-2"></div>
          <button
            onClick={() => handleNavigate("/api/auth/signout")}
            className="block w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 flex items-center gap-3"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};
