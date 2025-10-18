'use client';

import { useState } from 'react';
import { Wine, Utensils, Sparkles, X, Loader2, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib';
import Image from 'next/image';

interface PairingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
}

export default function PairingAssistant({ isOpen, onClose, productId, productName }: PairingAssistantProps) {
  const [mode, setMode] = useState<'food' | 'beer'>('food');
  const [input, setInput] = useState('');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetRecommendation = async () => {
    if (!input && !productId) return;

    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const body = mode === 'food' 
        ? { food: input }
        : { productId: productId || input };

      const response = await apiFetch('/api/ai/pairing', {
        method: 'POST',
        body: JSON.stringify(body),
      }) as { success: boolean; pairing_recommendation?: string };

      if (response.success && response.pairing_recommendation) {
        setRecommendation(response.pairing_recommendation);
      } else {
        setError('No se pudo generar la recomendación');
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener recomendación');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInput('');
    setRecommendation(null);
    setError(null);
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Asistente de Maridaje</h2>
                  <p className="text-white/80 text-sm">Powered by IA</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mode Selector */}
            {!productId && (
              <div className="flex gap-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setMode('food')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                    mode === 'food'
                      ? 'bg-white text-amber-600 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Utensils className="w-5 h-5" />
                  <span className="font-medium">Tengo comida</span>
                </button>
                <button
                  onClick={() => setMode('beer')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                    mode === 'beer'
                      ? 'bg-white text-amber-600 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Wine className="w-5 h-5" />
                  <span className="font-medium">Tengo cerveza</span>
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Input Section */}
            {!productId && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {mode === 'food' ? '¿Qué comida tienes?' : '¿Qué cerveza tienes?'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'food' ? 'Ej: Pizza margarita' : 'Ej: IPA'}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && handleGetRecommendation()}
                  />
                </div>
              </div>
            )}

            {/* Product Info (if provided) */}
            {productId && productName && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Buscando maridaje para:</p>
                <p className="text-lg font-bold text-gray-900">{productName}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleGetRecommendation}
              disabled={loading || (!input && !productId)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generando recomendación...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Obtener Recomendación
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <p className="text-red-800 text-center">{error}</p>
              </motion.div>
            )}

            {/* Recommendation */}
            {recommendation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-gray-900">Recomendación de Maridaje</h3>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                </div>

                {/* Try Again Button */}
                <button
                  onClick={() => {
                    setRecommendation(null);
                    setInput('');
                  }}
                  className="w-full mt-4 bg-white border-2 border-gray-200 hover:border-amber-500 text-gray-700 font-medium py-3 rounded-lg transition-all"
                >
                  Probar con otra opción
                </button>
              </motion.div>
            )}

            {/* Info */}
            {!recommendation && !loading && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      ¿Cómo funciona?
                    </p>
                    <p className="text-xs text-blue-700">
                      Nuestra IA analiza las características de tu {mode === 'food' ? 'comida' : 'cerveza'} y 
                      te recomienda el {mode === 'food' ? 'maridaje perfecto' : 'mejor acompañamiento'} basándose 
                      en sabores, texturas y tradiciones culinarias.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

