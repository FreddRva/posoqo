"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, ShoppingCart } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

interface SmartRecommendationsProps {
  productId?: string;
  userId?: string;
  preferences?: string[];
  title?: string;
  limit?: number;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  productId,
  userId,
  preferences = [],
  title = 'Recomendado para ti',
  limit = 4,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [productId, userId, preferences]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch<{
        success: boolean;
        products: Product[];
      }>('/ai/recommend', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          userId,
          preferences,
          limit,
        }),
      });

      if (response.success && response.products) {
        setProducts(response.products);
      }
    } catch (err) {
      console.error('Error al cargar recomendaciones:', err);
      setError('No se pudieron cargar las recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900">Generando recomendaciones...</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <div className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full">
          IA
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <Link href={`/products?id=${product.id}`}>
              <div className="relative h-64 overflow-hidden bg-gray-100">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <TrendingUp className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Recomendado
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">S/ {product.price.toFixed(2)}</p>
                    {product.stock > 0 ? (
                      <p className="text-xs text-green-600">Stock disponible</p>
                    ) : (
                      <p className="text-xs text-red-600">Agotado</p>
                    )}
                  </div>
                  <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

