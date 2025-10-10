// components/navbar/NavLinks.tsx
import React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { NavItem } from '@/types/navbar';
import { NavDropdown } from './NavDropdown';

interface NavLinksProps {
  items: NavItem[];
  activeDropdown: string | null;
  toggleDropdown: (label: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  setActiveDropdown: (value: string | null) => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export const NavLinks: React.FC<NavLinksProps> = ({
  items,
  activeDropdown,
  toggleDropdown,
  dropdownRef,
  setActiveDropdown,
  isMobile = false,
  onMobileClose,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const renderNavItem = (item: NavItem) => {
    if (!item || !item.label) return null;
    
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
              <NavDropdown
                items={item.subitems}
                isMobile={isMobile}
                isOpen={true}
                onClose={() => setActiveDropdown(null)}
                onItemClick={() => {
                  if (isMobile) onMobileClose?.();
                }}
                dropdownRef={dropdownRef}
              />
            </div>
          )}
        </div>
      );
    }

    // Scroll suave para anclas
    if (item.href?.startsWith('/#')) {
      return (
        <a
          key={item.href}
          href={item.href}
          className={`${baseClasses} ${textClasses}`}
          onClick={e => {
            e.preventDefault();
            const anchor = item.href!.split('#')[1];
            try {
              if (window.location.pathname === "/") {
                const el = document.getElementById(anchor);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              } else {
                router.push(item.href!);
              }
              if (isMobile) onMobileClose?.();
            } catch (error) {
              router.push(item.href!);
              if (isMobile) onMobileClose?.();
            }
          }}
        >
          {item.label}
          {item.highlight && (
            <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-full shadow-lg">
              ¡GRATIS!
            </span>
          )}
        </a>
      );
    }

    // Links normales
    if (item.href) {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`${baseClasses} ${textClasses} cursor-pointer`}
          onClick={() => {
            console.log('Navegando a:', item.href);
            if (isMobile) onMobileClose?.();
          }}
        >
          {item.label}
          {item.highlight && (
            <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-full shadow-lg">
              ¡GRATIS!
            </span>
          )}
        </Link>
      );
    }
    return null;
  };

  return (
    <>
      {items.map((item) => renderNavItem(item))}
    </>
  );
};
