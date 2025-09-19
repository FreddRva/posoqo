package middleware

import (
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// CorsConfig configura CORS para permitir requests desde el frontend
var CorsConfig = cors.Config{
	AllowOrigins: "*", // Permitir todos los orígenes por ahora
	AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	AllowHeaders: "Origin,Content-Type,Accept,Authorization,X-Requested-With",
	AllowCredentials: false, // Cambiado a false para permitir AllowOrigins: "*"
}

// CorsConfigProduction configura CORS para producción con dominios específicos
var CorsConfigProduction = cors.Config{
	AllowOrigins: "https://posoqo.vercel.app,https://posoqo-frontend.vercel.app,http://localhost:3000,http://localhost:3001",
	AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	AllowHeaders: "Origin,Content-Type,Accept,Authorization,X-Requested-With",
	AllowCredentials: true,
}
