// components/shared/Badge.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  className = '',
  onClick
}) => {
  const baseClasses = 'inline-flex items-center font-medium transition-colors duration-200';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-800 hover:bg-red-200',
    info: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';
  
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const Component = onClick ? motion.span : 'span';
  
  const props = onClick ? {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    onClick
  } : {};
  
  return (
    <Component
      {...props}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClasses} ${clickableClasses} ${className}`}
    >
      {children}
    </Component>
  );
};
