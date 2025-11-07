import { config, getApiUrl } from './config';
import { handleError, handleNetworkError, isRetryableError } from './errorHandler';

// Función para validar si un token está expirado
function isTokenExpired(expiryTimestamp?: number): boolean {
  if (!expiryTimestamp) return true;
  return Date.now() >= expiryTimestamp;
}

// Variable para almacenar el token CSRF
let csrfToken: string | null = null;
let csrfTokenExpiry: number = 0;

// Función para obtener el token CSRF
async function getCSRFToken(): Promise<string | null> {
  // Si el token existe y no ha expirado, retornarlo
  if (csrfToken && Date.now() < csrfTokenExpiry) {
    return csrfToken;
  }

  // Si no hay token o expiró, obtener uno nuevo
  try {
    const response = await fetch(getApiUrl('/csrf-token'), {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrf_token;
      // El token expira en 24 horas, pero renovarlo cada 12 horas para estar seguro
      csrfTokenExpiry = new Date(data.expires_at).getTime();
      return csrfToken;
    }
  } catch (error) {
    console.error('Error obteniendo token CSRF:', error);
  }

  return null;
}

// Función para obtener el token de autenticación de forma segura
async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  
  try {
    // Primero intentar con nuestra key separada
    const tokenKey = 'posoqo.auth.tokens';
    const tokenDataStr = localStorage.getItem(tokenKey);
    
    if (tokenDataStr) {
      try {
        const tokenData = JSON.parse(tokenDataStr);
        const token = tokenData.accessToken || null;
        const expiry = tokenData.accessTokenExpires;
        
        if (token && !isTokenExpired(expiry)) {
          return token;
        }
      } catch (err) {
        // Error silencioso
      }
    }
    
    // Si no encontramos en nuestra key, buscar en keys de nextauth (fallback)
    const allNextAuthKeys = Object.keys(localStorage).filter(key => key.includes('nextauth'));
    
    for (const nextAuthKey of allNextAuthKeys) {
      try {
        const data = JSON.parse(localStorage.getItem(nextAuthKey) || '{}');
        const token = data.data?.data?.accessToken || data.data?.accessToken || data.accessToken || null;
        const expiry = data.data?.data?.accessTokenExpires || data.data?.accessTokenExpires || data.accessTokenExpires;
        
        if (token && !isTokenExpired(expiry)) {
          return token;
        }
      } catch (err) {
        // Error silencioso
      }
    }
    
    return null;
  } catch (err) {
    // Limpiar datos corruptos
    if (err instanceof SyntaxError) {
      try {
        const nextAuthKey = Object.keys(localStorage).find(key => key.includes('nextauth'));
        if (nextAuthKey) {
          localStorage.removeItem(nextAuthKey);
        }
      } catch {}
    }
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
    return null;
  }
}

// Función auxiliar para agregar headers necesarios (Auth + CSRF)
async function getRequestHeaders(includeCSRF: boolean = true): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Agregar token de autenticación
  const authToken = await getAuthToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Agregar token CSRF solo para métodos que modifican datos
  if (includeCSRF) {
    const csrf = await getCSRFToken();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
  }

  return headers;
}

