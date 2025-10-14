import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, ChevronDown, Grid3X3, List } from 'lucide-react';
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
    <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-400/20 p-6 mb-8 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
      
      {/* Header móvil */}
      <div className="flex items-center justify-between lg:hidden mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Filtros</h3>
        </div>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-400 rounded-xl hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMobileFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Contenido de filtros */}
      <motion.div
        initial={false}
        animate={{ height: showMobileFilters || window.innerWidth >= 1024 ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {/* Búsqueda inteligente */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-blue-400">
              Buscar
            </label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 group-hover:text-cyan-400 transition-colors duration-300" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                placeholder="Buscar productos..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-blue-400/30 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 text-white placeholder-gray-400 transition-all duration-300 hover:border-blue-400/50"
              />
              {filters.search && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-purple-400">
              Categoría
            </label>
            <div className="relative group">
              <select
                value={filters.category}
                onChange={(e) => onFiltersChange({ category: e.target.value, subcategory: '' })}
                className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-purple-400/30 rounded-xl focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 text-white transition-all duration-300 hover:border-purple-400/50 appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-800 text-white">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-gray-800 text-white">
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Subcategoría */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-cyan-400">
              Subcategoría
            </label>
            <div className="relative group">
              <select
                value={filters.subcategory}
                onChange={(e) => onFiltersChange({ subcategory: e.target.value })}
                disabled={!filters.category}
                className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 text-white transition-all duration-300 hover:border-cyan-400/50 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-gray-800 text-white">Todas las subcategorías</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id} className="bg-gray-800 text-white">
                    {subcategory.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-green-400">
              Ordenar por
            </label>
            <div className="relative group">
              <select
                value={filters.sort}
                onChange={(e) => onFiltersChange({ sort: e.target.value as SortOption })}
                className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-green-400/30 rounded-xl focus:ring-2 focus:ring-green-400/50 focus:border-green-400 text-white transition-all duration-300 hover:border-green-400/50 appearance-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Botones de acción galácticos */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gradient-to-r from-transparent via-blue-400/30 to-transparent relative z-10">
          <motion.button
            onClick={onResetFilters}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-400/30 text-red-400 rounded-xl hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold">Limpiar Filtros</span>
          </motion.button>

          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-300">
              Vista:
            </span>
            <div className="flex items-center gap-2">
              {viewModes.map((mode) => (
                <motion.button
                  key={mode.value}
                  onClick={() => onFiltersChange({ viewMode: mode.value as ViewMode })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    filters.viewMode === mode.value
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30'
                  }`}
                >
                  {mode.value === 'grid' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  {mode.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
