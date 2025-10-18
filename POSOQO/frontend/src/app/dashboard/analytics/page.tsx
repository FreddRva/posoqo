'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles } from 'lucide-react';
import { PredictiveAnalytics } from '@/components/ai';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                Análisis Predictivo
                <Sparkles className="w-6 h-6 text-purple-600" />
              </h1>
              <p className="text-gray-600 mt-1">
                Predicciones y análisis inteligentes con IA
              </p>
            </div>
          </div>
        </motion.div>

        {/* Analytics Component */}
        <PredictiveAnalytics />
      </div>
    </div>
  );
}

