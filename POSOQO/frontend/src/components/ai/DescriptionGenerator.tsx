'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/apiFetch';

interface DescriptionGeneratorProps {
  name: string;
  category: string;
  estilo?: string;
  abv?: number;
  ibu?: number;
  onDescriptionGenerated: (description: string) => void;
}

export default function DescriptionGenerator({
  name,
  category,
  estilo,
  abv,
  ibu,
  onDescriptionGenerated,
}: DescriptionGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!name || !category) {
      setError('El nombre y la categoría son requeridos');
      return;
    }

    setLoading(true);
    setError(null);
    setDescription(null);

    try {
      const response = await apiFetch('/api/ai/admin/generate-description', {
        method: 'POST',
        body: JSON.stringify({
          name,
          category,
          estilo: estilo || '',
          abv: abv || 0,
          ibu: ibu || 0,
        }),
      });

      if (response.success) {
        setDescription(response.description);
      } else {
        setError('No se pudo generar la descripción');
      }
    } catch (err: any) {
      setError(err.message || 'Error al generar descripción');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (description) {
      navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUse = () => {
    if (description) {
      onDescriptionGenerated(description);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Generador de Descripciones con IA</h3>
          <p className="text-sm text-gray-600">Crea descripciones profesionales automáticamente</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white/60 border border-purple-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700">
          <strong>Producto:</strong> {name || 'Sin nombre'}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Categoría:</strong> {category || 'Sin categoría'}
        </p>
        {estilo && (
          <p className="text-sm text-gray-700">
            <strong>Estilo:</strong> {estilo}
          </p>
        )}
        {abv && abv > 0 && (
          <p className="text-sm text-gray-700">
            <strong>ABV:</strong> {abv}%
          </p>
        )}
        {ibu && ibu > 0 && (
          <p className="text-sm text-gray-700">
            <strong>IBU:</strong> {ibu}
          </p>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !name || !category}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generando descripción...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generar Descripción con IA
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
        >
          <p className="text-red-800 text-sm text-center">{error}</p>
        </motion.div>
      )}

      {/* Description */}
      {description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Descripción Generada:</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUse}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Usar esta descripción
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 bg-white border-2 border-purple-200 hover:border-purple-300 text-gray-700 font-medium py-3 rounded-lg transition-all"
            >
              Generar otra
            </button>
          </div>
        </motion.div>
      )}

      {/* Info Note */}
      {!description && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Completa el nombre y categoría del producto para generar una descripción profesional y atractiva automáticamente.
          </p>
        </div>
      )}
    </div>
  );
}

