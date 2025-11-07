"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MessageSquare, Send, Package, Store, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";
import { getImageUrl, getApiUrl } from "@/lib/config";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

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
  rating?: number;
  estilo?: string;
}

interface Review {
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  productType?: 'cerveza' | 'comida';
  onAddToCart?: (product: Product) => void;
  showAddToCart?: boolean; // Si es true, muestra "Agregar al Carrito" en lugar de "Ver Tienda"
}

export default function ProductModal({ product, isOpen, onClose, productType = 'cerveza', onAddToCart, showAddToCart = false }: ProductModalProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('descripcion');
  
  // Detectar si es comida basado en productType Y propiedades del producto
  // Si el producto NO tiene propiedades de cerveza (abv, ibu), es comida
  const isComida = React.useMemo(() => {
    // Si el prop productType es explícitamente 'comida', es comida
    if (productType === 'comida') return true;
    
    // Si no hay producto, no es comida
    if (!product) return false;
    
    // Si el producto NO tiene propiedades de cerveza (abv, ibu, estilo), probablemente es comida
    const hasBeerProperties = !!(product.abv || product.ibu || product.estilo || product.style);
    
    // Si productType es 'cerveza' pero el producto no tiene propiedades de cerveza, 
    // y productType no fue explícitamente pasado, podría ser comida
    if (productType === 'cerveza' && !hasBeerProperties && product.category) {
      const categoryLower = product.category.toLowerCase();
      if (categoryLower.includes('comida') || categoryLower.includes('food') || categoryLower.includes('gastronom')) {
        return true;
      }
    }
    
    // Si no tiene propiedades de cerveza y productType no es 'cerveza', es comida
    return !hasBeerProperties;
  }, [productType, product]);
  
  // Asegurar que productType sea válido
  const currentProductType = isComida ? 'comida' : 'cerveza';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [checkingCanReview, setCheckingCanReview] = useState(false);
  
  // Resetear y configurar pestaña cuando se abre el modal
  useEffect(() => {
    if (isOpen && product?.id) {
      // Si es comida, siempre usar 'descripcion' (no mostrar detalles)
      // Si es cerveza, resetear a 'descripcion' también al abrir
      setActiveTab('descripcion');
      
      loadReviews();
      if (session) {
        checkCanReview();
      } else {
        setCanReview(false);
      }
    }
  }, [isOpen, product?.id, session, currentProductType]);
  
  // Si cambia el productType a 'comida' y estamos en 'detalles', cambiar a 'descripcion'
  useEffect(() => {
    if (currentProductType === 'comida' && activeTab === 'detalles') {
      setActiveTab('descripcion');
    }
  }, [currentProductType, activeTab]);
  
  // Prevenir que se cambie a 'detalles' si es comida
  const handleTabChange = (tab: string) => {
    // Si intenta cambiar a 'detalles' y es comida, no permitirlo
    if (tab === 'detalles' && currentProductType === 'comida') {
      return;
    }
    setActiveTab(tab);
  };

  const checkCanReview = async () => {
    if (!product?.id || !session) {
      setCanReview(false);
      return;
    }
    
    setCheckingCanReview(true);
    try {
      const data = await apiFetch<{ can_review: boolean; reason?: string }>(
        `protected/products/${product.id}/can-review`
      );
      setCanReview(data.can_review || false);
    } catch (error) {
      console.error('Error verificando si puede reseñar:', error);
      setCanReview(false);
    } finally {
      setCheckingCanReview(false);
    }
  };

  const loadReviews = async () => {
    if (!product?.id) return;
    
    setLoadingReviews(true);
    try {
      // Agregar timestamp para evitar cache
      const timestamp = Date.now();
      const data = await apiFetch<{ reviews: Review[]; pagination?: any }>(
        `products/${product.id}/reviews?t=${timestamp}`
      );
      
      const reviewsList = data.reviews || [];
      setReviews(reviewsList);
      
      // Calcular promedio de rating usando todas las reseñas
      // Si hay paginación, necesitamos cargar todas las reseñas para el promedio exacto
      if (reviewsList.length > 0) {
        // Si hay más páginas, cargar todas para calcular promedio correcto
        if (data.pagination && data.pagination.total > reviewsList.length) {
          const allReviewsData = await apiFetch<{ reviews: Review[]; pagination?: any }>(
            `products/${product.id}/reviews?limit=${data.pagination.total}&t=${timestamp}`
          );
          const allReviews = allReviewsData.reviews || [];
          if (allReviews.length > 0) {
            const avg = allReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / allReviews.length;
            setAverageRating(avg);
          } else {
            setAverageRating(0);
          }
        } else {
          const avg = reviewsList.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviewsList.length;
          setAverageRating(avg);
        }
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
      setReviews([]);
      setAverageRating(0);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!product?.id || !session) {
      alert('Debes estar autenticado para enviar una reseña');
      return;
    }

    if (selectedRating === 0) {
      alert('Por favor, selecciona una calificación');
      return;
    }

    setSubmittingReview(true);
    try {
      await apiFetch<{ message: string }>(
        `protected/products/${product.id}/reviews`,
        {
          method: 'POST',
          body: JSON.stringify({
            rating: selectedRating,
            comment: reviewComment.trim() || ""
          })
        }
      );

      // Limpiar formulario
      setReviewComment('');
      setSelectedRating(0);
      
      // Esperar un momento para que el backend procese
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recargar reseñas y verificar si puede reseñar
      await Promise.all([loadReviews(), checkCanReview()]);
      
      // Mostrar mensaje de éxito DESPUÉS de recargar
      alert('¡Reseña enviada exitosamente!');
    } catch (error: any) {
      console.error('Error enviando reseña:', error);
      const errorMessage = error.message || 'Error al enviar la reseña. Asegúrate de haber comprado este producto.';
      alert(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="relative p-6 border-b border-gray-700">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-4">
                  {/* Imagen del producto */}
                  <div className="relative w-24 h-24 bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
                    <img
                      src={getImageUrl(product.image_url || product.image || '')}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
                    {product.price && (
                      <div className="text-2xl font-bold text-white">
                        S/ {product.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Imagen grande */}
                  <div className="space-y-4">
                    <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-square flex items-center justify-center p-8">
                      <img
                        src={getImageUrl(product.image_url || product.image || '')}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Información */}
                  <div className="space-y-6">
                    {/* Pestañas */}
                    <div className="flex space-x-4 border-b border-gray-700">
                      <button 
                        onClick={() => handleTabChange('descripcion')}
                        className={`pb-3 px-2 font-semibold transition-colors ${
                          activeTab === 'descripcion' 
                            ? 'text-white border-b-2 border-cyan-400' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        DESCRIPCIÓN
                      </button>
                      {/* Pestaña DETALLES - NO RENDERIZAR en absoluto si es comida */}
                      {!isComida && (
                        <button 
                          onClick={() => handleTabChange('detalles')}
                          className={`pb-3 px-2 font-semibold transition-colors ${
                            activeTab === 'detalles' 
                              ? 'text-white border-b-2 border-cyan-400' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          DETALLES
                        </button>
                      )}
                      <button 
                        onClick={() => handleTabChange('resenas')}
                        className={`pb-3 px-2 font-semibold transition-colors ${
                          activeTab === 'resenas' 
                            ? 'text-white border-b-2 border-cyan-400' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        RESEÑAS ({reviews.length})
                      </button>
                    </div>

                    {/* Contenido de pestañas */}
                    <div className="min-h-[300px]">
                      {activeTab === 'descripcion' && (
                        <div>
                          <p className="text-gray-300 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      )}

                      {activeTab === 'detalles' && currentProductType !== 'comida' && (
                        <div className="grid grid-cols-2 gap-4">
                          {product.abv && (
                            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                              <div className="text-xs text-gray-400 mb-1 uppercase">ABV</div>
                              <div className="text-lg font-bold text-white">{product.abv}</div>
                            </div>
                          )}
                          {product.ibu && (
                            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                              <div className="text-xs text-gray-400 mb-1 uppercase">IBU</div>
                              <div className="text-lg font-bold text-white">{product.ibu}</div>
                            </div>
                          )}
                          {product.estilo && (
                            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                              <div className="text-xs text-gray-400 mb-1 uppercase">ESTILO</div>
                              <div className="text-lg font-bold text-white">{product.estilo}</div>
                            </div>
                          )}
                          {product.color && (
                            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                              <div className="text-xs text-gray-400 mb-1 uppercase">COLOR</div>
                              <div className="text-lg font-bold text-white">{product.color}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'resenas' && (
                        <div className="space-y-6">
                          {/* Rating promedio */}
                          <div className="flex items-center gap-4 pb-4 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const starValue = i + 1;
                                const isFilled = starValue <= Math.floor(averageRating);
                                return (
                                  <Star
                                    key={i}
                                    className={`w-5 h-5 ${
                                      isFilled
                                        ? 'fill-cyan-400 text-cyan-400'
                                        : 'fill-gray-600 text-gray-600'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                            <span className="text-white font-semibold">
                              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                            </span>
                            <span className="text-gray-400 text-sm">
                              ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
                            </span>
                          </div>

                          {/* Mensaje si no puede reseñar */}
                          {session && !checkingCanReview && !canReview && (
                            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                              <p className="text-gray-400 text-sm text-center">
                                Para reseñar este producto, debes haberlo comprado y recibido. 
                                Una vez que tu pedido esté en estado "entregado", podrás dejar tu reseña.
                              </p>
                            </div>
                          )}

                          {/* Formulario de reseña - Solo si el usuario puede reseñar */}
                          {session && !checkingCanReview && canReview && (
                            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                              <h3 className="text-white font-semibold mb-3">Escribe tu reseña</h3>
                              
                              {/* Rating selector */}
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-gray-400 text-sm">Calificación:</span>
                                <div className="flex gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => {
                                    const starValue = i + 1;
                                    return (
                                      <button
                                        key={i}
                                        onClick={() => setSelectedRating(starValue)}
                                        className="focus:outline-none"
                                      >
                                        <Star
                                          className={`w-5 h-5 transition-colors ${
                                            starValue <= selectedRating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'fill-gray-600 text-gray-600 hover:fill-gray-500'
                                          }`}
                                        />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Comentario */}
                              <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Escribe tu comentario..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
                                rows={3}
                              />

                              {/* Botón enviar */}
                              <button
                                onClick={handleSubmitReview}
                                disabled={submittingReview || selectedRating === 0}
                                className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <Send className="w-4 h-4" />
                                {submittingReview ? 'Enviando...' : 'Enviar Reseña'}
                              </button>
                            </div>
                          )}

                          {/* Lista de reseñas */}
                          <div className="space-y-4">
                            {loadingReviews ? (
                              <div className="text-gray-400 text-center py-8">Cargando reseñas...</div>
                            ) : reviews.length === 0 ? (
                              <div className="text-gray-400 text-center py-8">
                                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No hay reseñas aún</p>
                              </div>
                            ) : (
                              reviews.map((review, index) => (
                                <div key={index} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-white">{review.user_name}</h4>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => {
                                        const starValue = i + 1;
                                        return (
                                          <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                              starValue <= review.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'fill-gray-600 text-gray-600'
                                            }`}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {review.comment && (
                                    <p className="text-gray-300 text-sm mb-2">{review.comment}</p>
                                  )}
                                  <span className="text-gray-500 text-xs">
                                    {new Date(review.created_at).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700 bg-gray-900">
                {showAddToCart && onAddToCart && product ? (
                  <button 
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold py-3 px-6 rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Agregar al Carrito
                  </button>
                ) : (
                  <Link href="/products">
                    <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center gap-2">
                      <Store className="w-5 h-5" />
                      Ver Tienda
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
