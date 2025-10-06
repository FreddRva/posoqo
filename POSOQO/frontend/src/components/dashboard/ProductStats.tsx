// components/dashboard/ProductStats.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Package, Eye, Star, AlertTriangle } from 'lucide-react';
import { ProductStatsProps } from '@/types/dashboard';

export const ProductStats: React.FC<ProductStatsProps> = ({
  total,
  active,
  featured,
  outOfStock
}) => {
  const stats = [
    {
      icon: Package,
      label: 'Total Productos',
      value: total,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Eye,
      label: 'Activos',
      value: active,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      icon: Star,
      label: 'Destacados',
      value: featured,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      icon: AlertTriangle,
      label: 'Sin Stock',
      value: outOfStock,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.label}
              </p>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
