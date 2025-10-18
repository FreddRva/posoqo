'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, Loader2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/apiFetch';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResult {
  product: Product;
  relevance: number;
  reason?: string;
}

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartSearch({ isOpen, onClose }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions] = useState([
    'Cerveza amarga para carnes rojas',
    'Bebida refrescante para el verano',
    'Comida picante',
    'Cerveza suave para principiantes',
    'Maridaje con pizza',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSearch = async () => {
    if (query.length < 3) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/ai/search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });

      if (response.success) {
        setResults(response.results || []);
      } else {
        setError('No se encontraron resultados');
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Búsqueda Inteligente</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por descripción natural: 'cerveza amarga', 'comida picante'..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-all"
              />
              {loading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white animate-spin" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
            {/* Suggestions */}
            {!query && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Búsquedas sugeridas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                </h3>
                {results.map((result, index) => (
                  <Link
                    key={result.product.id}
                    href={`/products?id=${result.product.id}`}
                    onClick={handleClose}
                    className="block"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer group"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                        {result.product.image_url ? (
                          <Image
                            src={result.product.image_url}
                            alt={result.product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                          {result.product.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {result.product.description}
                        </p>
                        {result.reason && (
                          <div className="flex items-start gap-2 mt-2">
                            <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-purple-600 italic">{result.reason}</p>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex flex-col items-end justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          S/ {result.product.price.toFixed(2)}
                        </span>
                        {result.product.stock > 0 ? (
                          <span className="text-xs text-green-600 font-medium">
                            En stock
                          </span>
                        ) : (
                          <span className="text-xs text-red-600 font-medium">
                            Agotado
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}

            {/* No results */}
            {!loading && query.length >= 3 && results.length === 0 && !error && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron resultados para "{query}"</p>
                <p className="text-sm text-gray-400 mt-2">Intenta con otra búsqueda</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

