"use client";

import React from 'react';
import { motion } from 'framer-motion';

// Componente de loading para productos
export const ProductSkeleton = () => (
  <div className="group relative bg-gradient-to-br from-neutral-800/95 to-neutral-700/95 backdrop-blur-sm rounded-3xl p-6 border border-amber-400/30 overflow-hidden">
    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
      {/* Skeleton para imagen */}
      <div className="flex-shrink-0 w-full lg:w-48">
        <div className="relative h-80">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-2xl blur-xl scale-110"></div>
          <div className="relative h-full flex items-center justify-center">
            <div className="w-32 h-32 bg-neutral-600 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Skeleton para información */}
      <div className="flex-1 text-center lg:text-left space-y-4">
        <div className="h-8 bg-neutral-600 rounded-lg animate-pulse"></div>
        <div className="h-4 bg-neutral-600 rounded-lg animate-pulse"></div>
        <div className="h-4 bg-neutral-600 rounded-lg animate-pulse w-3/4"></div>
        <div className="flex gap-2 justify-center lg:justify-start">
          <div className="h-6 bg-neutral-600 rounded-full w-16 animate-pulse"></div>
          <div className="h-6 bg-neutral-600 rounded-full w-16 animate-pulse"></div>
        </div>
        <div className="h-12 bg-amber-400/20 rounded-xl animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Componente de loading para servicios
export const ServiceSkeleton = () => (
  <div className="group relative bg-gradient-to-br from-neutral-800/95 to-neutral-700/95 backdrop-blur-sm rounded-3xl p-6 border border-amber-400/30 hover:border-amber-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-2 overflow-hidden">
    <div className="relative z-10 text-center">
      {/* Skeleton para imagen */}
      <div className="relative w-full h-64 mb-6 group">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl blur-lg scale-110"></div>
        <div className="relative bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 h-full flex items-center justify-center">
          <div className="w-24 h-24 bg-neutral-600 rounded-2xl animate-pulse"></div>
        </div>
      </div>
      
      {/* Skeleton para información */}
      <div className="space-y-4">
        <div className="h-6 bg-neutral-600 rounded-lg animate-pulse"></div>
        <div className="h-4 bg-neutral-600 rounded-lg animate-pulse"></div>
        <div className="h-4 bg-neutral-600 rounded-lg animate-pulse w-3/4 mx-auto"></div>
        <div className="h-8 bg-amber-400/20 rounded-lg animate-pulse"></div>
        <div className="h-8 bg-neutral-600 rounded-lg animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Componente de loading para secciones
export const SectionSkeleton = () => (
  <div className="py-20 bg-neutral-800">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-amber-500/20 rounded-full border border-amber-400/50 shadow-lg">
          <div className="w-5 h-5 bg-amber-400 rounded animate-pulse"></div>
          <div className="h-4 bg-amber-400 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-16 bg-amber-400/20 rounded-lg mb-8 animate-pulse"></div>
        <div className="w-32 h-1.5 bg-amber-400/20 rounded-full mx-auto animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <ServiceSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

// Componente de loading principal
export const MainLoadingSkeleton = () => (
  <div className="min-h-screen bg-neutral-900 text-white">
    {/* Hero Section Skeleton */}
    <section className="relative min-h-screen flex items-center justify-center pt-20 lg:pt-32">
      <div className="absolute inset-0 bg-neutral-900/60"></div>
      <div className="relative z-10 max-w-7xl w-full px-6 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
        <div className="flex-1 text-center lg:text-left order-1">
          <div className="mb-8">
            <div className="h-32 bg-neutral-600 rounded-lg animate-pulse"></div>
          </div>
          <div className="mb-8">
            <div className="h-20 bg-amber-400/20 rounded-lg mb-4 animate-pulse"></div>
            <div className="w-24 h-1 bg-amber-400/20 rounded-full mx-auto lg:mx-0 animate-pulse"></div>
          </div>
          <div className="mb-10 space-y-4">
            <div className="h-6 bg-neutral-600 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-neutral-600 rounded-lg animate-pulse w-3/4"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <div className="h-14 bg-amber-400/20 rounded-full w-48 animate-pulse"></div>
            <div className="h-14 bg-neutral-600 rounded-full w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center relative order-2 lg:order-2 mt-8 lg:mt-20">
          <div className="w-80 h-96 bg-neutral-600 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </section>
    
    {/* Resto de secciones */}
    <SectionSkeleton />
    <SectionSkeleton />
  </div>
);

// Componente de error con retry
export const ErrorWithRetry = ({ 
  error, 
  onRetry, 
  title = "Algo salió mal" 
}: { 
  error: string; 
  onRetry: () => void; 
  title?: string;
}) => (
  <motion.div 
    className="text-center py-20"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="max-w-md mx-auto">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-neutral-300 mb-6">{error}</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="px-6 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-600 transition-colors"
      >
        Intentar de nuevo
      </motion.button>
    </div>
  </motion.div>
);

export default MainLoadingSkeleton;
