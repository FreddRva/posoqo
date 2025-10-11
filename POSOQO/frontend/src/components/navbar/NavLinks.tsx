// src/components/navbar/NavLinks.tsx
import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href?: string;
  dropdown?: {
    label: string;
    href: string;
    description?: string;
    icon: any;
  }[];
};

interface NavLinksProps {
  items: NavItem[];
  activeDropdown: string | null;
  toggleDropdown: (label: string) => void;
  setActiveDropdown: (value: string | null) => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export const NavLinks: React.FC<NavLinksProps> = ({
  items,
  activeDropdown,
  toggleDropdown,
  setActiveDropdown,
  isMobile = false,
  onMobileClose,
}) => {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem) => {
    if (!item || !item.label) return null;
    
    const isActive = item.href ? pathname?.startsWith(item.href.split('?')[0]) : false;

    // Elementos con dropdown
    if (item.dropdown) {
      return (
        <div key={item.label} className="relative group">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative flex items-center gap-2 px-5 py-2.5 text-base font-semibold transition-all duration-300 rounded-xl overflow-hidden
              ${isMobile 
                ? "w-full text-left" 
                : ""}
              ${activeDropdown === item.label || isActive 
                ? "text-yellow-400" 
                : "text-white hover:text-yellow-400"}
            `}
            onClick={() => toggleDropdown(item.label)}
            aria-expanded={activeDropdown === item.label}
            aria-haspopup="true"
          >
            {/* Fondo animado en hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            
            {/* Contenido del botón */}
            <span className="relative z-10 flex items-center gap-2">
              {item.label}
              <motion.div
                animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </span>
            
            {/* Borde inferior dorado */}
            {(activeDropdown === item.label || isActive) && (
              <motion.div
                layoutId={`underline-${item.label}`}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </motion.button>
          
          {/* Dropdown Menu */}
          <AnimatePresence>
            {activeDropdown === item.label && item.dropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={isMobile 
                  ? "pl-4 space-y-1 mt-2" 
                  : "absolute left-0 top-full mt-3 w-72 bg-gray-900/98 backdrop-blur-2xl border border-yellow-400/30 rounded-2xl shadow-[0_20px_60px_rgba(251,191,36,0.15)] overflow-hidden z-50"
                }
              >
                {/* Efecto de brillo en la parte superior */}
                {!isMobile && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
                )}
                
                {item.dropdown.map((subItem, index) => (
                  <motion.div
                    key={subItem.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={subItem.href}
                      onClick={() => {
                        if (isMobile) onMobileClose?.();
                        setActiveDropdown(null);
                      }}
                      className="group/item relative flex items-start gap-4 px-5 py-4 text-white hover:text-yellow-400 transition-all duration-300 overflow-hidden"
                    >
                      {/* Fondo en hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                      
                      {/* Icono */}
                      {subItem.icon && (
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          className="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-500/20 flex items-center justify-center group-hover/item:from-yellow-400/30 group-hover/item:to-amber-500/30 transition-all duration-300"
                        >
                          <subItem.icon className="w-5 h-5" />
                        </motion.div>
                      )}
                      
                      {/* Texto */}
                      <div className="relative z-10 flex-1">
                        <div className="font-semibold text-base mb-0.5 flex items-center gap-2">
                          {subItem.label}
                          <Sparkles className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                        </div>
                        {subItem.description && (
                          <div className="text-xs text-gray-400 group-hover/item:text-gray-300 transition-colors duration-300">
                            {subItem.description}
                          </div>
                        )}
                      </div>
                      
                      {/* Indicador de flecha */}
                      <motion.div
                        initial={{ x: -5, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        className="relative z-10 text-yellow-400"
                      >
                        →
                      </motion.div>
                    </Link>
                    
                    {/* Separador */}
                    {!isMobile && item.dropdown && index < item.dropdown.length - 1 && (
                      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Links normales
    if (item.href) {
      return (
        <motion.div
          key={item.href}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          <Link
            href={item.href}
            className={`
              relative block px-5 py-2.5 text-base font-semibold transition-all duration-300 rounded-xl overflow-hidden
              ${isActive 
                ? 'text-yellow-400' 
                : 'text-white hover:text-yellow-400'}
            `}
            onClick={() => {
              if (isMobile) onMobileClose?.();
            }}
          >
            {/* Fondo animado en hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            
            {/* Texto */}
            <span className="relative z-10">{item.label}</span>
            
            {/* Borde inferior dorado */}
            {isActive && (
              <motion.div
                layoutId={`underline-${item.href}`}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </Link>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row items-center space-x-1'}`}>
      {items.map((item) => renderNavItem(item))}
    </div>
  );
};
