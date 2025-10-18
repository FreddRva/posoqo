'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib';

interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  insight: string;
}

interface AnalyticsData {
  predictions: Prediction[];
  recommendations: string[];
  risks: string[];
  opportunities: string[];
}

export default function PredictiveAnalytics() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/ai/admin/analytics', {
        method: 'GET',
      }) as { success: boolean; data?: AnalyticsData };

      if (response.success && response.data) {
        setData(response.data);
        setLastUpdate(new Date());
      } else {
        setError('No se pudieron obtener los análisis');
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener análisis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-400 rounded-full" />;
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric.toLowerCase()) {
      case 'ventas':
        return <DollarSign className="w-6 h-6" />;
      case 'productos':
        return <Package className="w-6 h-6" />;
      case 'clientes':
        return <Users className="w-6 h-6" />;
      default:
        return <Calendar className="w-6 h-6" />;
    }
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analizando datos con IA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Análisis Predictivo con IA</h2>
              <p className="text-white/80 text-sm">
                {lastUpdate ? `Última actualización: ${lastUpdate.toLocaleString()}` : 'Cargando...'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Actualizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Predictions */}
      {data?.predictions && data.predictions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.predictions.map((prediction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    {getMetricIcon(prediction.metric)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{prediction.metric}</h3>
                    <p className="text-sm text-gray-500">Predicción</p>
                  </div>
                </div>
                {getTrendIcon(prediction.trend)}
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-600">Actual:</span>
                  <span className="text-lg font-bold text-gray-900">{prediction.current.toLocaleString()}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-600">Predicción:</span>
                  <span className="text-lg font-bold text-purple-600">{prediction.predicted.toLocaleString()}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-600">Cambio:</span>
                  <span className={`text-lg font-bold ${prediction.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {prediction.change >= 0 ? '+' : ''}{prediction.change.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Confianza:</span>
                  <span className="text-xs font-medium text-gray-700">{prediction.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">{prediction.insight}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recommendations & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations */}
        {data?.recommendations && data.recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Recomendaciones</h3>
            </div>
            <ul className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {data?.risks && data.risks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Riesgos</h3>
            </div>
            <ul className="space-y-3">
              {data.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">⚠</span>
                  <span className="text-sm text-gray-700">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Opportunities */}
        {data?.opportunities && data.opportunities.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Oportunidades</h3>
            </div>
            <ul className="space-y-3">
              {data.opportunities.map((opp, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">💡</span>
                  <span className="text-sm text-gray-700">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Sobre el Análisis Predictivo</h4>
            <p className="text-sm text-gray-700">
              Este análisis utiliza IA avanzada para predecir tendencias futuras basándose en tus datos históricos,
              patrones de comportamiento de clientes y tendencias del mercado. Las predicciones se actualizan
              automáticamente y tienen un nivel de confianza asociado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

