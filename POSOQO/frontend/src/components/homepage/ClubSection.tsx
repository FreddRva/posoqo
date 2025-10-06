// components/homepage/ClubSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Crown, Gift, Users } from 'lucide-react';
import { ClubSectionProps } from '@/types/homepage';

export const ClubSection: React.FC<ClubSectionProps> = ({ onJoinClub }) => {
  const benefits = [
    {
      icon: Gift,
      title: "Descuentos Exclusivos",
      description: "Hasta 20% de descuento en todas nuestras cervezas"
    },
    {
      icon: Star,
      title: "Cervezas Limitadas",
      description: "Acceso a ediciones especiales y lanzamientos exclusivos"
    },
    {
      icon: Crown,
      title: "Eventos VIP",
      description: "Invitaciones a catas privadas y eventos especiales"
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Conecta con otros amantes de la cerveza artesanal"
    }
  ];

  return (
    <section 
      id="club-posoqo" 
      className="py-20 relative overflow-hidden" 
      style={{
        backgroundImage: 'url(/FondoPoC.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay elegante */}
      <div className="absolute inset-0 bg-neutral-900/70"></div>
      
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div 
          className="inline-block bg-[#D4AF37]/20 border border-[#D4AF37]/50 rounded-full px-6 py-2 mb-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">
            Club Exclusivo
          </span>
        </motion.div>

        <motion.h2 
          className="text-5xl md:text-7xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Club POSOQO
        </motion.h2>
        
        <motion.p 
          className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          Únete a nuestra comunidad exclusiva y disfruta de beneficios únicos, 
          descuentos especiales y acceso a cervezas limitadas.
        </motion.p>

        {/* Beneficios */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-[#D4AF37]/50 transition-all duration-300 group-hover:bg-white/15">
                <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D4AF37]/30 transition-colors duration-300">
                  <benefit.icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Botón de acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          viewport={{ once: true }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onJoinClub}
            className="group bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-4 px-8 rounded-2xl text-lg hover:shadow-2xl hover:shadow-[#D4AF37]/30 transition-all duration-300 flex items-center gap-3 mx-auto"
          >
            <Crown className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            <span>Únete al Club</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#D4AF37]/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#D4AF37]/5 rounded-full blur-lg"></div>
      </div>
    </section>
  );
};
