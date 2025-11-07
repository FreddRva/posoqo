"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'posoqo_age_verified';

export function AgeVerificationModal() {
  const [show, setShow] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // No mostrar en dashboard o páginas de autenticación
    const isDashboard = pathname?.startsWith('/dashboard');
    const isAuthPage = pathname?.startsWith('/login') || 
                       pathname?.startsWith('/register') || 
                       pathname?.startsWith('/forgot-password') ||
                       pathname?.startsWith('/verificar-email');
    
    if (isDashboard || isAuthPage) {
      return;
    }

    // Verificar si ya se verificó la edad
    const verified = localStorage.getItem(STORAGE_KEY);
    if (!verified) {
      // Pequeño delay para mejor UX
      const timer = setTimeout(() => {
        setShow(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Bloquear scroll del body cuando el modal está visible
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handleConfirm = () => {
    setIsVerifying(true);
    // Guardar en localStorage con timestamp
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      verified: true,
      timestamp: Date.now(),
      date: new Date().toISOString()
    }));
    
    // Disparar evento para que otros componentes se actualicen
    window.dispatchEvent(new CustomEvent('ageVerified'));
    
    // Pequeño delay para animación
    setTimeout(() => {
      setShow(false);
    }, 300);
  };

  const handleDecline = () => {
    // Redirigir a una página de edad no verificada o mostrar mensaje
    window.location.href = 'https://www.google.com';
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full -ml-12 -mb-12" />

              <div className="relative z-10">
                {/* Icono */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-[#D4AF37]" />
                  </div>
                </div>

                {/* Título */}
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                  ¿Eres mayor de edad?
                </h2>

                {/* Mensaje */}
                <p className="text-gray-600 text-center mb-8 leading-relaxed">
                  Debes tener 18 años o más para ver la página. Verifica tu edad para ingresar.
                </p>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleConfirm}
                    disabled={isVerifying}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#B8860B] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isVerifying ? 'Verificando...' : 'SOY MAYOR DE EDAD'}
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={isVerifying}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-200"
                  >
                    SOY MENOR DE EDAD
                  </button>
                </div>

                {/* Aviso legal */}
                <p className="text-xs text-gray-500 text-center mt-6">
                  Al hacer clic en "SOY MAYOR DE EDAD", confirmas que tienes la edad legal para consumir alcohol en tu país.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook para verificar si la edad está verificada
export function useAgeVerified(): boolean {
  if (typeof window === 'undefined') return false;
  const verified = localStorage.getItem(STORAGE_KEY);
  if (!verified) return false;
  try {
    const data = JSON.parse(verified);
    return data.verified === true;
  } catch {
    return false;
  }
}

