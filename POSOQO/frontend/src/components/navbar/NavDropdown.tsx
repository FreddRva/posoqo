// components/navbar/NavDropdown.tsx
import React from 'react';
import Link from 'next/link';

type DropdownItem = {
  label: string;
  href: string;
  description?: string;
};

interface NavDropdownProps {
  items: DropdownItem[];
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  items,
  isMobile,
  isOpen,
  onClose,
  onItemClick,
  dropdownRef,
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
            {items.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="block px-4 py-3 transition-colors duration-200 hover:bg-yellow-400/10"
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
