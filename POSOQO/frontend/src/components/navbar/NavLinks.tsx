// src/components/navbar/NavLinks.tsx
'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  dropdown?: {
    label: string;
    href?: string;
    onClick?: () => void;
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
        <div key={item.label} className="relative">
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isMobile ? "w-full text-left" : "relative"
            } ${
              activeDropdown === item.label || isActive 
                ? "text-white" 
                : "text-gray-400 hover:text-white"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown(item.label);
            }}
          >
            <span className="relative">{item.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-all duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
            {(activeDropdown === item.label || isActive) && !isMobile && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            )}
          </button>
          
          <AnimatePresence>
            {activeDropdown === item.label && item.dropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className={isMobile 
                  ? "pl-4 mt-2 space-y-0.5" 
                  : "absolute left-0 top-full mt-2 w-64 bg-black/95 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-50"
                }
                style={!isMobile ? {
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)'
                } : {}}
              >
                <div className={isMobile ? "py-1" : "p-2"}>
                  {item.dropdown.map((subItem, index) => {
                    const key = subItem.href || `dropdown-item-${index}`;
                    const Element = subItem.href ? 'a' : 'button';
                    const elementProps = subItem.href 
                      ? { href: subItem.href }
                      : { type: 'button' as const };
                    
                    return (
                      <Element
                        key={key}
                        {...elementProps}
                        onClick={() => {
                          if (subItem.onClick) subItem.onClick();
                          if (isMobile) onMobileClose?.();
                          setActiveDropdown(null);
                        }}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 w-full text-left ${
                          isMobile 
                            ? "text-gray-300 hover:text-white hover:bg-white/5" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {subItem.icon && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all duration-150">
                            <subItem.icon className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors duration-150" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors duration-150">
                            {subItem.label}
                          </div>
                          {subItem.description && (
                            <div className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors duration-150">
                              {subItem.description}
                            </div>
                          )}
                        </div>
                      </Element>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Links normales o botones
    if (item.href || item.onClick) {
      const Element = item.href ? 'a' : 'button';
      const elementProps = item.href 
        ? { href: item.href }
        : { type: 'button' as const };
      
      return (
        <Element
          key={item.href || item.label}
          {...elementProps}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative ${
            isMobile ? "w-full text-left" : ""
          } ${
            isActive 
              ? "text-white" 
              : "text-gray-400 hover:text-white"
          }`}
          style={isActive && !isMobile ? {
            background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent)'
          } : {}}
          onClick={() => {
            if (item.onClick) item.onClick();
            if (isMobile) onMobileClose?.();
          }}
        >
          {item.label}
        </Element>
      );
    }
    return null;
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-1' : 'flex-row items-center space-x-1'}`}>
      {items.map((item) => renderNavItem(item))}
    </div>
  );
};
