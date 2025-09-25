"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  image?: string;
  category?: string;
  style?: string;
  abv?: string;
  ibu?: string;
  color?: string;
  image_url?: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  productType?: 'cerveza' | 'comida';
}

// Datos de reseñas de ejemplo
const sampleReviews = [
  {
    id: 1,
    name: "María González",
    rating: 5,
    comment: "¡Increíble sabor! La mejor cerveza artesanal que he probado. Definitivamente la recomiendo.",
    date: "2024-01-15"
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    rating: 4,
    comment: "Muy buena calidad, sabor auténtico y fresco. Perfecta para acompañar una buena comida.",
    date: "2024-01-10"
  },
  {
    id: 3,
    name: "Ana Rodríguez",
    rating: 5,
    comment: "Excelente producto, superó mis expectativas. El servicio también fue muy bueno.",
    date: "2024-01-08"
  },
  {
    id: 4,
    name: "Luis Pérez",
    rating: 4,
    comment: "Buena relación calidad-precio. La recomiendo para ocasiones especiales.",
    date: "2024-01-05"
  }
];

export default function ProductModal({ product, isOpen, onClose, productType = 'cerveza' }: ProductModalProps) {
  const [activeTab, setActiveTab] = useState('descripcion');
  
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Fondo con efecto de cerveza */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-stone-800/95 to-stone-900/90 backdrop-blur-sm">
            {/* Efecto de espuma de cerveza */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-200/20 via-amber-100/10 to-transparent"></div>
            
            {/* Patrón de burbujas */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-10 w-3 h-3 bg-amber-300/30 rounded-full animate-pulse"></div>
              <div className="absolute top-40 right-20 w-2 h-2 bg-amber-200/40 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute bottom-40 left-20 w-2.5 h-2.5 bg-amber-300/20 rounded-full animate-pulse delay-2000"></div>
              <div className="absolute bottom-20 right-10 w-1.5 h-1.5 bg-amber-200/50 rounded-full animate-pulse delay-1500"></div>
            </div>
          </div>

          {/* Modal principal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
          >
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-stone-800/80 hover:bg-stone-700/80 rounded-full text-white transition-colors duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="flex flex-col lg:flex-row h-full">
              {/* Imagen del producto */}
              <div className="relative lg:w-1/2 p-6 lg:p-8">
                <div className="relative h-64 lg:h-full">
                  {/* Efecto de resplandor detrás de la imagen */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 via-amber-300/20 to-amber-200/10 rounded-2xl blur-xl scale-110"></div>
                  
                  {/* Contenedor de imagen */}
                  <div className="relative h-full bg-gradient-to-br from-amber-100/40 to-stone-200/60 rounded-2xl p-6 border border-amber-300/30 shadow-lg">
                    <img
                      src={product.image_url?.startsWith('http') ? product.image_url : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://posoqo-backend.onrender.com'}${product.image_url || ''}`}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Efecto de brillo en la imagen */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
                </div>
              </div>

              {/* Información del producto */}
              <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col h-full">
                <div className="flex-1">
                  {/* Nombre del producto */}
                  <h2 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-3">
                    {product.name}
                  </h2>


                  {/* Pestañas */}
                  <div className="flex space-x-4 mb-4 border-b border-stone-300">
                    <button 
                      onClick={() => setActiveTab('descripcion')}
                      className={`font-semibold pb-2 transition-colors ${
                        activeTab === 'descripcion' 
                          ? 'text-stone-800 border-b-2 border-amber-500' 
                          : 'text-stone-600 hover:text-stone-800'
                      }`}
                    >
                      DESCRIPCIÓN
                    </button>
                    {productType === 'cerveza' && (
                      <button 
                        onClick={() => setActiveTab('detalles')}
                        className={`font-semibold pb-2 transition-colors ${
                          activeTab === 'detalles' 
                            ? 'text-stone-800 border-b-2 border-amber-500' 
                            : 'text-stone-600 hover:text-stone-800'
                        }`}
                      >
                        DETALLES
                      </button>
                    )}
                    <button 
                      onClick={() => setActiveTab('resenas')}
                      className={`font-semibold pb-2 transition-colors ${
                        activeTab === 'resenas' 
                          ? 'text-stone-800 border-b-2 border-amber-500' 
                          : 'text-stone-600 hover:text-stone-800'
                      }`}
                    >
                      RESEÑAS
                    </button>
                  </div>

                  {/* Contenido de pestañas */}
                  <div className="mb-6 min-h-[200px]">
                    {activeTab === 'descripcion' && (
                      <div>
                        <p className="text-stone-700 leading-relaxed text-base">
                          {product.description}
                        </p>
                      </div>
                    )}

                    {activeTab === 'detalles' && productType === 'cerveza' && (
                      <div className="grid grid-cols-2 gap-3">
                        {product.abv && (
                          <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200/50">
                            <span className="text-xs font-semibold text-stone-600">ABV</span>
                            <div className="text-lg font-bold text-amber-700">{product.abv}</div>
                          </div>
                        )}
                        {product.ibu && (
                          <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200/50">
                            <span className="text-xs font-semibold text-stone-600">IBU</span>
                            <div className="text-lg font-bold text-amber-700">{product.ibu}</div>
                          </div>
                        )}
                        {product.style && (
                          <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200/50">
                            <span className="text-xs font-semibold text-stone-600">ESTILO</span>
                            <div className="text-lg font-bold text-amber-700">{product.style}</div>
                          </div>
                        )}
                        {product.color && (
                          <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200/50">
                            <span className="text-xs font-semibold text-stone-600">COLOR</span>
                            <div className="text-lg font-bold text-amber-700">{product.color}</div>
                          </div>
                        )}
                        {product.category && (
                          <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200/50">
                            <span className="text-xs font-semibold text-stone-600">CATEGORÍA</span>
                            <div className="text-lg font-bold text-amber-700">{product.category}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'resenas' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarSolid key={star} className="w-5 h-5 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-stone-600 font-medium">4.5 de 5 estrellas</span>
                          <span className="text-stone-500 text-sm">({sampleReviews.length} reseñas)</span>
                        </div>
                        
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {sampleReviews.map((review) => (
                            <div key={review.id} className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-stone-800">{review.name}</h4>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <StarSolid 
                                      key={star} 
                                      className={`w-4 h-4 ${
                                        star <= review.rating ? 'text-amber-400' : 'text-stone-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-stone-700 text-sm mb-2">{review.comment}</p>
                              <span className="text-stone-500 text-xs">{review.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="mt-6 pt-4 border-t border-stone-200">
                  <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-xl text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    VER EN TIENDA
                  </button>
                </div>
              </div>
            </div>

            {/* Efecto de resplandor en el borde */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 rounded-3xl pointer-events-none"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 