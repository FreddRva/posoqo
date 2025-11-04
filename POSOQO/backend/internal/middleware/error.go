package middleware

import (
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func ErrorHandler() fiber.Handler {
	isProduction := os.Getenv("NODE_ENV") == "production"
	
	return func(c *fiber.Ctx) error {
		// Ejecutar el siguiente handler y capturar errores
		err := c.Next()
		if err != nil {
			// Loguear el error completo en el servidor (solo para debugging)
			log.Printf("[ERROR] %s %s - %v", c.Method(), c.Path(), err)

			// Determinar código y mensaje
			code := fiber.StatusInternalServerError
			msg := "Error interno, intenta más tarde"
			errCode := "INTERNAL_ERROR"
			details := ""

			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
				msg = e.Message
				// Mapear algunos códigos comunes
				switch code {
				case fiber.StatusUnauthorized:
					errCode = "UNAUTHORIZED"
				case fiber.StatusForbidden:
					errCode = "FORBIDDEN"
				case fiber.StatusNotFound:
					errCode = "NOT_FOUND"
				case fiber.StatusBadRequest:
					errCode = "BAD_REQUEST"
				case fiber.StatusRequestTimeout:
					errCode = "TIMEOUT"
					msg = "La solicitud tardó demasiado tiempo"
				case fiber.StatusServiceUnavailable:
					errCode = "SERVICE_UNAVAILABLE"
					msg = "Servicio temporalmente no disponible"
				}
			}

			// En desarrollo, incluir detalles del error
			if !isProduction {
				// Solo incluir detalles seguros en desarrollo
				if strings.Contains(err.Error(), "database") || 
				   strings.Contains(err.Error(), "timeout") ||
				   strings.Contains(err.Error(), "connection") {
					details = err.Error()
				}
			}

			response := fiber.Map{
				"error": msg,
				"code":  errCode,
			}

			// Solo agregar detalles en desarrollo
			if details != "" && !isProduction {
				response["details"] = details
			}

			return c.Status(code).JSON(response)
		}
		return nil
	}
}
