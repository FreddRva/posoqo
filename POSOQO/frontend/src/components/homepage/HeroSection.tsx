// components/homepage/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Star, Award, Users, Play, MapPin, Clock, Beer, Sparkles } from 'lucide-react';
import { HeroSectionProps } from '@/types/homepage';

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToProducts }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with enhanced gradient */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{backgroundImage: 'url(/FondoPo.png)'}}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/85 via-amber-800/80 to-amber-700/85"></div>
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M50 50c0-27.614-22.386-50-50-50v100c27.614 0 50-22.386 50-50z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Floating Beer Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-24 h-24 bg-amber-300/20 rounded-full blur-sm"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-20 h-20 bg-amber-400/25 rounded-full blur-sm"
          animate={{
            y: [0, 25, 0],
            rotate: [0, -180, -360],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-16 h-16 bg-amber-500/30 rounded-full blur-sm"
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-40 w-12 h-12 bg-amber-600/20 rounded-full blur-sm"
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 rounded-full px-6 py-3 text-amber-200 text-sm font-medium">
            <Sparkles className="w-4 h-4 fill-amber-400" />
            <span>Cerveza Artesanal Premium</span>
            <Sparkles className="w-4 h-4 fill-amber-400" />
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-7xl md:text-9xl font-black text-white mb-6 leading-none tracking-tight">
            <span className="block bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent">
              POSOQO
            </span>
            <span className="block text-3xl md:text-4xl text-amber-200/90 font-light mt-2 tracking-wider">
              CRAFT BEER
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-amber-100/90 max-w-4xl mx-auto leading-relaxed font-light">
            Descubre el sabor auténtico de la cerveza artesanal peruana. 
            <br className="hidden md:block" />
            Elaborada con ingredientes premium y técnicas tradicionales que honran la tradición cervecera.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onScrollToProducts}
            className="group bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-10 py-5 rounded-full text-lg font-bold shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Beer className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Explorar Cervezas</span>
            <ArrowDown className="w-5 h-5 relative z-10 group-hover:translate-y-1 transition-transform duration-300" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group border-2 border-white/30 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/50 px-10 py-5 rounded-full text-lg font-semibold transition-all duration-300 flex items-center gap-3"
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span>Ver Video</span>
          </motion.button>
        </motion.div>

        {/* Enhanced Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <motion.div 
            className="text-center group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 group-hover:border-amber-400/50 transition-all duration-300">
              <div className="flex items-center justify-center mb-3">
                <Award className="w-10 h-10 text-amber-300 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-4xl font-black text-white">15+</span>
              </div>
              <p className="text-amber-200/90 font-medium">Años de experiencia</p>
              <p className="text-amber-300/70 text-sm mt-1">Tradición cervecera</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 group-hover:border-amber-400/50 transition-all duration-300">
              <div className="flex items-center justify-center mb-3">
                <Star className="w-10 h-10 text-amber-300 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-4xl font-black text-white">50+</span>
              </div>
              <p className="text-amber-200/90 font-medium">Variedades únicas</p>
              <p className="text-amber-300/70 text-sm mt-1">Sabores exclusivos</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 group-hover:border-amber-400/50 transition-all duration-300">
              <div className="flex items-center justify-center mb-3">
                <Users className="w-10 h-10 text-amber-300 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-4xl font-black text-white">10K+</span>
              </div>
              <p className="text-amber-200/90 font-medium">Clientes satisfechos</p>
              <p className="text-amber-300/70 text-sm mt-1">Comunidad fiel</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Location & Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center text-amber-200/80"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">Ayacucho, Perú</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Lun - Dom: 10:00 - 22:00</span>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
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