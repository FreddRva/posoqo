// components/navbar/NavLogo.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const NavLogo: React.FC = () => {
  return (
    <Link 
      href="/" 
      className="flex items-center space-x-3 group relative"
    >
      <div className="relative w-12 h-12 flex items-center justify-center">
        <Image
          src="/Logo.png"
          alt="POSOQO"
          width={48}
          height={48}
          className="object-contain"
          priority
        />
      </div>
      <span className={`${playfair.className} text-2xl font-bold text-yellow-400 tracking-wider relative group-hover:text-yellow-300 transition-colors duration-200`}>
        POSOQO
      </span>
    </Link>
  );
};
