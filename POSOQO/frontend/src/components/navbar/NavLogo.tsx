// src/components/navbar/NavLogo.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });

export const NavLogo: React.FC = () => (
  <a
    href="/"
    className="flex items-center gap-2 group"
    aria-label="Inicio"
    data-logo="posoqo"
    style={{ cursor: 'none' }}
  >
    <div className="relative logo-icon-hover">
      <Image
        src="/Logo.png"
        alt="POSOQO"
        width={40}
        height={40}
        className="h-10 w-10 object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg"
        priority
        style={{ cursor: 'none' }}
      />
      {/* Efecto de brillo dorado */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
    <span 
      className={`text-2xl font-bold text-white tracking-tight ${playfair.className}`}
      style={{ cursor: 'none' }}
    >
      POSOQO
    </span>
  </a>
);
