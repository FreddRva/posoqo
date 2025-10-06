"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
  progress?: number;
  message?: string;
}

export interface UseLoadingStateOptions {
  initialData?: any;
  autoReset?: boolean;
  resetDelay?: number;
  onError?: (error: string) => void;
  onSuccess?: (data: any) => void;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const {
    initialData = null,
    autoReset = false,
    resetDelay = 3000,
    onError,
    onSuccess,
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    data: initialData,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    setState(prev => ({
      ...prev,
      isLoading,
      error: isLoading ? null : prev.error,
      message: isLoading ? message : undefined,
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error,
      message: undefined,
    }));

    if (onError) {
      onError(error);
    }

    if (autoReset) {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          error: null,
        }));
      }, resetDelay);
    }
  }, [autoReset, resetDelay, onError]);

  const setData = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: null,
      data,
      message: undefined,
    }));

    if (onSuccess) {
      onSuccess(data);
    }
  }, [onSuccess]);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: initialData,
      progress: undefined,
      message: undefined,
    });
  }, [initialData]);

  const execute = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    options: {
      message?: string;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<T | null> => {
    try {
      setLoading(true, options.message);
      setProgress(0);

      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    }
  }, [setLoading, setError, setData, setProgress]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    setData,
    setProgress,
    reset,
    execute,
  };
};

// Hook especializado para operaciones de API
export const useApiLoadingState = (options: UseLoadingStateOptions = {}) => {
  const loadingState = useLoadingState(options);

  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    message?: string
  ): Promise<T | null> => {
    return loadingState.execute(apiCall, { message });
  }, [loadingState]);

  return {
    ...loadingState,
    executeApiCall,
  };
};

// Hook para operaciones de carrito
export const useCartLoadingState = () => {
  return useLoadingState({
    initialData: [],
    autoReset: true,
    resetDelay: 2000,
  });
};

// Hook para operaciones de formularios
export const useFormLoadingState = () => {
  return useLoadingState({
    initialData: null,
    autoReset: false,
  });
};

export default useLoadingState;
