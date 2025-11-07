"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { getImageUrl } from '@/lib/config';
import Image from 'next/image';

interface Service {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  price?: number;
  is_active?: boolean;
}

interface ServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceModal({ service, isOpen, onClose }: ServiceModalProps) {
  if (!service) return null;

  // Parsear descripción en viñetas
  const descriptionItems = service.description
    ? service.description.split('\n').filter(line => line.trim())
    : [];

  // Bloquear scroll cuando el modal está abierto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
            onClick={onClose}
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
            <div className="bg-black/95 backdrop-blur-xl border border-yellow-400/20 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="relative">
                {service.image_url && (
                  <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-t-3xl">
                    <Image
                      src={getImageUrl(service.image_url)}
                      alt={service.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    
                    {/* Badge premium */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-yellow-300/50">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-black" />
                        <span className="font-bold text-sm">Premium</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón cerrar */}
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-8">
                {/* Título */}
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  {service.name}
                </h2>

                {/* Descripción en viñetas */}
                {descriptionItems.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                      Características
                    </h3>
                    <ul className="space-y-3">
                      {descriptionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="flex-1 leading-relaxed">{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Precio */}
                {service.price && (
                  <div className="mb-6 p-6 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-lg font-medium">Precio desde</span>
                      <span className="text-4xl font-bold text-yellow-400">
                        S/ {service.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Información adicional */}
                <div className="mt-8 pt-6 border-t border-yellow-400/20">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Para más información sobre este servicio, contáctanos a través de nuestro WhatsApp o 
                    visita nuestras redes sociales.
                  </p>
                </div>

                {/* Botón de acción */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://wa.me/51966123456"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50"
                  >
                    <span>Contactar por WhatsApp</span>
                  </a>
                  <button
                    onClick={onClose}
                    className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-300 border border-gray-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

