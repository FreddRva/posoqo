import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Category, FilterState, SortOption, ViewMode } from '@/types/products';

interface ProductFiltersProps {
  categories: Category[];
  subcategories: Category[];
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  subcategories,
  filters,
  onFiltersChange,
  onResetFilters
}) => {
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name-asc', label: 'Nombre A-Z' },
    { value: 'name-desc', label: 'Nombre Z-A' },
    { value: 'price-asc', label: 'Precio Menor' },
    { value: 'price-desc', label: 'Precio Mayor' },
    { value: 'popularity', label: 'Más Populares' }
  ];

  const viewModes: { value: ViewMode; label: string }[] = [
    { value: 'grid', label: 'Cuadrícula' },
    { value: 'list', label: 'Lista' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Header móvil */}
      <div className="flex items-center justify-between lg:hidden mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Contenido de filtros */}
      <motion.div
        initial={false}
        animate={{ height: showMobileFilters || window.innerWidth >= 1024 ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ category: e.target.value, subcategory: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategoría */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Subcategoría</label>
            <select
              value={filters.subcategory}
              onChange={(e) => onFiltersChange({ subcategory: e.target.value })}
              disabled={!filters.category}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Todas las subcategorías</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ordenar por</label>
            <select
              value={filters.sort}
              onChange={(e) => onFiltersChange({ sort: e.target.value as SortOption })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Limpiar filtros</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Vista:</span>
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onFiltersChange({ viewMode: mode.value as ViewMode })}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filters.viewMode === mode.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
