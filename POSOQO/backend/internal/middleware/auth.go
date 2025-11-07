package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/golang-jwt/jwt/v5"
	"github.com/posoqo/backend/internal/models"
	"github.com/posoqo/backend/internal/utils"
)

// Configuración de rate limiting por IP
// Aumentado a 100 req/min para endpoints generales (apropiado para producción)
var GeneralRateLimiter = limiter.New(limiter.Config{
	Max:        100,             // Máximo 100 requests por minuto
	Expiration: 1 * time.Minute, // Por minuto
	KeyGenerator: func(c *fiber.Ctx) string {
		return c.IP() // Rate limit por IP
	},
	LimitReached: func(c *fiber.Ctx) error {
		return c.Status(429).JSON(fiber.Map{
			"error": "Demasiadas solicitudes. Intenta de nuevo en 1 minuto.",
		})
	},
})

// Rate limiter específico para autenticación (menos restrictivo para permitir verificación de email)
var AuthRateLimiter = limiter.New(limiter.Config{
	Max:        20,               // Máximo 20 intentos (aumentado para permitir verificación)
	Expiration: 15 * time.Minute, // Por 15 minutos
	KeyGenerator: func(c *fiber.Ctx) string {
		return c.IP() + ":" + c.Path() // Rate limit por IP + endpoint
	},
	LimitReached: func(c *fiber.Ctx) error {
		return c.Status(429).JSON(fiber.Map{
			"error": "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
		})
	},
})

// GetCorsConfig retorna la configuración de CORS
// Se llama como función para asegurar que las variables de entorno estén disponibles
func GetCorsConfig() cors.Config {
	return cors.Config{
		AllowOriginsFunc: func(origin string) bool {
			return isOriginAllowed(origin)
		},
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Requested-With,Access-Control-Allow-Origin,X-CSRF-Token",
		AllowCredentials: true,
		ExposeHeaders:    "Content-Length,Authorization",
		MaxAge:           86400, // 24 horas
	}
}

// CorsConfig mantiene compatibilidad hacia atrás (deprecated, usar GetCorsConfig)
var CorsConfig = cors.Config{
	AllowOriginsFunc: func(origin string) bool {
		return isOriginAllowed(origin)
	},
	AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD",
	AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Requested-With,Access-Control-Allow-Origin,X-CSRF-Token",
	AllowCredentials: true,
	ExposeHeaders:    "Content-Length,Authorization",
	MaxAge:           86400, // 24 horas
}

// isOriginAllowed verifica si un origin está permitido
func isOriginAllowed(origin string) bool {
	// Permitir requests sin origin (por ejemplo, Postman, curl, aplicaciones móviles)
	if origin == "" {
		return true
	}

	// Obtener origins permitidos
	allowedOrigins := getAllowedOrigins()

	// Verificar cada origin permitido
	for _, allowed := range allowedOrigins {
		// Coincidencia exacta
		if origin == allowed {
			return true
		}

		// Soporte para wildcards (ej: *.vercel.app)
		if strings.Contains(allowed, "*") {
			// Patrón: "https://*.vercel.app" debe coincidir con "https://posoqo.vercel.app"
			if strings.HasPrefix(allowed, "https://*.") {
				// Extraer el dominio después del wildcard (ej: "vercel.app")
				domain := strings.TrimPrefix(allowed, "https://*.")
				// Verificar que el origin termine con ".dominio" y empiece con "https://"
				// Ejemplo: origin="https://posoqo.vercel.app", domain="vercel.app"
				// Debe cumplir: termina con ".vercel.app" Y empieza con "https://"
				if strings.HasSuffix(origin, "."+domain) && strings.HasPrefix(origin, "https://") {
					return true
				}
			} else if strings.HasPrefix(allowed, "http://*.") {
				// Patrón: "http://*.dominio.com"
				domain := strings.TrimPrefix(allowed, "http://*.")
				if strings.HasSuffix(origin, "."+domain) && strings.HasPrefix(origin, "http://") {
					return true
				}
			}
		}
	}

	return false
}

