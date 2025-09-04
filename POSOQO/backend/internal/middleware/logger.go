package middleware

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
)

// LoggerConfig configuración del logger
type LoggerConfig struct {
	Format     string
	TimeFormat string
	Output     *os.File
}

// CustomLogger middleware para logging personalizado
func CustomLogger(config ...LoggerConfig) fiber.Handler {
	// Configuración por defecto
	cfg := LoggerConfig{
		Format:     "${time} | ${status} | ${latency} | ${method} | ${path} | ${ip} | ${user_agent}\n",
		TimeFormat: "2006-01-02 15:04:05",
	}

	// Aplicar configuración personalizada si se proporciona
	if len(config) > 0 {
		cfg = config[0]
	}

	return func(c *fiber.Ctx) error {
		// Tiempo de inicio
		start := time.Now()

		// Continuar con el siguiente middleware/handler
		err := c.Next()

		// Calcular latencia
		latency := time.Since(start)

		// Obtener información de la solicitud
		status := c.Response().StatusCode()
		method := c.Method()
		path := c.Path()
		ip := c.IP()
		userAgent := c.Get("User-Agent")

		// Formatear el log
		logEntry := fmt.Sprintf("%s | %d | %v | %s | %s | %s | %s\n",
			time.Now().Format(cfg.TimeFormat),
			status,
			latency,
			method,
			path,
			ip,
			userAgent,
		)

		// Escribir log
		if cfg.Output != nil {
			cfg.Output.WriteString(logEntry)
		} else {
			log.Print(logEntry)
		}

		// Log especial para errores
		if status >= 400 {
			log.Printf("❌ ERROR: %s %s - Status: %d - IP: %s", method, path, status, ip)
		}

		// Log especial para endpoints sensibles
		if isSensitiveEndpoint(path) {
			log.Printf("🔒 SENSITIVE: %s %s - Status: %d - IP: %s", method, path, status, ip)
		}

		return err
	}
}

// isSensitiveEndpoint verifica si el endpoint es sensible
func isSensitiveEndpoint(path string) bool {
	sensitivePaths := []string{
		"/api/auth/login",
		"/api/auth/register",
		"/api/admin",
		"/api/payments",
		"/api/orders",
		"/api/users",
	}
	
	for _, sensitivePath := range sensitivePaths {
		if path == sensitivePath || (len(path) > len(sensitivePath) && path[:len(sensitivePath)] == sensitivePath) {
			return true
		}
	}
	return false
}

// PerformanceLogger middleware para monitoreo de rendimiento
func PerformanceLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		
		err := c.Next()
		
		duration := time.Since(start)
		
		// Log de rendimiento para requests lentos
		if duration > 500*time.Millisecond {
			log.Printf("🐌 SLOW REQUEST: %s %s - Duration: %v", c.Method(), c.Path(), duration)
		}
		
		// Log de rendimiento para requests muy rápidos (cache hits)
		if duration < 10*time.Millisecond {
			log.Printf("⚡ FAST REQUEST: %s %s - Duration: %v", c.Method(), c.Path(), duration)
		}
		
		return err
	}
}

// ErrorLogger middleware para logging de errores
func ErrorLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		err := c.Next()
		
		// Log de errores
		if err != nil {
			log.Printf("💥 ERROR: %s %s - Error: %v", c.Method(), c.Path(), err)
		}
		
		// Log de status codes de error
		status := c.Response().StatusCode()
		if status >= 400 {
			log.Printf("🚨 HTTP ERROR: %s %s - Status: %d", c.Method(), c.Path(), status)
		}
		
		return err
	}
}
