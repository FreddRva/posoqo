'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import { Star, Gift, Tag, Crown, Sparkles, Award, Users, Diamond, Zap } from 'lucide-react'

export const ClubSection: React.FC = () => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const benefits = [
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
  ]

  const stats = [
    { icon: Users, number: "500+", text: "Miembros VIP" },
    { icon: Award, number: "50+", text: "Eventos Exclusivos" },
    { icon: Star, number: "98%", text: "Satisfacción" }
  ]

  return (
    <section 
      ref={ref} 
      className="relative py-32 overflow-hidden"
      style={{
        backgroundImage: 'url(/FondoPoC.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay oscuro para contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/90" />
      
      {/* Efectos de brillo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold mb-6"
          >
            <Crown className="w-4 h-4" />
            <span>CLUB EXCLUSIVO</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </motion.div>
          
          <h2 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-6 leading-tight">
            Únete al Club
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Conviértete en miembro VIP y accede a experiencias únicas, beneficios exclusivos y eventos privados
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 80, rotateX: -20 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 80, rotateX: -20 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.3 + index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -15, 
                scale: 1.03,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-700" />
              
              {/* Card */}
              <div className="relative h-full bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500 overflow-hidden">
                
                {/* Badge VIP */}
                <div className="absolute top-4 right-4 bg-yellow-400/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    <Diamond className="w-3 h-3 fill-black text-black" />
                    <span className="text-black font-bold text-xs">VIP</span>
                  </div>
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 p-0.5 shadow-2xl"
                >
                  <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                    <benefit.icon className="w-10 h-10 text-yellow-400" />
                  </div>
                  
                  {/* Glow del icono */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-amber-300 transition-all duration-300">
                  {benefit.title}
                </h3>

                <p className="text-gray-400 text-base leading-relaxed mb-6 group-hover:text-gray-300 transition-colors duration-300">
                  {benefit.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {benefit.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-yellow-400 transition-colors duration-300">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Efecto de brillo en hover */}
                <motion.div
                  className="absolute -bottom-20 -right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-yellow-400/30 group-hover:to-amber-500/30 transition-all duration-500 border border-yellow-400/30 group-hover:border-yellow-400/50 shadow-xl">
                <stat.icon className="w-10 h-10 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-300 group-hover:text-yellow-400 transition-colors duration-300">
                {stat.text}
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* CTA Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              y: -5,
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-300 hover:via-amber-400 hover:to-yellow-500 text-black font-bold py-6 px-12 rounded-2xl text-xl shadow-2xl hover:shadow-yellow-500/50 transition-all duration-500 overflow-hidden"
          >
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <Crown className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">ÚNETE AL CLUB VIP</span>
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              <Zap className="w-7 h-7 fill-current" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}