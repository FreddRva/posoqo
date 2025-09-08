import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  className = '',
  disabled = false,
  loading = false,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/40';
  
  const variantClasses = {
    primary: 'bg-gold text-black shadow-gold hover:scale-105 hover:shadow-gold-hover',
    secondary: 'bg-transparent text-white border-2 border-yellow-400 hover:bg-yellow-400 hover:text-black hover:scale-105',
    outline: 'bg-transparent text-yellow-400 border border-yellow-400 hover:bg-yellow-400/10 hover:scale-105'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const loadingClasses = loading ? 'cursor-wait' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${loadingClasses} ${className}`;
  
  const buttonContent = (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className="flex items-center gap-2"
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.div>
  );
  
  if (href) {
    return (
      <a href={href} className={classes}>
        {buttonContent}
      </a>
    );
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {buttonContent}
    </button>
  );
};

export default Button;
