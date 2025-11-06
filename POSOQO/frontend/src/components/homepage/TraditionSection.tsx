'use client'
import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Beer, Mountain, Wheat, Sparkles } from 'lucide-react'

export const TraditionSection: React.FC = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  const cards = [
    {
      icon: Beer,
      title: "Tradición y Dedicación",
      description: "Nuestra cerveza es el resultado de años de perfeccionamiento, donde cada gota cuenta una historia de pasión y herencia cervecera. La espuma, 'pusuqu' en quechua, es el alma de nuestra fermentación.",
      color: "from-yellow-500 to-amber-600",
      delay: 0.2
    },
    {
      icon: Wheat,
      title: "Orgullo Ayacuchano",
      description: "Desde el corazón de Ayacucho, Perú, elaboramos cervezas que capturan la esencia de nuestra tierra. Ingredientes locales y técnicas ancestrales se fusionan para ofrecerte un sabor auténtico y único.",
      color: "from-amber-500 to-orange-600",
      delay: 0.4
    },
    {
      icon: Mountain,
      title: "Espuma que Une",
      description: "Más que una bebida, POSOQO es un punto de encuentro. La 'espuma que une' representa la amistad, las celebraciones y los momentos compartidos. Cada brindis es una conexión con nuestras raíces.",
      color: "from-orange-500 to-red-600",
      delay: 0.6
    }
  ]

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-black"
    >
      {/* Fondo con efecto de profundidad */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-black to-amber-900/30" />
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header con efecto de brillo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-full"
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
              Nuestra Esencia
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
              Tradición en cada sorbo
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            En POSOQO, cada cerveza es una celebración de nuestra herencia. 
            El nombre <span className="text-yellow-400 font-bold">"POSOQO"</span> proviene del quechua{' '}
            <span className="text-yellow-400 font-bold">"pusuqu"</span>, que significa espuma, 
            el alma de la fermentación y el símbolo de la unión.
          </motion.p>
        </motion.div>

        {/* Cards con diseño premium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 100, rotateX: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 100, rotateX: -15 }}
              transition={{ 
                duration: 0.8, 
                delay: card.delay,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
              
              {/* Card content */}
              <div className="relative h-full bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 group-hover:border-yellow-400/50 transition-all duration-500 overflow-hidden">
                
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(251, 191, 36, 0.1) 10px,
                        rgba(251, 191, 36, 0.1) 11px
                      )`
                    }}
                  />
                </div>

                {/* Icon con efecto de brillo */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`relative w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${card.color} p-0.5 shadow-2xl`}
                >
                  <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                    <card.icon className="w-10 h-10 text-yellow-400" />
                  </div>
                  
                  {/* Glow del icono */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}
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

                {/* Título */}
                <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-amber-300 transition-all duration-300">
                  {card.title}
                </h3>

                {/* Descripción */}
                <p className="text-gray-300 leading-relaxed text-base group-hover:text-gray-200 transition-colors duration-300">
                  {card.description}
                </p>

                {/* Efecto de brillo en hover */}
                <motion.div
                  className="absolute -bottom-20 -right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
