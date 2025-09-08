import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  glow = true,
  onClick
}) => {
  const baseClasses = 'relative rounded-2xl p-6 transition-all duration-500';
  const backgroundClasses = 'bg-premium';
  const borderClasses = 'border border-yellow-400/20';
  const shadowClasses = glow ? 'shadow-gold' : '';
  const hoverClasses = hover ? 'hover-lift' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${backgroundClasses} ${borderClasses} ${shadowClasses} ${hoverClasses} ${clickClasses} ${className}`;
  
  const cardContent = (
    <div className="relative z-10">
      {children}
    </div>
  );
  
  if (onClick) {
    return (
      <motion.div
        className={classes}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {cardContent}
      </motion.div>
    );
  }
  
  return (
    <div className={classes}>
      {cardContent}
    </div>
  );
};

export default Card;
