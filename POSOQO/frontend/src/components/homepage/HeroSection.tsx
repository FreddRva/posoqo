// components/homepage/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Beer } from 'lucide-react';
import { HeroSectionProps } from '@/types/homepage';

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToProducts }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black">
      {/* Contenido principal */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Logo/Icono */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-6">
              <Beer className="w-12 h-12 text-black" />
            </div>
          </motion.div>
          
          {/* Título principal */}
          <motion.h1 
            className="text-6xl md:text-8xl font-bold text-white mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <span className="block">POSOQO</span>
            <span className="block text-3xl md:text-5xl text-yellow-400 mt-2 font-light">Cervecería Artesanal</span>
          </motion.h1>
          
          {/* Subtítulo */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Cerveza artesanal de calidad premium, elaborada con ingredientes naturales 
            y técnicas tradicionales en Ayacucho, Perú.
          </motion.p>
          
          {/* Botón de acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onScrollToProducts}
              className="group bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-4 px-8 rounded-lg text-lg hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <span>Ver Nuestras Cervezas</span>
              <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Indicador de scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/60 text-xs font-medium tracking-wider">DESCUBRE MÁS</span>
          <ArrowDown className="w-6 h-6 text-white/70" />
        </div>
      </motion.div>
    </section>
  );
};