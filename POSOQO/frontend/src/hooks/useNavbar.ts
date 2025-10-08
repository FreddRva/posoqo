// hooks/useNavbar.ts
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const useNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Estados
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Referencias
  const navbarRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (activeDropdown && dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) &&
          !(event.target as HTMLElement).closest('button[aria-expanded="true"]')) {
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

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return {
    router,
    pathname,
    // Estados
    mobileMenuOpen,
    setMobileMenuOpen,
    userMenuOpen,
    setUserMenuOpen,
    activeDropdown,
    setActiveDropdown,
    showNotifications,
    setShowNotifications,
    // Referencias
    navbarRef,
    userMenuRef,
    mobileMenuRef,
    dropdownRef,
    // Funciones
    toggleDropdown,
  };
};
