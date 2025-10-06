/**
 * Sistema centralizado de manejo de errores
 * Proporciona logging, notificaciones y recuperación de errores
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  timestamp: Date;
  context?: Record<string, any>;
  stack?: string;
}

export interface ErrorHandlerOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
  logToService?: boolean;
  fallbackMessage?: string;
  retryable?: boolean;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorInfo[] = [];
  private maxLogSize = 100;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Maneja errores de API de forma consistente
   */
  public handleApiError = (
    error: any,
    context?: string,
    options: ErrorHandlerOptions = {}
  ): ErrorInfo => {
    const {
      showNotification = true,
      logToConsole = true,
      logToService = false,
      fallbackMessage = "Ha ocurrido un error inesperado",
      retryable = true,
    } = options;

    let errorInfo: ErrorInfo;

    if (error instanceof Error) {
      errorInfo = {
        message: error.message || fallbackMessage,
        code: this.extractErrorCode(error),
        timestamp: new Date(),
        context: { originalContext: context, ...this.extractContext(error) },
        stack: error.stack,
      };
    } else if (typeof error === 'string') {
      errorInfo = {
        message: error,
        timestamp: new Date(),
        context: { originalContext: context },
      };
    } else {
      errorInfo = {
        message: fallbackMessage,
        timestamp: new Date(),
        context: { originalContext: context, error },
      };
    }

    // Log del error
    if (logToConsole) {
      console.error(`[ErrorHandler] ${context || 'Unknown'}:`, errorInfo);
    }

    // Agregar al log interno
    this.addToLog(errorInfo);

    // Log a servicio externo (si está configurado)
    if (logToService) {
      this.logToExternalService(errorInfo);
    }

    // Mostrar notificación (si está habilitado)
    if (showNotification) {
      this.showNotification(errorInfo, retryable);
    }

    return errorInfo;
  };

  /**
   * Maneja errores de red específicamente
   */
  public handleNetworkError = (
    error: any,
    url: string,
    options: ErrorHandlerOptions = {}
  ): ErrorInfo => {
    const networkError = this.handleApiError(error, `Network request to ${url}`, {
      ...options,
      fallbackMessage: "Error de conexión. Verifica tu internet e intenta de nuevo.",
      retryable: true,
    });

    // Agregar información específica de red
    networkError.context = {
      ...networkError.context,
      url,
      isOnline: navigator.onLine,
      userAgent: navigator.userAgent,
    };

    return networkError;
  };

  /**
   * Maneja errores de validación
   */
  public handleValidationError = (
    field: string,
    message: string,
    value?: any
  ): ErrorInfo => {
    return this.handleApiError(
      new Error(`Validation error in ${field}: ${message}`),
      'Validation',
      {
        showNotification: false,
        logToConsole: true,
        fallbackMessage: `Error de validación en ${field}`,
        retryable: false,
      }
    );
  };

  /**
   * Obtiene errores recientes
   */
  public getRecentErrors = (limit: number = 10): ErrorInfo[] => {
    return this.errorLog.slice(-limit);
  };

  /**
   * Limpia el log de errores
   */
  public clearErrorLog = (): void => {
    this.errorLog = [];
  };

  /**
   * Verifica si un error es recuperable
   */
  public isRetryableError = (error: any): boolean => {
    if (error?.status) {
      // Errores 5xx son generalmente recuperables
      return error.status >= 500;
    }
    
    if (error?.code) {
      // Códigos de error específicos que son recuperables
      const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_FAILED'];
      return retryableCodes.includes(error.code);
    }

    // Errores de red son generalmente recuperables
    return error?.name === 'TypeError' && error?.message?.includes('fetch');
  };

  private addToLog = (errorInfo: ErrorInfo): void => {
    this.errorLog.push(errorInfo);
    
    // Mantener el log dentro del límite
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  };

  private extractErrorCode = (error: Error): string | undefined => {
    // Extraer código de error de mensajes comunes
    const codeMatch = error.message.match(/\[(\w+)\]/);
    return codeMatch ? codeMatch[1] : undefined;
  };

  private extractContext = (error: Error): Record<string, any> => {
    const context: Record<string, any> = {};
    
    // Extraer información útil del error
    if (error.name) context.errorName = error.name;
    
    // Extraer información de fetch si está disponible
    if ('response' in error) {
      context.response = {
        status: (error as any).response?.status,
        statusText: (error as any).response?.statusText,
      };
    }

    return context;
  };

  private showNotification = (errorInfo: ErrorInfo, retryable: boolean): void => {
    // Crear notificación personalizada
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg
      ${retryable ? 'bg-yellow-500/90' : 'bg-red-500/90'} text-white
      transform transition-all duration-300 ease-in-out
    `;
    
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-medium">${retryable ? 'Error temporal' : 'Error'}</p>
          <p class="text-sm mt-1">${errorInfo.message}</p>
          ${retryable ? '<p class="text-xs mt-2 opacity-75">Puedes intentar de nuevo</p>' : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 ml-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  };

  private logToExternalService = (errorInfo: ErrorInfo): void => {
    // Aquí se puede integrar con servicios como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Ejemplo de integración con servicio externo
      console.log('Logging to external service:', errorInfo);
    }
  };
}

// Instancia singleton
export const errorHandler = ErrorHandler.getInstance();

// Funciones de conveniencia
export const handleError = (error: any, context?: string, options?: ErrorHandlerOptions) => 
  errorHandler.handleApiError(error, context, options);

export const handleNetworkError = (error: any, url: string, options?: ErrorHandlerOptions) => 
  errorHandler.handleNetworkError(error, url, options);

export const handleValidationError = (field: string, message: string, value?: any) => 
  errorHandler.handleValidationError(field, message, value);

export const isRetryableError = (error: any) => 
  errorHandler.isRetryableError(error);

export const getRecentErrors = (limit?: number) => 
  errorHandler.getRecentErrors(limit);

export const clearErrorLog = () => 
  errorHandler.clearErrorLog();

export default errorHandler;