// getAllowedOrigins retorna la lista de origins permitidos
func getAllowedOrigins() []string {
	customOrigins := os.Getenv("CORS_ORIGINS")
	if customOrigins != "" {
		// Dividir por comas y limpiar espacios
		origins := strings.Split(customOrigins, ",")
		for i := range origins {
			origins[i] = strings.TrimSpace(origins[i])
		}
		log.Printf("[CORS] Usando origins personalizados de CORS_ORIGINS: %v", origins)
		return origins
	}

	env := os.Getenv("NODE_ENV")

	// Si estamos en Render (detectado por RENDER=true o NODE_ENV=production)
	// o si no hay NODE_ENV configurado pero estamos en un entorno de producción
	isRender := os.Getenv("RENDER") == "true" || env == "production"

	// Origins para desarrollo
	if !isRender && env != "production" {
		return []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://localhost:3001",
			"http://localhost:3002",
		}
	}

	// Origins para producción (Render o producción)
	// Por defecto permite posoqo.vercel.app y cualquier subdominio de vercel.app
	return []string{
		"https://posoqo.vercel.app",
		"https://*.vercel.app", // Soporte para cualquier subdominio de vercel
	}
}

// Middleware de autenticación mejorado
func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Obtener el token del header Authorization
		authHeader := c.Get("Authorization")

		if authHeader == "" {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token de autorización requerido",
			})
		}

		// Verificar formato "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")

		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Formato de token inválido",
			})
		}

		tokenString := tokenParts[1]

		// Obtener secret de variable de entorno
		accessSecret := os.Getenv("JWT_ACCESS_SECRET")

		if accessSecret == "" {
			accessSecret = "your-super-secret-access-key-change-in-production" // Fallback para desarrollo
		}

		// Parsear y validar el token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verificar el método de firma
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
			}
			return []byte(accessSecret), nil
		})

		if err != nil {
			// Manejar diferentes tipos de errores de token
			if strings.Contains(err.Error(), "expired") {
				return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
					"error": "Token expirado",
					"code":  "TOKEN_EXPIRED",
				})
			} else if strings.Contains(err.Error(), "signature") {
				return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
					"error": "Token inválido",
					"code":  "INVALID_TOKEN",
				})
			} else {
				return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
					"error": "Token inválido",
					"code":  "INVALID_TOKEN",
				})
			}
		}

		if !token.Valid {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token inválido",
				"code":  "INVALID_TOKEN",
			})
		}

		// Verificar que sea un access token
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Claims inválidos",
				"code":  "INVALID_CLAIMS",
			})
		}

		// Verificar tipo de token
		if claims["type"] != "access" {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Tipo de token inválido",
				"code":  "WRONG_TOKEN_TYPE",
			})
		}

		// Verificar expiración
		exp, ok := claims["exp"].(float64)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token sin expiración",
				"code":  "NO_EXPIRATION",
			})
		}

		if time.Now().Unix() > int64(exp) {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token expirado",
				"code":  "TOKEN_EXPIRED",
			})
		}

		// Guardar claims en el contexto para uso posterior
		c.Locals("user", claims)

		return c.Next()
	}
}

// Middleware para roles específicos
func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Verificar que el usuario esté autenticado
		userInterface := c.Locals("user")
		if userInterface == nil {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Usuario no autenticado",
			})
		}

		user, ok := userInterface.(jwt.MapClaims)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Datos de usuario inválidos",
			})
		}

		userRole, ok := user["role"].(string)
		if !ok || userRole == "" {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"error": "Rol de usuario no encontrado",
			})
		}

		// Verificar si el usuario tiene uno de los roles requeridos
		for _, role := range roles {
			if userRole == role {
				return c.Next()
			}
		}

		// Log de intento de acceso no autorizado
		userID := user["id"]
		log.Printf("[SECURITY] Intento de acceso no autorizado - UserID: %v, Role: %s, Required: %v, Path: %s",
			userID, userRole, roles, c.Path())

		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"error": "Acceso denegado. Rol insuficiente.",
		})
	}
}

