'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Sparkles, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/apiFetch';
import Image from 'next/image';
import Link from 'next/link';

interface RecognitionResult {
  type: string;
  style: string;
  characteristics: string[];
  recommendations: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    similarity: number;
  }>;
}

interface ImageRecognitionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageRecognition({ isOpen, onClose }: ImageRecognitionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/ai/image-recognition', {
        method: 'POST',
        body: JSON.stringify({ image: selectedImage }),
      });

      if (response.success) {
        setResult(response.result);
      } else {
        setError('No se pudo analizar la imagen');
      }
    } catch (err: any) {
      setError(err.message || 'Error al analizar imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Reconocimiento de Imágenes</h2>
                  <p className="text-white/80 text-sm">Identifica cervezas con IA</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {!selectedImage ? (
              /* Upload Area */
              <div className="space-y-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sube una imagen de cerveza
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Haz clic para seleccionar una imagen o arrastra y suelta
                  </p>
                  <p className="text-sm text-gray-500">
                    Formatos: JPG, PNG, WEBP (máx. 5MB)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium mb-1">
                        ¿Cómo funciona?
                      </p>
                      <p className="text-xs text-blue-700">
                        Nuestra IA analiza la imagen de la cerveza y detecta características como color, 
                        estilo, tipo de botella, y más. Luego te recomienda productos similares de nuestro catálogo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Analysis Area */
              <div className="space-y-6">
                {/* Image Preview */}
                <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt="Imagen seleccionada"
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Action Buttons */}
                {!result && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analizando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Analizar Imagen
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={loading}
                      className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cambiar
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                  >
                    <p className="text-red-800 text-center">{error}</p>
                  </motion.div>
                )}

                {/* Results */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Recognition Info */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-bold text-gray-900">Análisis de la Imagen</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Tipo detectado:</p>
                          <p className="text-lg font-bold text-gray-900">{result.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estilo:</p>
                          <p className="text-lg font-bold text-gray-900">{result.style}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Características:</p>
                          <div className="flex flex-wrap gap-2">
                            {result.characteristics.map((char, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-white border border-indigo-200 rounded-full text-sm text-gray-700"
                              >
                                {char}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-indigo-600" />
                          Productos Similares
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.recommendations.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products?id=${product.id}`}
                              onClick={handleClose}
                              className="block"
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex gap-4 p-4 bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl transition-all cursor-pointer group"
                              >
                                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                  {product.image_url ? (
                                    <Image
                                      src={product.image_url}
                                      alt={product.name}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                    {product.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">
                                      S/ {product.price.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-indigo-600 font-medium">
                                      {product.similarity}% similar
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Try Again */}
                    <button
                      onClick={handleReset}
                      className="w-full bg-white border-2 border-gray-200 hover:border-indigo-500 text-gray-700 font-medium py-3 rounded-lg transition-all"
                    >
                      Analizar otra imagen
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

