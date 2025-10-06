"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorInfo {
  error: Error;
  errorInfo: any;
  timestamp: Date;
  componentStack: string;
  errorBoundary: string;
}

interface ErrorBoundaryContextType {
  errors: ErrorInfo[];
  reportError: (error: Error, errorInfo: any, componentStack: string, errorBoundary: string) => void;
  clearErrors: () => void;
  clearError: (index: number) => void;
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextType | undefined>(undefined);

export const ErrorBoundaryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const reportError = useCallback((
    error: Error,
    errorInfo: any,
    componentStack: string,
    errorBoundary: string
  ) => {
    const newError: ErrorInfo = {
      error,
      errorInfo,
      timestamp: new Date(),
      componentStack,
      errorBoundary,
    };

    setErrors(prev => [...prev, newError]);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary: ${errorBoundary}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', componentStack);
      console.groupEnd();
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Aquí se puede integrar con servicios como Sentry, LogRocket, etc.
      console.error('Production Error:', {
        message: error.message,
        stack: error.stack,
        componentStack,
        errorBoundary,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <ErrorBoundaryContext.Provider
      value={{
        errors,
        reportError,
        clearErrors,
        clearError,
      }}
    >
      {children}
      <ErrorNotificationPanel />
    </ErrorBoundaryContext.Provider>
  );
};

const ErrorNotificationPanel: React.FC = () => {
  const { errors, clearError } = useErrorBoundary();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {errors.map((errorInfo, index) => (
        <ErrorNotification
          key={index}
          errorInfo={errorInfo}
          onDismiss={() => clearError(index)}
        />
      ))}
    </div>
  );
};

const ErrorNotification: React.FC<{
  errorInfo: ErrorInfo;
  onDismiss: () => void;
}> = ({ errorInfo, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className="bg-red-500/90 backdrop-blur-sm rounded-lg shadow-lg border border-red-400 text-white p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Error en {errorInfo.errorBoundary}</h4>
            <button
              onClick={onDismiss}
              className="text-white/80 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-sm mt-1 opacity-90 truncate">
            {errorInfo.error.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-white/80 hover:text-white transition-colors"
            >
              {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
            >
              Recargar
            </button>
          </div>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-black/20 rounded text-xs font-mono overflow-auto max-h-32"
            >
              <div className="space-y-1">
                <div><strong>Error:</strong> {errorInfo.error.message}</div>
                <div><strong>Componente:</strong> {errorInfo.errorBoundary}</div>
                <div><strong>Hora:</strong> {errorInfo.timestamp.toLocaleTimeString()}</div>
                {process.env.NODE_ENV === 'development' && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 text-xs opacity-75 overflow-auto">
                      {errorInfo.error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const useErrorBoundary = () => {
  const context = useContext(ErrorBoundaryContext);
  if (context === undefined) {
    throw new Error('useErrorBoundary must be used within an ErrorBoundaryProvider');
  }
  return context;
};

export default ErrorBoundaryProvider;
