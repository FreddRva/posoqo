// components/homepage/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Beer, Mountain, Wheat, ArrowRight } from 'lucide-react';
import { HeroSectionProps } from '@/types/homepage';

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToProducts }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{backgroundImage: 'url(/FondoPo.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
      {/* Overlay elegante */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
      
      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Título principal */}
          <motion.h1 
            className="text-6xl md:text-8xl font-bold text-white mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="block">POSOQO</span>
            <span className="block text-4xl md:text-6xl text-amber-400 mt-2">Cervecería Artesanal</span>
          </motion.h1>
          
          {/* Subtítulo */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Descubre el sabor auténtico de nuestras cervezas artesanales, 
            elaboradas con ingredientes premium y técnicas tradicionales.
          </motion.p>
          
          {/* Características destacadas */}
          <motion.div 
            className="flex flex-wrap justify-center gap-8 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { icon: Beer, text: "Cervezas Artesanales" },
              { icon: Mountain, text: "Ingredientes Naturales" },
              { icon: Wheat, text: "Técnicas Tradicionales" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <div className="w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-lg font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Botón de acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onScrollToProducts}
              className="group bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-4 px-8 rounded-2xl text-lg hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <span>Explorar Cervezas</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Elementos decorativos flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </section>
  );
};
