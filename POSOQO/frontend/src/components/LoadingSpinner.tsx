"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'amber';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'text-amber-500',
  secondary: 'text-neutral-500',
  white: 'text-white',
  amber: 'text-amber-400',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
  fullScreen = false,
}) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <svg
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>
      {text && (
        <motion.p
          className={`text-sm ${colorClasses[color]} font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Componente de loading para botones
export const ButtonLoadingSpinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => (
  <LoadingSpinner
    size={size}
    color="white"
    className="inline-flex"
  />
);

// Componente de loading para páginas
export const PageLoadingSpinner: React.FC<{ text?: string }> = ({ text = "Cargando..." }) => (
  <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
    <LoadingSpinner
      size="xl"
      color="primary"
      text={text}
    />
  </div>
);

// Componente de loading para secciones
export const SectionLoadingSpinner: React.FC<{ text?: string }> = ({ text = "Cargando..." }) => (
  <div className="py-20 flex items-center justify-center">
    <LoadingSpinner
      size="lg"
      color="primary"
      text={text}
    />
  </div>
);

// Componente de loading para cards
export const CardLoadingSpinner: React.FC<{ text?: string }> = ({ text = "Cargando..." }) => (
  <div className="p-8 flex items-center justify-center">
    <LoadingSpinner
      size="md"
      color="primary"
      text={text}
    />
  </div>
);

export default LoadingSpinner;
