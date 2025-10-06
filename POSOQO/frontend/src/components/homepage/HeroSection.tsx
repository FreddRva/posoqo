// components/homepage/HeroSection.tsx
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, MapPin, MessageCircle, ShoppingCart } from 'lucide-react';
import { HeroSectionProps } from '@/types/homepage';

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToProducts }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.9]);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Brewery Murals */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/FondoPo.png)',
              backgroundAttachment: 'fixed'
            }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/60"></div>
        </div>

        {/* Floating Beer Products */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10 space-y-4">
          {/* Beer 6-packs */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 100, y: -50 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              y: 0,
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 2,
              delay: 0.5,
              rotate: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <div className="w-32 h-40 bg-amber-800 rounded-lg shadow-2xl flex flex-col items-center justify-center p-2">
              <div className="w-full h-8 bg-yellow-400 rounded text-black font-bold text-xs flex items-center justify-center mb-2">
                POSOQO
              </div>
              <div className="w-full h-24 bg-amber-700 rounded flex items-center justify-center">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs">
                  🍺
                </div>
              </div>
            </div>
          </motion.div>

          {/* Beer Cans */}
          <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0, x: 100, y: 50 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              y: 0,
              rotate: [0, -1, 1, 0]
            }}
            transition={{ 
              duration: 2,
              delay: 0.8,
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <div className="w-16 h-20 bg-gradient-to-b from-purple-800 to-purple-900 rounded-lg shadow-xl flex flex-col items-center justify-center p-1">
              <div className="w-full h-4 bg-yellow-400 rounded text-black font-bold text-xs flex items-center justify-center mb-1">
                POSOQO
              </div>
              <div className="w-full h-12 bg-purple-700 rounded flex items-center justify-center">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs">
                  🦙
                </div>
              </div>
            </div>
            <div className="w-16 h-20 bg-gradient-to-b from-purple-800 to-purple-900 rounded-lg shadow-xl flex flex-col items-center justify-center p-1">
              <div className="w-full h-4 bg-yellow-400 rounded text-black font-bold text-xs flex items-center justify-center mb-1">
                POSOQO
              </div>
              <div className="w-full h-12 bg-purple-700 rounded flex items-center justify-center">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs">
                  🦙
                </div>
              </div>
            </div>
            <div className="w-14 h-18 bg-gradient-to-b from-purple-800 to-purple-900 rounded-lg shadow-xl flex flex-col items-center justify-center p-1">
              <div className="w-full h-3 bg-yellow-400 rounded text-black font-bold text-xs flex items-center justify-center mb-1">
                POSOQO
              </div>
              <div className="w-full h-10 bg-purple-700 rounded flex items-center justify-center">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs">
                  🦙
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto px-6 w-full"
          style={{ y, opacity }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="space-y-8"
            >
              {/* Brand Name */}
              <div>
                <h1 className="text-8xl md:text-9xl font-black text-yellow-400 mb-4 leading-tight">
                  POSOQO
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-3xl md:text-4xl font-light text-yellow-400">
                    Cerveza Ayacuchana
                  </h2>
                  <div className="w-16 h-1 bg-yellow-400 rounded-full"></div>
                </div>
              </div>

              {/* Description Text */}
              <div className="space-y-6 text-white max-w-2xl">
                <p className="text-lg md:text-xl leading-relaxed">
                  <span className="text-yellow-400 font-semibold">Posoqo</span> viene del quechua <span className="text-yellow-400 font-semibold">pusuqu</span>, que significa espuma.
                </p>
                <p className="text-lg md:text-xl leading-relaxed">
                  Para nosotros, la espuma no es solo un símbolo de calidad y fermentación bien lograda, sino también una expresión de tradición, dedicación y respeto por lo auténtico.
                </p>
              </div>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onScrollToProducts}
                  className="group bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-lg text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
                >
                  <span>🍺</span>
                  <span>Nuestras Cervezas</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center gap-3"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Visítanos</span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Side - Product Images (Hidden on mobile, shown on desktop) */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              {/* This space is for the floating products positioned absolutely */}
            </motion.div>
          </div>
        </motion.div>

        {/* WhatsApp Floating Button */}
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center text-white transition-colors duration-300"
          >
            <MessageCircle className="w-8 h-8" />
          </motion.button>
        </motion.div>
      </section>
    </>
  );
};