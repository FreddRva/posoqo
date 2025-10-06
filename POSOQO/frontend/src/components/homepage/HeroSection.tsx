// components/homepage/HeroSection.tsx
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowDown, Play, Star, Award, Users, Sparkles } from 'lucide-react';
import { HeroSectionProps } from '@/types/homepage';

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToProducts }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.9]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.05]);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/FondoPo.png)',
              backgroundAttachment: 'fixed'
            }}
          />
          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50"></div>
        </div>

        {/* Floating Background Image */}
        <motion.div
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-5 w-96 h-96 md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px]"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ 
            opacity: 0.3, 
            x: 0, 
            scale: 1,
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: 2,
            delay: 0.5,
            y: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat rounded-full shadow-2xl"
            style={{
              backgroundImage: 'url(/FondoS.png)',
              filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.3))'
            }}
          />
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full blur-2xl scale-110"></div>
        </motion.div>

        {/* Main Content with Cinematic Effects */}
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto px-6 text-center"
          style={{ y, opacity, scale }}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="space-y-12"
          >
            {/* Premium Badge with Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 100 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-full px-8 py-4 text-yellow-300 text-sm font-medium mb-8 shadow-2xl shadow-yellow-400/20"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="tracking-wider">PREMIUM CRAFT BEER</span>
              <Star className="w-5 h-5 fill-yellow-400 animate-pulse" />
            </motion.div>

            {/* Main Title with Cinematic Typography */}
            <motion.h1 
              className="text-8xl md:text-9xl font-black text-white mb-8 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.7 }}
            >
              <motion.span 
                className="block bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                style={{
                  backgroundSize: '200% 200%',
                  filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.5))'
                }}
              >
                POSOQO
              </motion.span>
              <motion.span 
                className="block text-4xl md:text-6xl text-amber-300 mt-4 font-light tracking-widest"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                EL SABOR DORADO DE LA PERFECCIÓN
              </motion.span>
            </motion.h1>
            
            {/* Cinematic Subtitle */}
            <motion.p 
              className="text-2xl md:text-3xl text-gray-200 max-w-5xl mx-auto leading-relaxed mb-12 font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
            >
              Descubre la excelencia en cada sorbo. Cerveza artesanal de clase mundial, 
              <br className="hidden md:block" />
              elaborada con ingredientes premium y técnicas tradicionales que honran la tradición cervecera peruana.
            </motion.p>

            {/* Premium Stats with Glassmorphism */}
            <motion.div 
              className="flex flex-wrap justify-center gap-12 mb-16"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.8 }}
            >
              {[
                { icon: Award, number: "15+", text: "Años de Maestría", subtext: "Tradición Cervecera" },
                { icon: Star, number: "50+", text: "Variedades Únicas", subtext: "Sabores Exclusivos" },
                { icon: Users, number: "10K+", text: "Conocedores", subtext: "Comunidad Premium" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center group"
                  whileHover={{ scale: 1.1, y: -10 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gradient-to-br group-hover:from-yellow-400/30 group-hover:to-amber-500/30 transition-all duration-500 border border-yellow-400/30 group-hover:border-yellow-400/50 shadow-2xl group-hover:shadow-yellow-400/30">
                    <stat.icon className="w-10 h-10 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300">{stat.number}</div>
                  <div className="text-lg font-semibold text-gray-300 mb-1">{stat.text}</div>
                  <div className="text-sm text-gray-400">{stat.subtext}</div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Cinematic Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-8 justify-center items-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2 }}
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  boxShadow: "0 20px 40px rgba(251, 191, 36, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onScrollToProducts}
                className="group relative bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 text-black font-bold py-5 px-10 rounded-full text-xl shadow-2xl transition-all duration-500 flex items-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">VER MENÚ COMPLETO</span>
                <ArrowDown className="w-6 h-6 group-hover:translate-y-1 transition-transform duration-300 relative z-10" />
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVideoModalOpen(true)}
                className="group border-2 border-white/30 backdrop-blur-xl text-white hover:bg-white/10 hover:border-yellow-400/50 px-10 py-5 rounded-full text-xl font-semibold transition-all duration-500 flex items-center gap-4 shadow-2xl"
              >
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <span>VER EXPERIENCIA</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Cinematic Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-white/60 text-sm font-medium tracking-wider">DESCUBRE LA EXCELENCIA</span>
            <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-3 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full mt-2"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Cinematic Video Modal */}
      {isVideoModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateX: -20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
            className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300 text-2xl font-light"
            >
              ×
            </button>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Experiencia Cinematográfica</h3>
                <p className="text-gray-400">Video promocional próximamente</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};