// Tipos para autenticación
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified?: boolean;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  message: string;
  user: {
    name: string;
    email: string;
  };
}

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Clase para manejar autenticación
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    // Cargar tokens desde localStorage al inicializar
    this.loadTokens();
  }

  // Cargar tokens desde localStorage
  private loadTokens(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
      const expiry = localStorage.getItem('token_expiry');
      this.tokenExpiry = expiry ? parseInt(expiry) : null;
    }
  }

  // Guardar tokens en localStorage
  private saveTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      localStorage.setItem('token_expiry', (Date.now() + tokens.expires_in * 1000).toString());
      
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      this.tokenExpiry = Date.now() + tokens.expires_in * 1000;
    }
  }

  // Limpiar tokens
  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
      
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
    }
  }

  // Verificar si el token está expirado
  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    return Date.now() >= this.tokenExpiry;
  }

  // Obtener headers de autorización
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken && !this.isTokenExpired()) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Función para hacer requests con manejo automático de refresh
  private async makeAuthenticatedRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    // Si el token está expirado, intentar refresh
    if (this.isTokenExpired() && this.refreshToken) {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        // Si falla el refresh, limpiar tokens y redirigir al login
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
    }

    // Hacer la request con el token actualizado
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    // Si recibimos 401, intentar refresh una vez más
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        // Reintentar la request original
        return await fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        });
      } catch (error) {
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
    }

    return response;
  }

  // Refresh del access token
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al renovar el token');
    }

    const data = await response.json();
    this.saveTokens(data.tokens);
  }

  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en el login');
    }

    const data: LoginResponse = await response.json();
    this.saveTokens(data.tokens);
    return data;
  }

  // Registro
  async register(userData: {
    name: string;
    lastName: string;
    dni: string;
    phone: string;
    email: string;
    password: string;
  }): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        last_name: userData.lastName,
        dni: userData.dni,
        phone: userData.phone,
        email: userData.email,
        password: userData.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en el registro');
    }

    return await response.json();
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.makeAuthenticatedRequest(`${API_BASE_URL}/logout`, {
        method: 'POST',
      });
    } catch (error) {
      // Continuar con el logout local incluso si falla la request
    } finally {
      this.clearTokens();
    }
  }

  // Obtener perfil del usuario
  async getProfile(): Promise<User> {
    const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/profile`);
    
    if (!response.ok) {
      throw new Error('Error al obtener perfil');
    }

    return await response.json();
  }

  // Verificar email
  async verifyEmail(token: string): Promise<{ message: string; email: string }> {
    const response = await fetch(`${API_BASE_URL}/verify-email?token=${token}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al verificar email');
    }

    return await response.json();
  }

  // Reenviar email de verificación
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al reenviar email');
    }

    return await response.json();
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!(this.accessToken && !this.isTokenExpired());
  }

  // Obtener el token actual
  getAccessToken(): string | null {
    return this.isTokenExpired() ? null : this.accessToken;
  }

  // Función helper para requests autenticadas
  async authenticatedRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await this.makeAuthenticatedRequest(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la request');
    }

    return await response.json();
  }
}

// Instancia global del servicio de autenticación
export const authService = new AuthService();

// Hook personalizado para usar autenticación en componentes
export const useAuth = () => {
  return {
    login: authService.login.bind(authService),
    register: authService.register.bind(authService),
    logout: authService.logout.bind(authService),
    getProfile: authService.getProfile.bind(authService),
    verifyEmail: authService.verifyEmail.bind(authService),
    resendVerificationEmail: authService.resendVerificationEmail.bind(authService),
    isAuthenticated: authService.isAuthenticated.bind(authService),
    getAccessToken: authService.getAccessToken.bind(authService),
    authenticatedRequest: authService.authenticatedRequest.bind(authService),
  };
}; 