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
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              isMobile ? "w-full text-left" : ""
            } ${
              activeDropdown === item.label || isActive 
                ? "text-yellow-400" 
                : "text-gray-300 hover:text-white"
            }`}
            onClick={() => toggleDropdown(item.label)}
          >
            {item.label}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {activeDropdown === item.label && item.dropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className={isMobile 
                  ? "pl-4 mt-2 space-y-1" 
                  : "absolute left-0 top-full mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden"
                }
              >
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
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 w-full text-left"
                    >
                      {subItem.icon && <subItem.icon className="w-5 h-5" />}
                      <div>
                        <div className="text-sm font-medium">{subItem.label}</div>
                        {subItem.description && (
                          <div className="text-xs text-gray-500">{subItem.description}</div>
                        )}
                      </div>
                    </Element>
                  );
                })}
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
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            isMobile ? "w-full text-left" : ""
          } ${
            isActive ? "text-yellow-400" : "text-gray-300 hover:text-white"
          }`}
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
