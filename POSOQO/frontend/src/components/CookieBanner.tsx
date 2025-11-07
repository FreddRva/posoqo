"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check } from 'lucide-react';

const STORAGE_KEY = 'posoqo_cookies_accepted';
const AGE_VERIFICATION_KEY = 'posoqo_age_verified';
const COOKIE_EXPIRY_DAYS = 365; // Las cookies se guardan por 1 año

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  const checkAndShow = () => {
    // No mostrar en dashboard o páginas de autenticación
    const isDashboard = pathname?.startsWith('/dashboard');
    const isAuthPage = pathname?.startsWith('/login') || 
                       pathname?.startsWith('/register') || 
                       pathname?.startsWith('/forgot-password') ||
                       pathname?.startsWith('/verificar-email');
    
    if (isDashboard || isAuthPage) {
      return;
    }

    // Verificar si la edad está verificada
    const ageVerified = localStorage.getItem(AGE_VERIFICATION_KEY);
    if (!ageVerified) {
      return; // No mostrar hasta que se verifique la edad
    }

    // Verificar si ya se aceptaron las cookies
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      // Mostrar después de que se verifique la edad
      setTimeout(() => {
        setShow(true);
      }, 2000);
    }
  };

  useEffect(() => {
    checkAndShow();
    
    // Escuchar cuando se verifica la edad
    const handleAgeVerified = () => {
      checkAndShow();
    };

    window.addEventListener('ageVerified', handleAgeVerified);
    return () => {
      window.removeEventListener('ageVerified', handleAgeVerified);
    };
  }, [pathname]);

  const handleAccept = () => {
    // Guardar en localStorage con timestamp y expiración
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accepted: true,
      timestamp: Date.now(),
      expiry: expiryDate.getTime(),
      date: new Date().toISOString()
    }));
    
    setShow(false);
  };

  const handleDecline = () => {
    // Guardar que se rechazaron (para no mostrar de nuevo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accepted: false,
      timestamp: Date.now(),
      expiry: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 días
      date: new Date().toISOString()
    }));
    
    setShow(false);
  };

  // Verificar si las cookies expiraron
  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (accepted) {
      try {
        const data = JSON.parse(accepted);
        if (data.expiry && Date.now() > data.expiry) {
          // Las cookies expiraron, mostrar de nuevo
          localStorage.removeItem(STORAGE_KEY);
          setShow(true);
        }
      } catch {
        // Si hay error parseando, remover y mostrar de nuevo
        localStorage.removeItem(STORAGE_KEY);
        setShow(true);
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[9997] p-4"
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-4 relative">
              {/* Botón de cerrar */}
              <button
                onClick={handleDecline}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icono */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-[#D4AF37]" />
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 pr-8">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Política de Cookies
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido. 
                  Al hacer clic en "Aceptar", consientes el uso de cookies según nuestra{' '}
                  <a 
                    href="/privacidad" 
                    className="text-[#D4AF37] hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Política de Privacidad
                  </a>
                  .
                </p>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Rechazar
                </button>
                <button
                  onClick={handleAccept}
                  className="px-6 py-2 text-sm font-medium text-white bg-[#D4AF37] hover:bg-[#B8860B] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg hover:shadow-xl"
                >
                  <Check className="w-4 h-4" />
                  Aceptar Cookies
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook para verificar si las cookies fueron aceptadas
export function useCookiesAccepted(): boolean {
  if (typeof window === 'undefined') return false;
  const accepted = localStorage.getItem(STORAGE_KEY);
  if (!accepted) return false;
  try {
    const data = JSON.parse(accepted);
    // Verificar expiración
    if (data.expiry && Date.now() > data.expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return data.accepted === true;
  } catch {
    return false;
  }
}

// Función para limpiar las preferencias de cookies (útil para testing)
export function clearCookiePreferences() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

