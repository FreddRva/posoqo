"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, AlertCircle } from 'lucide-react';
import { useDashboardProducts } from '@/hooks/useDashboardProducts';
import { ProductStats } from '@/components/dashboard/ProductStats';
import { ProductFilters } from '@/components/dashboard/ProductFilters';
import { ProductCard } from '@/components/dashboard/ProductCard';
import { ProductModal } from '@/components/dashboard/ProductModal';

export default function ProductsPage() {
  const {
    products,
    allProducts,
    categories,
    allCategories,
    allSubcategories,
    loading,
    error,
    isModalOpen,
    editingProduct,
    saving,
    searchQuery,
    selectedCategory,
    stats,
    setSearchQuery,
    setSelectedCategory,
    openCreateModal,
    openEditModal,
    closeModal,
    saveProduct,
    deleteProduct,
    toggleActive,
    toggleFeatured,
    setError
  } = useDashboardProducts();

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Gestión de Productos
              </h1>
              <p className="text-gray-600 mt-2">
                Administra tu catálogo de productos y cervezas
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </motion.button>
          </div>
        </div>

        {/* Estadísticas */}
        <ProductStats {...stats} />

        {/* Filtros */}
        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={allCategories}
          onClearFilters={handleClearFilters}
        />

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Lista de productos */}
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {allProducts.length === 0 ? 'No hay productos' : 'No se encontraron productos'}
            </h3>
            <p className="text-gray-600 mb-6">
              {allProducts.length === 0 
                ? 'Comienza creando tu primer producto'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            {allProducts.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Crear Primer Producto
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onEdit={openEditModal}
                  onDelete={deleteProduct}
                  onToggleActive={toggleActive}
                  onToggleFeatured={toggleFeatured}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modal de producto */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={closeModal}
          product={editingProduct}
          categories={allCategories}
          subcategories={allSubcategories}
          onSave={saveProduct}
          loading={saving}
        />
      </div>
    </div>
  );
}