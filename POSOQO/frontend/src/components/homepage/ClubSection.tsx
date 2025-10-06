// components/homepage/ClubSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Gift } from 'lucide-react';

export const ClubSection: React.FC = () => {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Club POSOQO
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Únete a nuestra comunidad de amantes de la cerveza artesanal
          </p>
          <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Miembro VIP</h3>
            <p className="text-gray-300">
              Acceso exclusivo a nuevas cervezas y eventos especiales
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Descuentos</h3>
            <p className="text-gray-300">
              Obtén descuentos especiales en todas nuestras cervezas
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Regalos</h3>
            <p className="text-gray-300">
              Recibe regalos sorpresa en tu cumpleaños y fechas especiales
            </p>
          </motion.div>
        </div>
        
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-300"
          >
            Únete al Club
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};