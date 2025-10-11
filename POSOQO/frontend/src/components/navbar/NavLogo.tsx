// src/components/navbar/NavLogo.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const NavLogo: React.FC = () => (
  <Link
    href="/"
    className="flex-shrink-0 flex items-center gap-3 group relative"
    aria-label="Inicio"
  >
    {/* Efecto de brillo detrás del logo */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    {/* Logo */}
    <motion.div 
      className="relative z-10"
      whileHover={{ rotate: 5, scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Image
        src="/Logo.png"
        alt="POSOQO"
        width={48}
        height={48}
        className="h-10 w-10 lg:h-12 lg:w-12 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
        priority
      />
    </motion.div>
    
    {/* Texto del logo */}
    <motion.span 
      className={`text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-wide ${playfair.className} relative`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      POSOQO
      {/* Línea decorativa debajo */}
      <motion.div
        className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
        initial={{ width: "0%" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.span>
  </Link>
);
