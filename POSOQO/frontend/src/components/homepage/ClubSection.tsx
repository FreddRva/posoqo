// components/homepage/ClubSection.tsx
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Gift, Tag, Crown, Sparkles, Award, Users, Diamond } from 'lucide-react';

export const ClubSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[url('/FondoPo.png')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
      
      {/* Floating Gold Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-full px-8 py-3 text-yellow-300 text-sm font-medium mb-8 shadow-2xl shadow-yellow-400/20"
          >
            <Crown className="w-5 h-5" />
            <span>CLUB EXCLUSIVO</span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </motion.div>
          
          <h2 className="text-7xl md:text-8xl font-black text-white mb-6 leading-tight">
            Únete al Club
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 font-light">
            Conviértete en miembro VIP y accede a experiencias únicas, beneficios exclusivos y eventos privados
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mx-auto rounded-full"></div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {[
            { 
              icon: Crown, 
              title: "Acceso VIP", 
              description: "Eventos exclusivos y lanzamientos anticipados solo para miembros",
              features: ["Eventos privados", "Degustaciones exclusivas", "Acceso anticipado"]
            },
            { 
              icon: Tag, 
              title: "Descuentos Especiales", 
              description: "Ofertas únicas y descuentos especiales en todas tus compras",
              features: ["20% descuento", "Envío gratuito", "Productos exclusivos"]
            },
            { 
              icon: Gift, 
              title: "Regalos y Sorpresas", 
              description: "Obsequios personalizados y experiencias únicas cada mes",
              features: ["Cajas sorpresa", "Regalos personalizados", "Experiencias únicas"]
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 80, scale: 0.9 }}
              transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-yellow-400/30 transition-all duration-700 hover:shadow-2xl hover:shadow-yellow-400/20 hover:-translate-y-5 overflow-hidden"
            >
              {/* Cinematic Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-amber-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Premium Badge */}
              <div className="absolute top-6 right-6 z-20">
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Diamond className="w-3 h-3 fill-current" />
                  <span>VIP</span>
                </div>
              </div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <benefit.icon className="w-10 h-10 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
                </div>
                
                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-500 mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6 text-base font-light">
                    {benefit.description}
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-2 mb-8">
                    {benefit.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-400">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {[
            { icon: Users, number: "500+", text: "Miembros VIP", subtext: "Comunidad exclusiva" },
            { icon: Award, number: "50+", text: "Eventos Exclusivos", subtext: "Experiencias únicas" },
            { icon: Star, number: "98%", text: "Satisfacción", subtext: "Miembros felices" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gradient-to-br group-hover:from-yellow-400/30 group-hover:to-amber-500/30 transition-all duration-500 border border-yellow-400/30 group-hover:border-yellow-400/50 shadow-2xl group-hover:shadow-yellow-400/30">
                <stat.icon className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-4xl font-black text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300">{stat.number}</div>
              <div className="text-lg font-semibold text-gray-300 mb-1">{stat.text}</div>
              <div className="text-sm text-gray-400">{stat.subtext}</div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Call to Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: "0 25px 50px rgba(251, 191, 36, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 text-black font-bold py-5 px-10 rounded-2xl text-xl shadow-2xl hover:shadow-yellow-400/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 hover:translate-x-full transition-transform duration-1000"></div>
            <Crown className="w-6 h-6 relative z-10" />
            <span className="relative z-10">ÚNETE AL CLUB VIP</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative z-10"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};