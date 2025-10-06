// components/homepage/TraditionSection.tsx
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Beer, Mountain, Wheat } from 'lucide-react';

export const TraditionSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(251, 191, 36, 0.1) 10px,
            rgba(251, 191, 36, 0.1) 20px
          )`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-4">
            Tradición en cada sorbo
          </h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full mb-8"></div>
          
          <div className="space-y-6 text-white max-w-4xl mx-auto">
            <p className="text-xl leading-relaxed">
              <span className="text-yellow-400 font-semibold">Posoqo</span> viene del quechua <span className="text-yellow-400 font-semibold">pusuqu</span>, que significa espuma.
            </p>
            <p className="text-xl leading-relaxed">
              Para nosotros, la espuma es símbolo de calidad, unión y celebración auténtica que conecta nuestras raíces ayacuchanas con cada sorbo.
            </p>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Card 1 - Tradición y dedicación */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-500 hover:-translate-y-2"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Beer className="w-8 h-8 text-black" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                Tradición y dedicación
              </h3>
              
              {/* Description */}
              <p className="text-gray-300 leading-relaxed text-base">
                La espuma no es solo un símbolo de fermentación bien lograda, sino también una expresión de tradición, dedicación y respeto por lo auténtico en cada receta.
              </p>
            </div>
          </motion.div>

          {/* Card 2 - Orgullo ayacuchano */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-500 hover:-translate-y-2"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Wheat className="w-8 h-8 text-black" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                Orgullo ayacuchano
              </h3>
              
              {/* Description */}
              <p className="text-gray-300 leading-relaxed text-base">
                Cada una de nuestras cervezas artesanales nace de esta filosofía: honrar nuestras raíces con sabores únicos, elaborados con esmero y con el orgullo de ser ayacuchanos.
              </p>
            </div>
          </motion.div>

          {/* Card 3 - Espuma que une */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-500 hover:-translate-y-2"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mountain className="w-8 h-8 text-black" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                Espuma que une
              </h3>
              
              {/* Description */}
              <p className="text-gray-300 leading-relaxed text-base">
                Para nosotros, la espuma no es solo un símbolo de calidad y fermentación bien lograda, sino también una expresión de tradición, dedicación y respeto por lo auténtico.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
