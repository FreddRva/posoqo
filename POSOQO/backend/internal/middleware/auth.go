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
)

// Configuración de rate limiting por IP
var GeneralRateLimiter = limiter.New(limiter.Config{
	Max:        10,              // Máximo 10 requests
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

// Rate limiter específico para autenticación (más restrictivo)
var AuthRateLimiter = limiter.New(limiter.Config{
	Max:        5,                // Máximo 5 intentos
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

// CORS configurado para producción
var CorsConfig = cors.Config{
	AllowOrigins:     "http://localhost:3000,http://127.0.0.1:3000,https://posoqo.com,https://posoqo.vercel.app,https://posoqo-frontend.vercel.app,https://*.vercel.app", // Dominios permitidos
	AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
	AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Requested-With",
	AllowCredentials: true,
	ExposeHeaders:    "Content-Length",
	MaxAge:           86400, // 24 horas
}

// Middleware de autenticación mejorado
func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		log.Printf("🔐 [AUTH] AuthMiddleware - Verificando autenticación para: %s %s", c.Method(), c.Path())
		log.Printf("🔐 [AUTH] AuthMiddleware - Headers: %v", c.GetReqHeaders())

		// Obtener el token del header Authorization
		authHeader := c.Get("Authorization")
		log.Printf("🔐 [AUTH] AuthMiddleware - Authorization header: %s", authHeader)

		if authHeader == "" {
			log.Printf("🔐 [AUTH] AuthMiddleware - Error: Token de autorización requerido")
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
			fmt.Println("[AuthMiddleware] Token inválido")
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
			fmt.Println("[AuthMiddleware] Token sin expiración")
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token sin expiración",
				"code":  "NO_EXPIRATION",
			})
		}

		if time.Now().Unix() > int64(exp) {
			fmt.Println("[AuthMiddleware] Token expirado")
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
		user := c.Locals("user").(jwt.MapClaims)
		userRole, ok := user["role"].(string)

		if !ok {
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
		// Headers de seguridad
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		// HSTS para HTTPS
		if c.Protocol() == "https" {
			c.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}

		return c.Next()
	}
}

// Middleware para validación de CSRF (simplificado)
func CSRFProtection() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Solo aplicar a métodos que modifican datos
		if c.Method() == "GET" || c.Method() == "HEAD" || c.Method() == "OPTIONS" {
			return c.Next()
		}

		// Verificar header CSRF
		csrfToken := c.Get("X-CSRF-Token")
		if csrfToken == "" {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"error": "Token CSRF requerido",
			})
		}

		// Aquí se validaría el token CSRF contra la sesión
		// Por simplicidad, solo verificamos que exista

		return c.Next()
	}
}
