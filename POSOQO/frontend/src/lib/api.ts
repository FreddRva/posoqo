const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Función para construir URL de imagen
export const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/file.svg';
  
  // Si ya es una URL completa (Cloudinary), devolverla tal como está
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Si es una ruta local, construir la URL completa
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${imageUrl}`;
};

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
    console.error('Error obteniendo token de autenticación:', err);
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
    console.error('Error obteniendo token de sesión:', err);
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
        const response = await fetch(`${API_URL}/auth/refresh`, {
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
    console.error('Error renovando token:', err);
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
  
  return new Error(errorMsg);
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { authToken?: string }
): Promise<T> {
  const { authToken, ...fetchOptions } = options || {};
  
  // Obtener token automáticamente si no se proporciona uno
  let token = authToken;
  if (!token) {
    // Intentar obtener el token de la sesión primero, luego del localStorage
    const sessionToken = await getSessionToken();
    const authTokenResult = await getAuthToken();
    token = sessionToken || authTokenResult || undefined;
  }

  // DEBUG: Log básico (sin datos sensibles)
  console.log("🔍 [API] Endpoint:", endpoint);
  console.log("🔍 [API] Token:", token ? "PRESENTE" : "NO TOKEN");
  console.log("🔍 [API] URL completa:", `${API_URL}${endpoint}`);

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });

  // DEBUG: Log de la respuesta del servidor
  console.log("🔍 [API] Status:", res.status);
  console.log("🔍 [API] Status Text:", res.statusText);
  
  // Si el token expiró, intentar renovarlo y repetir la petición
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      const retryRes = await fetch(`${API_URL}${endpoint}`, {
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
    console.error('Error sincronizando tokens:', err);
  }
}; 