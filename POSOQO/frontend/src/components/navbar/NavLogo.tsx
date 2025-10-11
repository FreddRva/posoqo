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
  >
    <Image
      src="/Logo.png"
      alt="POSOQO"
      width={40}
      height={40}
      className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
      priority
    />
    <span className={`text-2xl font-bold text-yellow-400 tracking-tight ${playfair.className} group-hover:text-yellow-300 transition-colors duration-300`}>
      POSOQO
    </span>
  </a>
);
