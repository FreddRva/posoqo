'use client'
import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, MapPin, Beer } from 'lucide-react'

export const HeroSection = ({ onScrollToProducts }: { onScrollToProducts: () => void }) => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.9])

  return (
    <section className="relative flex items-center justify-center min-h-screen overflow-hidden bg-black text-white">
      {/* 🖼 Fondo con parallax sutil */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/FondoPo.png)',
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Overlay con degradado dinámico */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/90" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"
          animate={{
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>

      {/* ✨ Efecto dorado flotante lateral */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-[550px] z-10 hidden lg:block"
        initial={{ opacity: 0, x: 80, scale: 0.9 }}
        animate={{
          opacity: 0.8,
          x: 0,
          scale: 1,
          y: [0, -15, 0]
        }}
        transition={{
          duration: 2.2,
          y: {
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut'
          }
        }}
      >
        <div
          className="relative w-full h-full rounded-2xl bg-cover bg-center shadow-[0_0_45px_rgba(255,215,0,0.25)]"
          style={{
            backgroundImage: 'url(/FondoS.png)'
          }}
        >
          {/* Luz dorada viva */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-amber-500/30 via-transparent to-transparent blur-2xl" />
        </div>
      </motion.div>

      {/* 🧠 Contenido principal */}
      <motion.div
        className="relative z-20 max-w-7xl w-full mx-auto px-6 md:px-10"
        style={{ opacity }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
        <div className="grid lg:grid-cols-2 gap-14 items-center py-32 md:py-40">
          {/* IZQUIERDA - Texto */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, x: -60 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 }
              }
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <h1 className="text-[5.5rem] md:text-[7rem] lg:text-[8rem] font-black tracking-tight leading-none bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_3px_25px_rgba(255,200,0,0.2)]">
                POSOQO
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <h2 className="text-3xl md:text-4xl font-light text-yellow-400">
                  Cerveza Ayacuchana
                </h2>
                <div className="w-20 h-[2px] bg-yellow-400 rounded-full" />
              </div>
            </motion.div>

            <motion.div
              className="space-y-6 text-gray-200 max-w-xl"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <p className="text-lg md:text-xl leading-relaxed">
                <span className="text-yellow-400 font-semibold">Posoqo</span> viene del quechua{' '}
                <span className="text-yellow-400 font-semibold">pusuqu</span>, que significa espuma.
              </p>
              <p className="text-lg md:text-xl leading-relaxed">
                La espuma es símbolo de calidad, fermentación perfecta y respeto por lo auténtico.
              </p>
            </motion.div>

            {/* BOTONES */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 pt-6"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3 } }
              }}
            >
              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onScrollToProducts}
                className="group relative bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-[0_0_25px_rgba(255,200,0,0.45)] transition-all duration-300 flex items-center gap-3"
              >
                <Beer className="w-6 h-6" />
                <span>Nuestras Cervezas</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                {/* Efecto brillo */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center gap-3 shadow-md hover:shadow-[0_0_18px_rgba(255,200,0,0.35)]"
              >
                <MapPin className="w-6 h-6" />
                <span>Visítanos</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* DERECHA - Imagen destacada (decorativa) */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="relative w-[400px] h-[500px]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-transparent blur-2xl" />
              <img
                src="/bottle-hero.png"
                alt="Cerveza Posoqo"
                className="rounded-2xl w-full h-full object-cover shadow-[0_0_35px_rgba(255,200,0,0.3)]"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
