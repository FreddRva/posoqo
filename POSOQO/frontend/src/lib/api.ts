import { config, getApiUrl } from './config';
import { handleError, handleNetworkError, isRetryableError } from './errorHandler';

// Función para obtener el token de autenticación
async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  
  try {
    // Buscar el token en localStorage
    const nextAuthKey = Object.keys(localStorage).find(key => key.includes('nextauth'));
    
    if (nextAuthKey) {
      const data = JSON.parse(localStorage.getItem(nextAuthKey) || '{}');
      
      // Buscar el token en la estructura correcta de NextAuth
      const token = data.data?.accessToken || data.accessToken || null;
      return token;
    }
  } catch (err) {
    // Error silencioso para evitar logs innecesarios en producción
  }
  return null;
}

// Función para obtener el token de la sesión de NextAuth
async function getSessionToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  
  try {
    // Importar dinámicamente para evitar problemas de SSR
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    return (session as any)?.accessToken || null;
  } catch (err) {
    // Error silencioso para evitar logs innecesarios en producción
    return null;
  }
}

// Función para renovar el token usando el refresh token
async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  
  try {
    // Obtener el refresh token del localStorage
    const nextAuthKey = Object.keys(localStorage).find(key => key.includes('nextauth'));
    if (nextAuthKey) {
      const data = JSON.parse(localStorage.getItem(nextAuthKey) || '{}');
      const refreshToken = data.data?.refreshToken || data.refreshToken;
      
      if (refreshToken) {
        const response = await fetch(getApiUrl('/auth/refresh'), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        if (response.ok) {
          const tokenData = await response.json();
          
          // Actualizar el token en localStorage
          const currentData = JSON.parse(localStorage.getItem(nextAuthKey) || '{}');
          currentData.data = {
            ...currentData.data,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            accessTokenExpires: Date.now() + (tokenData.expires_in * 1000),
          };
          localStorage.setItem(nextAuthKey, JSON.stringify(currentData));
          
          return tokenData.access_token;
        }
      }
    }
  } catch (err) {
    // Error silencioso para evitar logs innecesarios en producción
  }
  return null;
}

// Función para manejar errores de API de forma consistente
function handleApiError(response: Response, errorData?: any): Error {
  let errorMsg = `Error ${response.status}`;
  
  if (errorData) {
    errorMsg = errorData?.error || errorData?.message || errorMsg;
    
    // Agregar detalles específicos según el tipo de error
    if (response.status === 401) {
      errorMsg = "Sesión expirada. Por favor, inicia sesión nuevamente.";
    } else if (response.status === 403) {
      errorMsg = "No tienes permisos para realizar esta acción.";
    } else if (response.status === 404) {
      errorMsg = "Recurso no encontrado.";
    } else if (response.status === 429) {
      errorMsg = "Demasiadas solicitudes. Intenta de nuevo en unos minutos.";
    } else if (response.status >= 500) {
      errorMsg = "Error del servidor. Intenta de nuevo más tarde.";
    }
  }
  
  // Usar el sistema centralizado de manejo de errores
  const error = new Error(errorMsg);
  handleError(error, `API Error ${response.status}`, {
    showNotification: true,
    logToConsole: true,
    retryable: isRetryableError({ status: response.status }),
  });
  
  return error;
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { authToken?: string }
): Promise<T> {
  const { authToken, ...fetchOptions } = options || {};
  
  try {
    // Obtener token automáticamente si no se proporciona uno
    let token = authToken;
    if (!token) {
      // Intentar obtener el token de la sesión primero, luego del localStorage
      const sessionToken = await getSessionToken();
      const authTokenResult = await getAuthToken();
      token = sessionToken || authTokenResult || undefined;
    }

    const res = await fetch(getApiUrl(endpoint), {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
      },
    });
    
    // Si el token expiró, intentar renovarlo y repetir la petición
    if (res.status === 401 && token) {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        const retryRes = await fetch(getApiUrl(endpoint), {
          ...fetchOptions,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
            ...fetchOptions.headers,
          },
        });
        
        if (!retryRes.ok) {
          let errorData;
          try {
            errorData = await retryRes.json();
          } catch {}
          throw handleApiError(retryRes, errorData);
        }
        return retryRes.json();
      }
    }
    
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {}
      throw handleApiError(res, errorData);
    }
    return res.json();
  } catch (error) {
    // Manejar errores de red y otros errores
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw handleNetworkError(error, getApiUrl(endpoint), {
        showNotification: true,
        logToConsole: true,
        retryable: true,
      });
    }
    
    // Re-lanzar errores ya manejados
    throw error;
  }
}

// Función para sincronizar tokens con localStorage
export const syncTokensWithLocalStorage = (session: any) => {
  if (typeof window === "undefined") return;
  
  try {
    const nextAuthKey = Object.keys(localStorage).find(key => key.includes('nextauth'));
    if (nextAuthKey && session) {
      const currentData = JSON.parse(localStorage.getItem(nextAuthKey) || '{}');
      currentData.data = {
        ...currentData.data,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        accessTokenExpires: session.accessTokenExpires,
      };
      localStorage.setItem(nextAuthKey, JSON.stringify(currentData));
    }
  } catch (err) {
    // Error silencioso para evitar logs innecesarios en producción
  }
}; 