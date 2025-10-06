// components/homepage/HeroSection.tsx
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, MapPin, MessageCircle, ShoppingCart, Beer, Utensils } from 'lucide-react';
import { HeroSectionProps } from '@/types/homepage';

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToProducts }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.9]);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Brewery Murals - Much Darker */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/FondoPo.png)',
              backgroundAttachment: 'fixed'
            }}
          />
          {/* Much darker overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/85"></div>
        </div>

        {/* Floating Background Image - Complete and Properly Sized */}
        <motion.div
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-5 w-72 h-96 md:w-80 md:h-[500px] lg:w-96 lg:h-[600px]"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ 
            opacity: 0.8, 
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
            className="w-full h-full bg-cover bg-center bg-no-repeat rounded-2xl shadow-2xl"
            style={{
              backgroundImage: 'url(/FondoS.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'drop-shadow(0 0 40px rgba(251, 191, 36, 0.4))'
            }}
          />
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-2xl blur-2xl scale-110"></div>
        </motion.div>

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
                  <Beer className="w-6 h-6" />
                  <span>Nuestras Cervezas</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center gap-3"
                >
                  <MapPin className="w-6 h-6" />
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
      </section>
    </>
  );
};