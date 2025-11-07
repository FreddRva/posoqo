package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/swagger"
	_ "github.com/posoqo/backend/docs"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/handlers"
	"github.com/posoqo/backend/internal/middleware"
	"github.com/posoqo/backend/internal/migrations"
	"github.com/posoqo/backend/internal/services"
)

// @title POSOQO API
// @version 1.0
// @description API para el sistema POSOQO
// @host localhost:4000
// @BasePath /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// Configurar variables de entorno
	setupEnvironment()

	// Conectar a la base de datos
	if err := db.InitDB(); err != nil {
		log.Fatal("Error conectando a la base de datos:", err)
	}
	defer db.DB.Close()

	// Ejecutar migraciones automáticamente
	if err := migrations.RunMigrations(); err != nil {
		log.Printf("⚠️ Error ejecutando migraciones: %v", err)
		log.Println("⚠️ El servidor continuará, pero puede haber problemas con la base de datos")
	}

	// Inicializar Cloudinary
	if err := services.InitCloudinary(); err != nil {
		log.Printf("⚠️ Cloudinary no disponible (usando almacenamiento local): %v", err)
	}

	// Inicializar servicio de IA (Gemini)
	handlers.InitAIService()

	// Crear aplicación Fiber con configuración de seguridad
	app := fiber.New(fiber.Config{
		AppName:      "POSOQO API",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
		// No exponer información del servidor
		DisableStartupMessage: false,
		// Error handler personalizado
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}

			isProduction := os.Getenv("NODE_ENV") == "production"
			response := fiber.Map{
				"error": "Error interno del servidor",
				"code":  "INTERNAL_ERROR",
			}

			// Solo mostrar detalles en desarrollo
			if !isProduction {
				response["details"] = err.Error()
			}

			return c.Status(code).JSON(response)
		},
	})

	// Middleware global
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(middleware.SecurityHeaders())
	app.Use(middleware.SecurityLogger())
	app.Use(cors.New(middleware.CorsConfig))

	// Rate limiting global - habilitado en producción
	if os.Getenv("NODE_ENV") == "production" || os.Getenv("ENABLE_RATE_LIMIT") == "true" {
		app.Use(middleware.GeneralRateLimiter)
		log.Println(" Rate limiting global habilitado")
	}

	// Ruta raíz para manejar HEAD y GET requests
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "POSOQO API",
			"version": "1.0.0",
			"docs":    "/swagger/",
			"health":  "/health",
		})
	})
	app.Head("/", func(c *fiber.Ctx) error {
		return c.SendStatus(200)
	})

	// Rutas públicas
	api := app.Group("/api")

	// Rutas de autenticación con rate limiting específico
	auth := api.Group("/auth")
	auth.Use(middleware.AuthRateLimiter)
	auth.Post("/register", handlers.RegisterUser)
	auth.Post("/login", handlers.LoginUser)
	auth.Post("/refresh", handlers.RefreshToken)
	auth.Post("/social-login", handlers.SocialLogin)

	// Rutas de verificación de email (públicas, sin rate limiting estricto)
	api.Get("/verify-email", handlers.VerifyEmail)
	api.Post("/resend-verification", handlers.ResendVerificationEmail)

	// Ruta de contacto (pública)
	api.Post("/contact", handlers.ContactUs)

	// Ruta pública para crear reclamos (sin autenticación)
	api.Post("/complaints", handlers.CreateComplaint)

	// Ruta pública para consultar DNI
	api.Get("/dni/:dni", handlers.ConsultarDNI)

	// Ruta pública para suscripción al sorteo
	api.Post("/raffle/subscribe", handlers.SubscribeToRaffle)
	api.Get("/raffle/config", handlers.GetCurrentRaffleConfig)

	// Rutas de productos (públicas)
	api.Get("/products", handlers.GetProducts)
	api.Get("/products/featured", handlers.GetFeaturedProducts)
	api.Get("/products/:id", handlers.GetProduct)

	// Rutas de reseñas (públicas para leer, protegidas para escribir)
	api.Get("/products/:product_id/reviews", handlers.ListProductReviews)

	// Rutas de servicios (públicas)
	api.Get("/services", handlers.GetServices)
	api.Get("/services/:id", handlers.GetService)

	// Rutas de categorías (públicas)
	api.Get("/categories", handlers.ListCategories)
	api.Get("/categories/hierarchy", handlers.GetCategoriesWithSubcategories)

	// Rutas de categorías admin (protegidas - se manejan en el grupo admin más abajo)

	// Endpoint de geocoding (público) - funciones que no existen, comentadas
	// api.Get("/geocoding/search", handlers.SearchAddress)
	// api.Get("/geocoding/reverse", handlers.ReverseAddress)

	// Nuevos endpoints de geocoding para el mapa
	api.Post("/geocoding/search-location", handlers.SearchLocation)
	api.Post("/geocoding/reverse-geocoding", handlers.ReverseGeocoding)

	// Rutas de IA (públicas)
	ai := api.Group("/ai")
	ai.Get("/health", handlers.HealthCheckAI)
	ai.Get("/models", handlers.ListModelsHandler)
	ai.Post("/chatbot", handlers.ChatbotHandler)
	ai.Post("/recommend", handlers.RecommendProductsHandler)
	ai.Post("/search", handlers.SmartSearchHandler)
	ai.Post("/pairing", handlers.PairingAssistantHandler)
	ai.Post("/sentiment", handlers.AnalyzeSentimentHandler)

	// Rutas de IA protegidas (requiere autenticación)
	aiAdmin := api.Group("/ai/admin")
	aiAdmin.Use(middleware.AuthMiddleware())
	aiAdmin.Post("/generate-description", handlers.GenerateProductDescriptionHandler)
	aiAdmin.Get("/analytics", handlers.PredictiveAnalyticsHandler)

	// Endpoint de pago con Stripe
	api.Post("/pay", handlers.CreateStripeCheckout)
	api.Post("/create-payment-intent", middleware.AuthMiddleware(), handlers.CreateStripePaymentIntent)
	api.Post("/create-reservation-payment-intent", middleware.AuthMiddleware(), handlers.CreateReservationPaymentIntent)
	api.Post("/stripe/webhook", handlers.StripeWebhook)

	// Historial de pagos y reembolsos
	api.Get("/payments", handlers.GetPaymentHistory)
	api.Post("/payments/refund", handlers.CreateRefund)

	// Ruta de prueba para verificar conexión a base de datos (mover fuera del grupo /api)

	// Rutas de usuario (protegidas pero accesibles desde /api)
	api.Get("/profile", middleware.AuthMiddleware(), handlers.Profile)

	// Endpoint temporal para verificar tokens
	api.Get("/verify-token", handlers.VerifyToken)
	api.Put("/profile", middleware.AuthMiddleware(), handlers.UpdateProfile)
	api.Get("/profile/public", handlers.ProfilePublic)
	api.Post("/logout", middleware.AuthMiddleware(), handlers.Logout)

	// Rutas protegidas (requieren autenticación)
	protected := api.Group("/protected")
	protected.Use(middleware.AuthMiddleware())

	// Rutas de pedidos (protegidas)
	protected.Post("/orders", handlers.CreateOrder)
	protected.Get("/orders", handlers.ListMyOrders)

	// Rutas de reclamos (protegidas)
	protected.Post("/complaints", handlers.CreateComplaint)
	protected.Get("/complaints", handlers.ListMyComplaints)

	// Rutas de reservas (protegidas)
	protected.Post("/reservations", handlers.CreateReservation)
	protected.Get("/reservations", handlers.ListMyReservations)
	// Rutas de carrito persistente
	protected.Get("/cart", handlers.GetCart)
	protected.Post("/cart", handlers.SaveCart)
	protected.Post("/cart/add", handlers.AddToCart)

	// Rutas de favoritos (protegidas)
	protected.Get("/favorites", handlers.ListFavorites)
	protected.Post("/favorites", handlers.AddFavorite)
	protected.Post("/favorites/:product_id", handlers.AddFavorite)
	protected.Delete("/favorites/:product_id", handlers.RemoveFavorite)

	// Rutas de reseñas (protegidas)
	protected.Post("/products/:product_id/reviews", handlers.UpsertReview)
	protected.Get("/reviews", handlers.ListMyReviews)
	protected.Get("/products/:product_id/can-review", handlers.CanReviewProduct)

	// Rutas de notificaciones (protegidas)
	protected.Get("/notifications", handlers.GetNotifications)
	protected.Post("/notifications", handlers.CreateNotification)
	protected.Put("/notifications/:id/read", handlers.MarkNotificationAsRead)
	protected.Put("/notifications/read-all", handlers.MarkAllNotificationsAsRead)
	protected.Get("/notifications/stats", handlers.GetNotificationStats)

	// Rutas de notificaciones para admin (protegidas - se manejan más abajo)

	// Rutas públicas para favoritos (devuelven datos vacíos si no hay usuario autenticado)
	api.Get("/favorites", handlers.ListFavoritesPublic)

	// Ruta pública para carrito (devuelve datos vacíos si no hay usuario autenticado)
	api.Get("/cart", handlers.GetCartPublic)
	api.Post("/cart", handlers.SaveCartPublic)

	// Rutas de admin (protegidas)
	admin := protected.Group("/admin")
	admin.Use(middleware.RequireRole("admin"))

	// Gestión de usuarios (protegidas)
	admin.Get("/users", handlers.ListUsers)
	admin.Get("/users/:id", handlers.GetUser)
	admin.Put("/users/:id", handlers.UpdateUser)

	// Gestión de productos (protegidas)
	admin.Post("/products", handlers.CreateProduct)
	admin.Put("/products/:id", handlers.UpdateProduct)
	admin.Delete("/products/:id", handlers.DeleteProduct)
	admin.Get("/products/list", handlers.GetAllProductsAdmin)

	// Gestión de servicios (protegidas)
	admin.Get("/services/list", handlers.GetAdminServicesListPublic)
	admin.Post("/services", handlers.CreateService)
	admin.Put("/services/:id", handlers.UpdateService)
	admin.Delete("/services/:id", handlers.DeleteService)

	// Ruta de prueba temporal para DELETE
	admin.Delete("/services/test/:id", handlers.DeleteService)

	// Gestión de categorías (protegidas)
	admin.Get("/categories", handlers.ListCategories)
	admin.Post("/categories", handlers.CreateCategory)
	admin.Put("/categories/:id", handlers.UpdateCategory)
	admin.Delete("/categories/:id", handlers.DeleteCategory)

	// Upload de imágenes se maneja directamente desde el frontend con Cloudinary

	// Gestión de reclamos (solo admin)
	admin.Get("/complaints", handlers.ListComplaints)
	admin.Put("/complaints/:id/status", handlers.UpdateComplaintStatus)

	// Gestión de reservas (solo admin)
	admin.Get("/reservations", handlers.ListAllReservations)
	admin.Put("/reservations/:id/status", handlers.UpdateReservationStatus)

	// Reportes (solo admin)
	admin.Get("/reports/sales/csv", handlers.ExportSalesCSV)
	admin.Get("/reports/sales/pdf", handlers.ExportSalesPDF)
	admin.Get("/reports/users/csv", handlers.ExportUsersCSV)
	admin.Get("/reports/users/pdf", handlers.ExportUsersPDF)

	// Endpoints de dashboard para estadísticas (solo admin)
	admin.Get("/test", handlers.TestDashboardEndpoint)
	admin.Get("/products", handlers.GetAdminProducts)
	admin.Get("/orders", handlers.GetAdminOrders)
	admin.Get("/users", handlers.GetAdminUsers)

	// Ruta protegida para obtener usuario por email
	protected.Get("/users/by-email/:email", handlers.GetUserByEmail)

	// Documentación Swagger
	app.Get("/swagger/*", swagger.HandlerDefault)

	// Endpoints de salud y monitoreo
	app.Get("/test", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "API funcionando correctamente",
			"status":  "ok",
		})
	})

	// Endpoints públicos para dashboard (protegidos con autenticación y validación de roles)
	adminPublic := api.Group("/admin")
	adminPublic.Use(middleware.AuthMiddleware())
	adminPublic.Use(middleware.RequireRole("admin"))

	adminPublic.Get("/products", handlers.GetAdminProductsPublic)
	adminPublic.Get("/orders", handlers.GetAdminOrdersPublic)
	adminPublic.Get("/users", handlers.GetAdminUsersPublic)
	adminPublic.Get("/reservations", handlers.ListAllReservations)
	adminPublic.Put("/reservations/:id/status", handlers.UpdateReservationStatus)

	// Rutas de reclamos para admin
	adminPublic.Get("/complaints", handlers.ListComplaints)
	adminPublic.Put("/complaints/:id/status", handlers.UpdateComplaintStatus)

	// Endpoints para listas de administración
	adminPublic.Get("/products/list", handlers.GetAdminProductsListPublic)
	adminPublic.Get("/services/list", handlers.GetAdminServicesListPublic)
	adminPublic.Get("/orders/list", handlers.GetAdminOrdersListPublic)
	adminPublic.Put("/orders/:id/status", handlers.UpdateOrderStatus)
	adminPublic.Get("/users/list", handlers.GetAdminUsersPublic)
	adminPublic.Put("/users/:id", handlers.UpdateUserAdmin)
	adminPublic.Put("/users/:id/suspend", handlers.SuspendUserAdmin)
	adminPublic.Put("/users/:id/reactivate", handlers.ReactivateUserAdmin)
	adminPublic.Put("/notifications/:type/read-all", handlers.MarkNotificationsAsReadByType)

	// Rutas de administración de productos
	adminPublic.Put("/products/:id", handlers.UpdateProduct)
	adminPublic.Post("/products", handlers.CreateProduct)
	adminPublic.Delete("/products/:id", handlers.DeleteProduct)

	// Rutas de administración de categorías
	adminPublic.Get("/categories", handlers.ListCategories)
	adminPublic.Post("/categories", handlers.CreateCategory)
	adminPublic.Put("/categories/:id", handlers.UpdateCategory)
	adminPublic.Delete("/categories/:id", handlers.DeleteCategory)

	// Rutas de notificaciones para admin
	adminPublic.Get("/notifications", handlers.GetNotifications)
	adminPublic.Post("/notifications", handlers.CreateNotification)
	adminPublic.Put("/notifications/:id/read", handlers.MarkNotificationAsRead)
	adminPublic.Get("/notifications/stats", handlers.GetNotificationStats)

	// Rutas de administración de sorteos
	adminPublic.Get("/raffles/configs", handlers.ListRaffleConfigs)
	adminPublic.Post("/raffles/config", handlers.CreateOrUpdateRaffleConfig)
	adminPublic.Put("/raffles/config", handlers.CreateOrUpdateRaffleConfig)
	adminPublic.Get("/raffles/participants", handlers.ListRaffleParticipants)
	adminPublic.Put("/raffles/participants/:id/winner", handlers.MarkWinner)
	adminPublic.Get("/raffles/stats", handlers.GetRaffleStats)

	// Rutas de notificaciones para usuarios normales
	api.Get("/notifications", handlers.GetNotifications)
	api.Post("/notifications", handlers.CreateNotification)
	api.Put("/notifications/:id/read", handlers.MarkNotificationAsRead)
	api.Get("/notifications/stats", handlers.GetNotificationStats)

	// Rutas de reclamos públicas
	api.Post("/complaints", handlers.CreateComplaint)

	// Endpoint de monitoreo para admin (protegido)
	adminPublic.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message":   "Panel de administración funcionando",
			"status":    "ok",
			"timestamp": time.Now(),
		})
	})

	// Health check endpoint para verificar que el servidor esté funcionando
	app.Get("/health", func(c *fiber.Ctx) error {
		// Verificar conexión a base de datos
		if err := db.DB.Ping(context.Background()); err != nil {
			return c.Status(503).JSON(fiber.Map{
				"status":    "error",
				"message":   "Base de datos no disponible",
				"timestamp": time.Now(),
				"error":     err.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"status":    "ok",
			"message":   "POSOQO Backend funcionando correctamente",
			"timestamp": time.Now(),
			"version":   "1.0.0",
			"database":  "connected",
		})
	})

	// Ruta de prueba para verificar conexión a base de datos (sin /api)
	app.Get("/test-db", handlers.TestDatabaseConnection)
	app.Get("/test-users", handlers.TestUsersConnection)
	app.Get("/test-table-structure", handlers.TestTableStructure)
	app.Get("/test-user-exists", handlers.TestUserExists)
	app.Get("/test-orders-location", handlers.TestOrdersLocation)
	app.Get("/run-migrations", handlers.RunMigrations)

	// Servir archivos estáticos de la carpeta uploads
	app.Static("/uploads", "./uploads")

	// Upload de imágenes se maneja directamente desde el frontend con Cloudinary

	// Obtener puerto de variable de entorno
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Iniciar servidor
	log.Printf("Servidor iniciando en puerto %s", port)
	log.Printf("Documentación disponible en: http://localhost:%s/swagger/", port)
	log.Printf("Health check: http://localhost:%s/health", port)

	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Error iniciando servidor:", err)
	}
}

