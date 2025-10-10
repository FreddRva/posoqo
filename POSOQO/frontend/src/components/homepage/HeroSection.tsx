'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Beer, MapPin } from 'lucide-react'
import Image from 'next/image'

export const HeroSection = ({ onScrollToProducts }: { onScrollToProducts: () => void }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fondo de imagen con overlay oscuro */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/FondoPo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/90" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Columna izquierda - Texto */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-left space-y-6"
        >
          {/* Logo y título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-extrabold text-yellow-400 drop-shadow-2xl tracking-tight">
              POSOQO
            </h1>
            <p className="text-3xl md:text-4xl text-yellow-300/90 font-semibold mt-2 drop-shadow-lg">
              Cerveza Ayacuchana
            </p>
          </motion.div>

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-xl"
          >
            En quechua, <span className="text-yellow-400 font-bold">"pusuqu"</span> significa espuma, 
            el alma de la fermentación. Cada cerveza POSOQO es una celebración de nuestra herencia 
            ayacuchana, elaborada con pasión y tradición.
          </motion.p>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <button
              onClick={onScrollToProducts}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 hover:scale-105"
            >
              <Beer className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              Nuestras Cervezas
            </button>
            
            <a
              href="/#contacto"
              className="group flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-xl border-2 border-yellow-400/50 hover:bg-yellow-400/20 hover:border-yellow-400 transition-all duration-300 shadow-xl hover:scale-105"
            >
              <MapPin className="w-6 h-6 group-hover:bounce transition-transform duration-300" />
              Visítanos
            </a>
          </motion.div>
        </motion.div>

        {/* Columna derecha - Imagen flotante */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative flex items-center justify-center"
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-full max-w-md lg:max-w-lg"
          >
            <Image
              src="/FondoS.png"
              alt="POSOQO Cerveza"
              width={600}
              height={600}
              className="w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(255,215,0,0.6)]"
              priority
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Decoración inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
    </section>
  )
}
