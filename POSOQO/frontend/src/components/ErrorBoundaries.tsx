"use client";

import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

// Error boundary para secciones específicas
export const SectionErrorBoundary: React.FC<{
  children: ReactNode;
  sectionName: string;
  fallback?: ReactNode;
}> = ({ children, sectionName, fallback }) => {
  const defaultFallback = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-20 text-center"
    >
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          Error en {sectionName}
        </h3>
        <p className="text-neutral-300 mb-6">
          Ha ocurrido un error al cargar esta sección. Por favor, recarga la página.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
        >
          Recargar página
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <ErrorBoundary
      errorBoundaryName={`Section: ${sectionName}`}
      fallback={fallback || defaultFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

// Error boundary para componentes de datos
export const DataErrorBoundary: React.FC<{
  children: ReactNode;
  dataType: string;
  fallback?: ReactNode;
}> = ({ children, dataType, fallback }) => {
  const defaultFallback = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12 text-center"
    >
      <div className="max-w-sm mx-auto">
        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bug className="w-6 h-6 text-yellow-500" />
        </div>
        <h4 className="text-lg font-bold text-white mb-2">
          Error cargando {dataType}
        </h4>
        <p className="text-neutral-300 text-sm mb-4">
          No se pudieron cargar los datos. Intenta de nuevo.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors text-sm"
        >
          Reintentar
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <ErrorBoundary
      errorBoundaryName={`Data: ${dataType}`}
      fallback={fallback || defaultFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

// Error boundary para formularios
export const FormErrorBoundary: React.FC<{
  children: ReactNode;
  formName: string;
  fallback?: ReactNode;
}> = ({ children, formName, fallback }) => {
  const defaultFallback = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 text-center"
    >
      <div className="max-w-sm mx-auto">
        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5 text-blue-500" />
        </div>
        <h4 className="text-lg font-bold text-white mb-2">
          Error en {formName}
        </h4>
        <p className="text-neutral-300 text-sm mb-4">
          Ha ocurrido un error en el formulario. Por favor, intenta de nuevo.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          Reintentar
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <ErrorBoundary
      errorBoundaryName={`Form: ${formName}`}
      fallback={fallback || defaultFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

// Error boundary para componentes de UI
export const UIErrorBoundary: React.FC<{
  children: ReactNode;
  componentName: string;
  fallback?: ReactNode;
}> = ({ children, componentName, fallback }) => {
  const defaultFallback = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 text-center bg-neutral-800 rounded-lg border border-neutral-700"
    >
      <div className="w-8 h-8 bg-neutral-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-4 h-4 text-neutral-400" />
      </div>
      <p className="text-neutral-400 text-sm">
        Error en {componentName}
      </p>
    </motion.div>
  );

  return (
    <ErrorBoundary
      errorBoundaryName={`UI: ${componentName}`}
      fallback={fallback || defaultFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

// Error boundary para rutas completas
export const RouteErrorBoundary: React.FC<{
  children: ReactNode;
  routeName: string;
  fallback?: ReactNode;
}> = ({ children, routeName, fallback }) => {
  const defaultFallback = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-neutral-900 text-white flex items-center justify-center px-6"
    >
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">
          Error en {routeName}
        </h1>
        <p className="text-neutral-300 mb-8">
          Ha ocurrido un error inesperado en esta página. Por favor, recarga la página o regresa al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Recargar página
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 border-2 border-red-400 text-red-400 font-bold rounded-lg hover:bg-red-400 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4 inline mr-2" />
            Ir al inicio
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <ErrorBoundary
      errorBoundaryName={`Route: ${routeName}`}
      fallback={fallback || defaultFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

export default {
  SectionErrorBoundary,
  DataErrorBoundary,
  FormErrorBoundary,
  UIErrorBoundary,
  RouteErrorBoundary,
};
