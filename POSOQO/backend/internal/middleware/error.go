package middleware

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

func ErrorHandler() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Ejecutar el siguiente handler y capturar errores
		err := c.Next()
		if err != nil {
			// Loguear el error (puedes mejorar esto con logs estructurados)
			log.Printf("[ERROR] %v", err)

			// Determinar código y mensaje
			code := fiber.StatusInternalServerError
			msg := "Error interno, intenta más tarde"
			errCode := "INTERNAL_ERROR"

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
				}
			}

			return c.Status(code).JSON(fiber.Map{
				"error": msg,
				"code":  errCode,
			})
		}
		return nil
	}
}