// Función para renovar el token usando el refresh token
async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  
  try {
    // Primero intentar usar NextAuth para refrescar (más confiable)
    try {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      
      if (session && (session as any).refreshToken) {
        const response = await fetch(getApiUrl('/auth/refresh'), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: (session as any).refreshToken }),
        });
        
        if (response.ok) {
          const tokenData = await response.json();
          const accessToken = tokenData.tokens?.access_token || tokenData.access_token;
          const refreshToken = tokenData.tokens?.refresh_token || tokenData.refresh_token;
          const expiresIn = tokenData.tokens?.expires_in || tokenData.expires_in || 900;
          
          if (!accessToken) {
            if (process.env.NODE_ENV === 'development') {
              console.error('No se recibió access_token en la respuesta de refresh');
            }
            return null;
          }
          
          // Actualizar localStorage primero
          const nextAuthKey = Object.keys(localStorage).find(key => key.includes('nextauth'));
          if (nextAuthKey) {
            try {
              const currentData = JSON.parse(localStorage.getItem(nextAuthKey) || '{}');
              currentData.data = {
                ...currentData.data,
                accessToken: accessToken,
                refreshToken: refreshToken || (session as any).refreshToken,
                accessTokenExpires: Date.now() + (expiresIn * 1000),
              };
              localStorage.setItem(nextAuthKey, JSON.stringify(currentData));
            } catch (err) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error actualizando NextAuth localStorage:', err);
              }
            }
          }
          
          // También guardar en nuestra key personalizada
          try {
            localStorage.setItem('posoqo.auth.tokens', JSON.stringify({
              accessToken: accessToken,
              refreshToken: refreshToken || (session as any).refreshToken,
              accessTokenExpires: Date.now() + (expiresIn * 1000),
            }));
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error guardando tokens en localStorage:', err);
            }
          }
          
          // Forzar actualización de la sesión de NextAuth
          // NextAuth actualizará automáticamente la sesión en el próximo render
          // No necesitamos hacer nada adicional aquí ya que los tokens están guardados en localStorage
          
          return accessToken;
        } else {
          // Si el refresh falla, verificar el error
          const errorData = await response.json().catch(() => ({}));
          if (process.env.NODE_ENV === 'development') {
            console.error('Error refrescando token:', errorData);
          }
        }
      }
    } catch (nextAuthError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error refrescando con NextAuth:', nextAuthError);
      }
    }
    
    // Fallback: Intentar con localStorage
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
            accessToken: tokenData.tokens?.access_token || tokenData.access_token,
            refreshToken: tokenData.tokens?.refresh_token || tokenData.refresh_token,
            accessTokenExpires: Date.now() + ((tokenData.tokens?.expires_in || tokenData.expires_in || 900) * 1000),
          };
          localStorage.setItem(nextAuthKey, JSON.stringify(currentData));
          
          // Guardar también en nuestra key personalizada
          localStorage.setItem('posoqo.auth.tokens', JSON.stringify({
            accessToken: tokenData.tokens?.access_token || tokenData.access_token,
            refreshToken: tokenData.tokens?.refresh_token || tokenData.refresh_token,
            accessTokenExpires: Date.now() + ((tokenData.tokens?.expires_in || tokenData.expires_in || 900) * 1000),
          }));
          
          return tokenData.tokens?.access_token || tokenData.access_token;
        } else {
          // Si el refresh falla, limpiar tokens
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error === 'Refresh token expirado' || errorData.error === 'Refresh token inválido') {
            // Limpiar tokens expirados
            localStorage.removeItem(nextAuthKey);
            localStorage.removeItem('posoqo.auth.tokens');
            // Redirigir al login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error refrescando token:', err);
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
      // Si es error de CSRF, intentar obtener nuevo token y retry
      if (errorData?.code === 'CSRF_TOKEN_MISSING' || errorData?.code === 'CSRF_TOKEN_INVALID') {
        // Invalidar token CSRF actual
        csrfToken = null;
        csrfTokenExpiry = 0;
        errorMsg = "Token de seguridad expirado. Intenta de nuevo.";
      } else {
        errorMsg = "No tienes permisos para realizar esta acción.";
      }
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
    
    // Si no hay token pero el endpoint requiere autenticación, intentar refrescar primero
    if (!token && (endpoint.startsWith('/protected/') || endpoint.startsWith('/admin/'))) {
      // Intentar obtener token refrescado
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        token = refreshedToken;
      }
    }

    // Validar que el endpoint no esté vacío
    if (!endpoint || endpoint.trim() === '') {
      throw new Error('Endpoint no puede estar vacío');
    }

    // Validar que la URL sea segura
    const apiUrl = getApiUrl(endpoint);
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      throw new Error('URL de API inválida');
    }

    // Crear timeout para evitar requests colgados (30 segundos)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    // Usar el signal del usuario si existe, sino usar el nuestro
    const signal = fetchOptions.signal || controller.signal;
    
    let res: Response;
    try {
      // Determinar si necesita CSRF (POST, PUT, DELETE, PATCH modifican datos)
      const method = (fetchOptions.method || 'GET').toUpperCase();
      const needsCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
      
      // Obtener headers con CSRF si es necesario
      const baseHeaders = await getRequestHeaders(needsCSRF);
      const headers = {
        ...baseHeaders,
        ...fetchOptions.headers,
      };
      
      res = await fetch(apiUrl, {
        ...fetchOptions,
        headers,
        signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
    
    // Si hay error de CSRF, obtener nuevo token y retry
    if (res.status === 403) {
      try {
        const errorData = await res.clone().json();
        if (errorData?.code === 'CSRF_TOKEN_MISSING' || errorData?.code === 'CSRF_TOKEN_INVALID') {
          // Invalidar token CSRF y obtener uno nuevo
          csrfToken = null;
          csrfTokenExpiry = 0;
          const method = (fetchOptions.method || 'GET').toUpperCase();
          const needsCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
          
          if (needsCSRF) {
            const retryHeaders = await getRequestHeaders(true);
            const retryRes = await fetch(apiUrl, {
              ...fetchOptions,
              headers: {
                ...retryHeaders,
                ...fetchOptions.headers,
              },
              signal,
            });
            
            if (retryRes.ok || retryRes.status !== 403) {
              res = retryRes;
            }
          }
        }
      } catch (e) {
        // Continuar con el error original si no se puede parsear
      }
    }
    
    // Si el token expiró, intentar renovarlo y repetir la petición
    if (res.status === 401) {
      // Verificar si el error es realmente de token expirado
      let errorData;
      try {
        errorData = await res.clone().json();
      } catch {}
      
      // Solo intentar refresh si es error de token expirado o si tenemos un token
      const isTokenExpiredError = errorData?.code === 'TOKEN_EXPIRED' || 
                                   errorData?.error === 'Token expirado' ||
                                   errorData?.error === 'Token inválido';
      
      if (isTokenExpiredError || token) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[API] Token expirado, intentando refrescar...');
        }
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[API] Token refrescado exitosamente, reintentando request...');
          }
          // Obtener headers actualizados con el nuevo token
          const method = (fetchOptions.method || 'GET').toUpperCase();
          const needsCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
          const baseHeaders = await getRequestHeaders(needsCSRF);
          
          // Crear nuevo objeto de headers con el token actualizado
          const retryHeaders: HeadersInit = {
            ...(baseHeaders as Record<string, string>),
            'Authorization': `Bearer ${newToken}`,
            ...(fetchOptions.headers as Record<string, string> || {}),
          };
          
          const retryRes = await fetch(getApiUrl(endpoint), {
            ...fetchOptions,
            headers: retryHeaders,
            signal,
          });
          
          if (retryRes.ok) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[API] Request exitosa después del refresh');
            }
            return retryRes.json();
          } else {
            // Si aún falla después del refresh, puede ser otro error
            let retryErrorData;
            try {
              retryErrorData = await retryRes.json();
            } catch {}
            
            // Si es otro 401 después del refresh, el refresh token puede estar expirado
            if (retryRes.status === 401) {
              if (process.env.NODE_ENV === 'development') {
                console.error('[API] Refresh token también expirado, limpiando sesión...');
              }
              if (typeof window !== 'undefined') {
                // Limpiar tokens
                localStorage.removeItem('posoqo.auth.tokens');
                const nextAuthKey = Object.keys(localStorage).find(key => key.includes('nextauth'));
                if (nextAuthKey) {
                  localStorage.removeItem(nextAuthKey);
                }
                // Limpiar sesión de NextAuth
                const { signOut } = await import('next-auth/react');
                signOut({ redirect: false }).then(() => {
                  window.location.href = '/login?error=session_expired';
                });
                return Promise.reject(new Error('Sesión expirada. Por favor, inicia sesión nuevamente.'));
              }
            }
            
            throw handleApiError(retryRes, retryErrorData);
          }
        } else {
          // Si no se pudo refrescar, verificar si realmente es un error de sesión
          if (process.env.NODE_ENV === 'development') {
            console.error('[API] No se pudo refrescar el token');
          }
          
          // Solo redirigir si realmente es un error de autenticación
          if (isTokenExpiredError) {
            if (typeof window !== 'undefined') {
              // Limpiar tokens
              localStorage.removeItem('posoqo.auth.tokens');
              const nextAuthKey = Object.keys(localStorage).find(key => key.includes('nextauth'));
              if (nextAuthKey) {
                localStorage.removeItem(nextAuthKey);
              }
              // Limpiar sesión de NextAuth y redirigir
              const { signOut } = await import('next-auth/react');
              signOut({ redirect: false }).then(() => {
                setTimeout(() => {
                  window.location.href = '/login?error=session_expired';
                }, 1000);
              });
            }
          }
          
          throw handleApiError(res, errorData);
        }
      } else {
        // Si no es error de token expirado, lanzar el error normal
        throw handleApiError(res, errorData);
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