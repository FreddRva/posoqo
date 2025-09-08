import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  image_url?: string;
  abv?: string;
  ibu?: string;
  color?: string;
}

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={`product-card ${className}`}
      hover={true}
      glow={true}
    >
      {/* Imagen del producto */}
      <div className="relative w-24 h-32 flex-shrink-0 mb-4 mx-auto group">
        {/* Efecto de resplandor */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 via-yellow-300/20 to-yellow-500/10 rounded-xl blur-lg scale-110 group-hover:bg-yellow-400/40 transition-all duration-700" />
        
        {/* Imagen */}
        <div className="relative transform group-hover:translate-y-[-4px] group-hover:scale-105 transition-all duration-700">
          <img
            src={product.image_url?.startsWith('http') ? product.image_url : `http://localhost:4000${product.image_url}`}
            alt={product.name}
            className="object-contain w-full h-full rounded-lg"
            loading="lazy"
          />
          
          {/* Efectos de brillo */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 via-transparent to-transparent rounded-lg pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-t-lg" />
        </div>
        
        {/* Borde dorado en hover */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-400/60 rounded-xl transition-all duration-700 blur-sm group-hover:blur-0 opacity-0 group-hover:opacity-100" />
      </div>

      {/* Información del producto */}
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Nombre */}
        <h3 className="text-lg font-black text-gold tracking-[0.05em] text-glow group-hover:scale-105 transition-all duration-500 uppercase line-clamp-2">
          {product.name}
        </h3>
        
        {/* Descripción */}
        <p className="text-sm text-gray-300 leading-relaxed font-light italic line-clamp-2">
          {product.description}
        </p>
        
        {/* Especificaciones técnicas */}
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {product.abv && (
            <div className="text-center glass-gold rounded-lg px-3 py-2 border-gold">
              <div className="text-xs font-semibold text-gold">ABV</div>
              <div className="text-sm font-bold text-gold">{product.abv}</div>
            </div>
          )}
          
          {product.ibu && (
            <div className="text-center glass-gold rounded-lg px-3 py-2 border-gold">
              <div className="text-xs font-semibold text-gold">IBU</div>
              <div className="text-sm font-bold text-gold">{product.ibu}</div>
            </div>
          )}
          
          {product.color && (
            <div className="text-center glass-gold rounded-lg px-3 py-2 border-gold">
              <div className="text-xs font-semibold text-gold">COLOR</div>
              <div className="text-sm font-bold text-gold">{product.color}</div>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de click */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border-gold">
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