// Middleware para logging de seguridad
func SecurityLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Log de la solicitud
		start := time.Now()

		// Continuar con la siguiente función
		err := c.Next()

		// Log después de procesar la solicitud
		duration := time.Since(start)

		// Log de seguridad para endpoints sensibles
		if strings.Contains(c.Path(), "/api/login") ||
			strings.Contains(c.Path(), "/api/register") ||
			strings.Contains(c.Path(), "/api/admin") {

			status := c.Response().StatusCode()
			ip := c.IP()
			userAgent := c.Get("User-Agent")
			method := c.Method()
			path := c.Path()

			// Log con formato estructurado
			fmt.Printf("[SECURITY] %s %s | IP: %s | User-Agent: %s | Status: %d | Duration: %v\n",
				method, path, ip, userAgent, status, duration)
		}

		return err
	}
}

// Middleware para headers de seguridad
func SecurityHeaders() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Headers de seguridad básicos
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		// Content Security Policy
		csp := "default-src 'self'; " +
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
			"font-src 'self' https://fonts.gstatic.com; " +
			"img-src 'self' data: https: blob:; " +
			"connect-src 'self' https://api.stripe.com https://*.cloudinary.com https://*.googleapis.com; " +
			"frame-src https://js.stripe.com https://hooks.stripe.com; " +
			"object-src 'none'; " +
			"base-uri 'self'; " +
			"form-action 'self'; " +
			"frame-ancestors 'none'; " +
			"upgrade-insecure-requests;"
		c.Set("Content-Security-Policy", csp)

		// HSTS para HTTPS
		if c.Protocol() == "https" {
			c.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}

		return c.Next()
	}
}

// Middleware para validación de CSRF completo
func CSRFProtection() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Solo aplicar a métodos que modifican datos
		if c.Method() == "GET" || c.Method() == "HEAD" || c.Method() == "OPTIONS" {
			return c.Next()
		}

		// Obtener token CSRF del header
		csrfToken := c.Get("X-CSRF-Token")
		if csrfToken == "" {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"error": "Token CSRF requerido",
				"code":  "CSRF_TOKEN_MISSING",
			})
		}

		// Obtener información del usuario si está autenticado
		var userID *int64
		if userInterface := c.Locals("user"); userInterface != nil {
			if claims, ok := userInterface.(jwt.MapClaims); ok {
				if id, ok := claims["id"].(float64); ok {
					uid := int64(id)
					userID = &uid
				}
			}
		}

		// Validar token CSRF
		valid, err := models.ValidateCSRFToken(c.Context(), csrfToken, userID, c.IP())
		if err != nil || !valid {
			log.Printf("[SECURITY] CSRF token inválido - IP: %s, UserID: %v", c.IP(), userID)
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"error": "Token CSRF inválido o expirado",
				"code":  "CSRF_TOKEN_INVALID",
			})
		}

		return c.Next()
	}
}

// GenerateCSRFTokenHandler genera un token CSRF para el cliente
func GenerateCSRFTokenHandler(c *fiber.Ctx) error {
	// Generar token CSRF
	token, err := utils.GenerateCSRFToken()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error generando token CSRF",
		})
	}

	// Obtener información del usuario si está autenticado
	var userID *int64
	if userInterface := c.Locals("user"); userInterface != nil {
		if claims, ok := userInterface.(jwt.MapClaims); ok {
			if id, ok := claims["id"].(float64); ok {
				uid := int64(id)
				userID = &uid
			}
		}
	}

	// Crear token CSRF en la base de datos
	csrfToken := &models.CSRFToken{
		Token:     token,
		UserID:    userID,
		IPAddress: c.IP(),
		ExpiresAt: time.Now().Add(utils.CSRFTokenExpiry),
		Used:      false,
	}

	if err := models.CreateCSRFToken(c.Context(), csrfToken); err != nil {
		log.Printf("[ERROR] Error creando token CSRF: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error guardando token CSRF",
		})
	}

	return c.JSON(fiber.Map{
		"csrf_token": token,
		"expires_at": csrfToken.ExpiresAt,
	})
}