// setupEnvironment configura las variables de entorno necesarias
func setupEnvironment() {
	isProduction := os.Getenv("NODE_ENV") == "production"

	// Variables de entorno para JWT
	if os.Getenv("JWT_ACCESS_SECRET") == "" {
		if isProduction {
			log.Fatal("❌ JWT_ACCESS_SECRET debe estar configurado en producción")
		}
		os.Setenv("JWT_ACCESS_SECRET", "your-super-secret-access-key-change-in-production")
		log.Println("⚠️ JWT_ACCESS_SECRET no configurado, usando valor por defecto (SOLO DESARROLLO)")
	} else if isProduction {
		// Validar que el secret no sea el valor por defecto en producción
		if os.Getenv("JWT_ACCESS_SECRET") == "your-super-secret-access-key-change-in-production" {
			log.Fatal("❌ JWT_ACCESS_SECRET no puede usar el valor por defecto en producción")
		}
		log.Println("✅ JWT_ACCESS_SECRET configurado correctamente")
	}

	if os.Getenv("JWT_REFRESH_SECRET") == "" {
		if isProduction {
			log.Fatal("❌ JWT_REFRESH_SECRET debe estar configurado en producción")
		}
		os.Setenv("JWT_REFRESH_SECRET", "your-super-secret-refresh-key-change-in-production")
		log.Println("⚠️ JWT_REFRESH_SECRET no configurado, usando valor por defecto (SOLO DESARROLLO)")
	} else if isProduction {
		// Validar que el secret no sea el valor por defecto en producción
		if os.Getenv("JWT_REFRESH_SECRET") == "your-super-secret-refresh-key-change-in-production" {
			log.Fatal("❌ JWT_REFRESH_SECRET no puede usar el valor por defecto en producción")
		}
		log.Println("✅ JWT_REFRESH_SECRET configurado correctamente")
	}

	// Variables de entorno para base de datos
	if os.Getenv("DB_HOST") == "" {
		os.Setenv("DB_HOST", "localhost")
	}
	if os.Getenv("DB_PORT") == "" {
		os.Setenv("DB_PORT", "5432")
	}
	if os.Getenv("DB_USER") == "" {
		os.Setenv("DB_USER", "posoqo_user")
	}
	if os.Getenv("DB_PASSWORD") == "" {
		log.Fatal("❌ DB_PASSWORD debe estar configurado en el archivo .env")
	} else if isProduction {
		log.Println("✅ DB_PASSWORD configurado correctamente")
	}
	if os.Getenv("DB_NAME") == "" {
		os.Setenv("DB_NAME", "posoqo")
	}

	// Variable de entorno para puerto
	if os.Getenv("PORT") == "" {
		os.Setenv("PORT", "3000")
	}

	// Validar variables críticas en producción
	if isProduction {
		requiredVars := []string{
			"JWT_ACCESS_SECRET",
			"JWT_REFRESH_SECRET",
			"DB_PASSWORD",
			"DB_HOST",
			"DB_NAME",
		}

		missingVars := []string{}
		for _, v := range requiredVars {
			if os.Getenv(v) == "" {
				missingVars = append(missingVars, v)
			}
		}

		if len(missingVars) > 0 {
			log.Fatalf("❌ Variables de entorno faltantes en producción: %v", missingVars)
		}

		log.Println("✅ Todas las variables de entorno críticas están configuradas")
	}

	log.Println("✅ Variables de entorno configuradas correctamente")
}
