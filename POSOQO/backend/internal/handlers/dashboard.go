package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/posoqo/backend/internal/db"
)

// Endpoint de prueba simple
func TestDashboardEndpoint(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"message":   "Dashboard endpoint funcionando",
		"status":    "ok",
		"timestamp": time.Now().Format("2006-01-02 15:04:05"),
	})
}

// Endpoint para verificar estructura de tabla notifications
func TestNotificationsTable(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(),
		"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'notifications' ORDER BY ordinal_position")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener estructura de tabla notifications"})
	}
	defer rows.Close()

	var columns []fiber.Map
	for rows.Next() {
		var columnName, dataType, isNullable string
		rows.Scan(&columnName, &dataType, &isNullable)
		columns = append(columns, fiber.Map{
			"column_name": columnName,
			"data_type":   dataType,
			"is_nullable": isNullable,
		})
	}

	return c.JSON(fiber.Map{
		"table_name": "notifications",
		"columns":    columns,
		"count":      len(columns),
	})
}

// TestCartTables verifica si las tablas de carrito existen
func TestCartTables(c *fiber.Ctx) error {
	// Verificar si existe la tabla carts
	var cartsExists bool
	err := db.DB.QueryRow(context.Background(),
		"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'carts')").Scan(&cartsExists)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error verificando tabla carts"})
	}

	// Verificar si existe la tabla cart_items
	var cartItemsExists bool
	err = db.DB.QueryRow(context.Background(),
		"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart_items')").Scan(&cartItemsExists)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error verificando tabla cart_items"})
	}

	// Si existen, obtener estructura
	var cartsColumns []fiber.Map
	var cartItemsColumns []fiber.Map

	if cartsExists {
		rows, err := db.DB.Query(context.Background(),
			"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'carts' ORDER BY ordinal_position")
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var columnName, dataType string
				rows.Scan(&columnName, &dataType)
				cartsColumns = append(cartsColumns, fiber.Map{
					"column_name": columnName,
					"data_type":   dataType,
				})
			}
		}
	}

	if cartItemsExists {
		rows, err := db.DB.Query(context.Background(),
			"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cart_items' ORDER BY ordinal_position")
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var columnName, dataType string
				rows.Scan(&columnName, &dataType)
				cartItemsColumns = append(cartItemsColumns, fiber.Map{
					"column_name": columnName,
					"data_type":   dataType,
				})
			}
		}
	}

	return c.JSON(fiber.Map{
		"carts_exists":       cartsExists,
		"cart_items_exists":  cartItemsExists,
		"carts_columns":      cartsColumns,
		"cart_items_columns": cartItemsColumns,
	})
}

// TestStripeConfig verifica si Stripe está configurado
func TestStripeConfig(c *fiber.Ctx) error {
	stripeKey := os.Getenv("STRIPE_SECRET_KEY")
	stripePublishableKey := os.Getenv("STRIPE_PUBLISHABLE_KEY")
	
	return c.JSON(fiber.Map{
		"stripe_secret_key_configured":      stripeKey != "",
		"stripe_publishable_key_configured": stripePublishableKey != "",
		"stripe_secret_key_length":          len(stripeKey),
		"stripe_publishable_key_length":     len(stripePublishableKey),
	})
}

// DebugOrderCoordinates verifica las coordenadas específicas de un pedido
func DebugOrderCoordinates(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(), `
		SELECT 
			o.id,
			o.lat,
			o.lng,
			o.location,
			o.created_at
		FROM orders o
		ORDER BY o.created_at DESC
		LIMIT 5
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener pedidos"})
	}
	defer rows.Close()

	orders := []fiber.Map{}
	for rows.Next() {
		var id string
		var lat, lng sql.NullFloat64
		var location sql.NullString
		var createdAt time.Time

		err := rows.Scan(&id, &lat, &lng, &location, &createdAt)
		if err != nil {
			continue
		}

		order := fiber.Map{
			"id":         id,
			"lat":        lat.Float64,
			"lng":        lng.Float64,
			"lat_valid":  lat.Valid,
			"lng_valid":  lng.Valid,
			"location":   location.String,
			"created_at": createdAt,
		}
		orders = append(orders, order)
	}

	return c.JSON(fiber.Map{
		"orders": orders,
		"count":  len(orders),
	})
}

// DebugUsersTable verifica la estructura de la tabla users
func DebugUsersTable(c *fiber.Ctx) error {
	// Verificar estructura de la tabla
	rows, err := db.DB.Query(context.Background(), `
		SELECT column_name, data_type, is_nullable 
		FROM information_schema.columns 
		WHERE table_name = 'users' 
		ORDER BY ordinal_position
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error verificando estructura de tabla users",
			"details": err.Error(),
		})
	}
	defer rows.Close()

	columns := []fiber.Map{}
	for rows.Next() {
		var columnName, dataType, isNullable string
		rows.Scan(&columnName, &dataType, &isNullable)
		columns = append(columns, fiber.Map{
			"column_name": columnName,
			"data_type":   dataType,
			"is_nullable": isNullable,
		})
	}

	// Contar usuarios
	var userCount int
	err = db.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM users").Scan(&userCount)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error contando usuarios",
			"details": err.Error(),
			"table_structure": columns,
		})
	}

	// Intentar obtener un usuario de ejemplo
	var sampleUser fiber.Map
	userRow := db.DB.QueryRow(context.Background(), "SELECT id, name, email, role FROM users LIMIT 1")
	var id int64
	var name, email, role string
	if err := userRow.Scan(&id, &name, &email, &role); err != nil {
		sampleUser = fiber.Map{
			"error": "No se pudo obtener usuario de ejemplo",
			"details": err.Error(),
		}
	} else {
		sampleUser = fiber.Map{
			"id": id,
			"name": name,
			"email": email,
			"role": role,
		}
	}

	return c.JSON(fiber.Map{
		"table_structure": columns,
		"user_count": userCount,
		"sample_user": sampleUser,
		"debug": true,
	})
}

// Endpoint temporal para debug de categorías y productos
func DebugCategoriesAndProducts(c *fiber.Ctx) error {
	// Obtener todas las categorías
	categoriesRows, err := db.DB.Query(context.Background(), "SELECT id, name FROM categories ORDER BY name")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener categorías"})
	}
	defer categoriesRows.Close()

	var categories []fiber.Map
	for categoriesRows.Next() {
		var id, name string
		categoriesRows.Scan(&id, &name)
		categories = append(categories, fiber.Map{
			"id":   id,
			"name": name,
		})
	}

	// Obtener todos los productos
	productsRows, err := db.DB.Query(context.Background(),
		"SELECT id, name, category_id, is_featured FROM products ORDER BY name")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener productos"})
	}
	defer productsRows.Close()

	var products []fiber.Map
	for productsRows.Next() {
		var id, name, categoryID string
		var isFeatured bool
		productsRows.Scan(&id, &name, &categoryID, &isFeatured)
		products = append(products, fiber.Map{
			"id":          id,
			"name":        name,
			"category_id": categoryID,
			"is_featured": isFeatured,
		})
	}

	return c.JSON(fiber.Map{
		"categories": categories,
		"products":   products,
	})
}

// Resumen general para dashboard
func DashboardSummary(c *fiber.Ctx) error {
	var totalSales float64
	var ordersToday, usersCount, reservationsCount int
	var topProductName string
	var topProductCount int
	db.DB.QueryRow(context.Background(), `SELECT COALESCE(SUM(total),0) FROM orders`).Scan(&totalSales)
	db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM orders WHERE created_at::date = CURRENT_DATE`).Scan(&ordersToday)
	db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM users`).Scan(&usersCount)
	db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM reservations`).Scan(&reservationsCount)
	db.DB.QueryRow(context.Background(), `SELECT p.name, COUNT(*) as cnt FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.name ORDER BY cnt DESC LIMIT 1`).Scan(&topProductName, &topProductCount)

	return c.JSON(fiber.Map{
		"total_sales":  totalSales,
		"orders_today": ordersToday,
		"users":        usersCount,
		"reservations": reservationsCount,
		"top_product":  fiber.Map{"name": topProductName, "count": topProductCount},
	})
}

// Ventas por día (últimos 30 días)
func DashboardSales(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(),
		`SELECT created_at::date, SUM(total) FROM orders GROUP BY created_at::date ORDER BY created_at::date DESC LIMIT 30`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener ventas"})
	}
	defer rows.Close()

	sales := []fiber.Map{}
	for rows.Next() {
		var date time.Time
		var total float64
		if err := rows.Scan(&date, &total); err != nil {
			continue
		}
		sales = append(sales, fiber.Map{"date": date.Format("2006-01-02"), "total": total})
	}
	return c.JSON(sales)
}

// Top productos más vendidos
func DashboardTopProducts(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(),
		`SELECT p.name, COUNT(*) as cnt FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.name ORDER BY cnt DESC LIMIT 10`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener productos"})
	}
	defer rows.Close()

	products := []fiber.Map{}
	for rows.Next() {
		var name string
		var count int
		if err := rows.Scan(&name, &count); err != nil {
			continue
		}
		products = append(products, fiber.Map{"name": name, "count": count})
	}
	return c.JSON(products)
}

// Endpoint para obtener estadísticas de productos (admin)
func GetAdminProducts(c *fiber.Ctx) error {
	var totalProducts, activeProducts, lowStockProducts int

	// Contar total de productos
	err := db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM products`).Scan(&totalProducts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar productos"})
	}

	// Contar productos activos
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM products WHERE is_active = true`).Scan(&activeProducts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar productos activos"})
	}

	// Contar productos con bajo stock (menos de 10 unidades)
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM products WHERE stock < 10 AND is_active = true`).Scan(&lowStockProducts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar productos con bajo stock"})
	}

	// Obtener productos con bajo stock
	rows, err := db.DB.Query(context.Background(),
		`SELECT id, name, stock FROM products WHERE stock < 10 AND is_active = true ORDER BY stock ASC LIMIT 5`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener productos con bajo stock"})
	}
	defer rows.Close()

	lowStockProductsList := []fiber.Map{}
	for rows.Next() {
		var id, name string
		var stock int
		if err := rows.Scan(&id, &name, &stock); err != nil {
			continue
		}
		lowStockProductsList = append(lowStockProductsList, fiber.Map{
			"id":    id,
			"name":  name,
			"stock": stock,
		})
	}

	return c.JSON(fiber.Map{
		"totalProducts":        totalProducts,
		"activeProducts":       activeProducts,
		"lowStockProducts":     lowStockProducts,
		"lowStockProductsList": lowStockProductsList,
	})
}

// Endpoint para obtener estadísticas de pedidos (admin)
func GetAdminOrders(c *fiber.Ctx) error {
	var totalOrders, pendingOrders, completedOrders int
	var totalRevenue float64

	// Contar total de pedidos
	err := db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM orders`).Scan(&totalOrders)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar pedidos"})
	}

	// Contar pedidos pendientes
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM orders WHERE status IN ('recibido', 'preparando')`).Scan(&pendingOrders)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar pedidos pendientes"})
	}

	// Contar pedidos completados
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM orders WHERE status = 'entregado'`).Scan(&completedOrders)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar pedidos completados"})
	}

	// Calcular ingresos totales
	err = db.DB.QueryRow(context.Background(), `SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'entregado'`).Scan(&totalRevenue)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al calcular ingresos"})
	}

	// Obtener pedidos recientes
	rows, err := db.DB.Query(context.Background(),
		`SELECT id, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener pedidos recientes"})
	}
	defer rows.Close()

	recentOrders := []fiber.Map{}
	for rows.Next() {
		var id, status string
		var total float64
		var createdAt time.Time
		if err := rows.Scan(&id, &total, &status, &createdAt); err != nil {
			continue
		}
		recentOrders = append(recentOrders, fiber.Map{
			"id":         id,
			"total":      total,
			"status":     status,
			"created_at": createdAt.Format("2006-01-02 15:04:05"),
		})
	}

	return c.JSON(fiber.Map{
		"totalOrders":     totalOrders,
		"pendingOrders":   pendingOrders,
		"completedOrders": completedOrders,
		"totalRevenue":    totalRevenue,
		"recentOrders":    recentOrders,
	})
}

// Endpoint para obtener estadísticas de usuarios (admin)
func GetAdminUsers(c *fiber.Ctx) error {
	var totalUsers, activeUsers, adminUsers int

	// Contar total de usuarios
	err := db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM users`).Scan(&totalUsers)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar usuarios"})
	}

	// Contar usuarios activos (con email verificado)
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM users WHERE email_verified = true`).Scan(&activeUsers)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar usuarios activos"})
	}

	// Contar administradores
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM users WHERE role = 'admin'`).Scan(&adminUsers)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar administradores"})
	}

	return c.JSON(fiber.Map{
		"totalUsers":  totalUsers,
		"activeUsers": activeUsers,
		"adminUsers":  adminUsers,
	})
}

// Endpoint temporal para productos (sin autenticación)
func GetAdminProductsPublic(c *fiber.Ctx) error {
	var totalProducts, activeProducts, lowStockProducts int

	// Contar total de productos
	err := db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM products`).Scan(&totalProducts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar productos"})
	}

	// Contar productos activos
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM products WHERE is_active = true`).Scan(&activeProducts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar productos activos"})
	}

	// Contar productos con bajo stock (menos de 10 unidades)
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM products WHERE stock < 10 AND is_active = true`).Scan(&lowStockProducts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar productos con bajo stock"})
	}

	// Obtener productos con bajo stock
	rows, err := db.DB.Query(context.Background(),
		`SELECT id, name, stock FROM products WHERE stock < 10 AND is_active = true ORDER BY stock ASC LIMIT 5`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener productos con bajo stock"})
	}
	defer rows.Close()

	lowStockProductsList := []fiber.Map{}
	for rows.Next() {
		var id, name string
		var stock int
		if err := rows.Scan(&id, &name, &stock); err != nil {
			continue
		}
		lowStockProductsList = append(lowStockProductsList, fiber.Map{
			"id":    id,
			"name":  name,
			"stock": stock,
		})
	}

	return c.JSON(fiber.Map{
		"totalProducts":        totalProducts,
		"activeProducts":       activeProducts,
		"lowStockProducts":     lowStockProducts,
		"lowStockProductsList": lowStockProductsList,
	})
}

// Endpoint temporal para pedidos (sin autenticación)
func GetAdminOrdersPublic(c *fiber.Ctx) error {
	var totalOrders, pendingOrders, completedOrders int
	var totalRevenue float64

	// Contar total de pedidos
	err := db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM orders`).Scan(&totalOrders)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar pedidos"})
	}

	// Contar pedidos pendientes
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM orders WHERE status IN ('recibido', 'preparando')`).Scan(&pendingOrders)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar pedidos pendientes"})
	}

	// Contar pedidos completados
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM orders WHERE status = 'entregado'`).Scan(&completedOrders)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar pedidos completados"})
	}

	// Calcular ingresos totales
	err = db.DB.QueryRow(context.Background(), `SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'entregado'`).Scan(&totalRevenue)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al calcular ingresos"})
	}

	// Obtener pedidos recientes
	rows, err := db.DB.Query(context.Background(),
		`SELECT id, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener pedidos recientes"})
	}
	defer rows.Close()

	recentOrders := []fiber.Map{}
	for rows.Next() {
		var id, status string
		var total float64
		var createdAt time.Time
		if err := rows.Scan(&id, &total, &status, &createdAt); err != nil {
			continue
		}
		recentOrders = append(recentOrders, fiber.Map{
			"id":         id,
			"total":      total,
			"status":     status,
			"created_at": createdAt.Format("2006-01-02 15:04:05"),
		})
	}

	return c.JSON(fiber.Map{
		"totalOrders":     totalOrders,
		"pendingOrders":   pendingOrders,
		"completedOrders": completedOrders,
		"totalRevenue":    totalRevenue,
		"recentOrders":    recentOrders,
	})
}

// Endpoint temporal para usuarios (sin autenticación)
func GetAdminUsersPublic(c *fiber.Ctx) error {
	var totalUsers, activeUsers, adminUsers int

	// Contar total de usuarios
	err := db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM users`).Scan(&totalUsers)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar usuarios"})
	}

	// Contar usuarios activos (con email verificado)
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM users WHERE email_verified = true`).Scan(&activeUsers)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar usuarios activos"})
	}

	// Contar administradores
	err = db.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM users WHERE role = 'admin'`).Scan(&adminUsers)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar administradores"})
	}

	return c.JSON(fiber.Map{
		"totalUsers":  totalUsers,
		"activeUsers": activeUsers,
		"adminUsers":  adminUsers,
	})
}

// Endpoint temporal para lista de productos (sin autenticación)
func GetAdminProductsListPublic(c *fiber.Ctx) error {
	// Consultar productos reales de la base de datos
	rows, err := db.DB.Query(context.Background(), `
		SELECT id, name, description, price, image_url, category_id, subcategory, 
		       is_active, is_featured, estilo, abv, ibu, color, created_at, updated_at
		FROM products
		ORDER BY name ASC
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al consultar productos: " + err.Error(),
		})
	}
	defer rows.Close()

	products := []fiber.Map{}
	for rows.Next() {
		var id, name, description, categoryID, estilo, abv, ibu, color string
		var imageURL, subcategory sql.NullString
		var price float64
		var isActive, isFeatured bool
		var createdAt, updatedAt time.Time

		err := rows.Scan(&id, &name, &description, &price, &imageURL, &categoryID, &subcategory,
			&isActive, &isFeatured, &estilo, &abv, &ibu, &color, &createdAt, &updatedAt)
		if err != nil {
			continue
		}

		products = append(products, fiber.Map{
			"id":             id,
			"name":           name,
			"description":    description,
			"price":          price,
			"image_url":      imageURL.String,
			"category_id":    categoryID,
			"subcategory_id": subcategory.String, // Usar subcategory.String para manejar NULL
			"is_active":      isActive,
			"is_featured":    isFeatured,
			"stock":          0, // Valor por defecto ya que no existe la columna
			"estilo":         estilo,
			"abv":            abv,
			"ibu":            ibu,
			"color":          color,
			"created_at":     createdAt.Format("2006-01-02 15:04:05"),
			"updated_at":     updatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	return c.JSON(fiber.Map{
		"data":  products,
		"total": len(products),
	})
}

// Endpoint temporal para lista de servicios (sin autenticación)
func GetAdminServicesListPublic(c *fiber.Ctx) error {
	// Consultar servicios reales de la base de datos
	rows, err := db.DB.Query(context.Background(), `
		SELECT id, name, description, image_url, is_active, created_at, updated_at
		FROM services
		ORDER BY name ASC
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al consultar servicios: " + err.Error(),
		})
	}
	defer rows.Close()

	services := []fiber.Map{}
	for rows.Next() {
		var id, name, description string
		var imageURL sql.NullString
		var isActive bool
		var createdAt, updatedAt time.Time

		err := rows.Scan(&id, &name, &description, &imageURL, &isActive, &createdAt, &updatedAt)
		if err != nil {
			continue
		}

		services = append(services, fiber.Map{
			"id":          id,
			"name":        name,
			"description": description,
			"image_url":   imageURL.String,
			"is_active":   isActive,
			"created_at":  createdAt.Format("2006-01-02 15:04:05"),
			"updated_at":  updatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	return c.JSON(fiber.Map{
		"data": services,
	})
}

// Endpoint para obtener lista de pedidos (admin)
func GetAdminOrdersListPublic(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(), `
		SELECT 
			o.id,
			o.user_id,
			u.name as user_name,
			u.last_name as user_last_name,
			u.email as user_email,
			u.dni,
			u.phone,
			o.total,
			o.status,
			o.location,
			o.lat,
			o.lng,
			o.created_at,
			o.updated_at
		FROM orders o
		LEFT JOIN users u ON o.user_id = u.id
		ORDER BY o.created_at DESC
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener pedidos"})
	}
	defer rows.Close()

	orders := []fiber.Map{}
	for rows.Next() {
		var id string
		var userID int64
		var userName, userLastName, userEmail sql.NullString
		var dni, phone sql.NullString
		var total float64
		var status string
		var location sql.NullString
		var lat, lng sql.NullFloat64
		var createdAt, updatedAt time.Time

		err := rows.Scan(&id, &userID, &userName, &userLastName, &userEmail, &dni, &phone, &total, &status, &location, &lat, &lng, &createdAt, &updatedAt)
		if err != nil {
			continue
		}

		order := fiber.Map{
			"id":             id,
			"user_id":        userID,
			"user_name":      userName.String,
			"user_last_name": userLastName.String,
			"user_email":     userEmail.String,
			"dni":            dni.String,
			"phone":          phone.String,
			"total":          total,
			"status":         status,
			"location":       location.String,
			"lat":            lat.Float64,
			"lng":            lng.Float64,
			"created_at":     createdAt,
			"updated_at":     updatedAt,
		}
		orders = append(orders, order)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    orders,
		"total":   len(orders),
	})
}

// Eliminar la función duplicada CreateAutomaticNotification que está en notification.go

// GetAdminUsersListPublic obtiene la lista de usuarios (admin)
func GetAdminUsersListPublic(c *fiber.Ctx) error {
	fmt.Printf("🔍 [USERS] Iniciando GetAdminUsersListPublic\n")
	
	// Primero verificar si la tabla existe
	var tableExists bool
	err := db.DB.QueryRow(context.Background(), 
		"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')").Scan(&tableExists)
	if err != nil || !tableExists {
		fmt.Printf("🔍 [USERS] Tabla users no existe o error: %v\n", err)
		return c.JSON(fiber.Map{
			"data": []fiber.Map{},
			"error": "Tabla users no existe",
		})
	}
	fmt.Printf("🔍 [USERS] Tabla users existe: %v\n", tableExists)

	// Intentar query más simple posible
	fmt.Printf("🔍 [USERS] Ejecutando query simple\n")
	rows, err := db.DB.Query(context.Background(), `
		SELECT id, name, email, role
		FROM users
		ORDER BY id DESC
		LIMIT 10
	`)
	if err != nil {
		fmt.Printf("🔍 [USERS] Error en query: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al obtener usuarios",
			"details": err.Error(),
		})
	}
	defer rows.Close()
	fmt.Printf("🔍 [USERS] Query ejecutada, procesando filas\n")

	users := []fiber.Map{}
	rowCount := 0
	for rows.Next() {
		rowCount++
		fmt.Printf("🔍 [USERS] Procesando fila %d\n", rowCount)
		
		var id int64
		var name, email, role string

		err := rows.Scan(&id, &name, &email, &role)
		if err != nil {
			fmt.Printf("🔍 [USERS] Error en scan fila %d: %v\n", rowCount, err)
			continue
		}

		fmt.Printf("🔍 [USERS] Fila %d escaneada: id=%d, name=%s, email=%s, role=%s\n", 
			rowCount, id, name, email, role)

		user := fiber.Map{
			"id":             id,
			"name":           name,
			"email":          email,
			"role":           role,
			"email_verified": true, // Default value
			"created_at":     "2024-01-01T00:00:00Z",
			"updated_at":     "2024-01-01T00:00:00Z",
		}
		users = append(users, user)
	}
	
	fmt.Printf("🔍 [USERS] Total filas procesadas: %d\n", rowCount)
	fmt.Printf("🔍 [USERS] Total usuarios en array: %d\n", len(users))

	return c.JSON(fiber.Map{
		"data": users,
	})
}

// TestOrdersLocation verifica los pedidos con ubicación
func TestOrdersLocation(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(), `
		SELECT 
			id,
			user_id,
			total,
			status,
			location,
			lat,
			lng,
			created_at
		FROM orders
		ORDER BY created_at DESC
		LIMIT 5
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener pedidos"})
	}
	defer rows.Close()

	orders := []fiber.Map{}
	for rows.Next() {
		var id string
		var userID int64
		var total float64
		var status string
		var location sql.NullString
		var lat, lng sql.NullFloat64
		var createdAt time.Time

		err := rows.Scan(&id, &userID, &total, &status, &location, &lat, &lng, &createdAt)
		if err != nil {
			continue
		}

		order := fiber.Map{
			"id":         id,
			"user_id":    userID,
			"total":      total,
			"status":     status,
			"location":   location.String,
			"lat":        lat.Float64,
			"lng":        lng.Float64,
			"created_at": createdAt,
		}
		orders = append(orders, order)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    orders,
		"total":   len(orders),
	})
}

// UpdateUserAdmin actualiza un usuario (admin)
func UpdateUserAdmin(c *fiber.Ctx) error {
	userID := c.Params("id")
	var req struct {
		Name          string `json:"name"`
		Email         string `json:"email"`
		Role          string `json:"role"`
		EmailVerified bool   `json:"email_verified"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Validar rol
	if req.Role != "user" && req.Role != "admin" {
		return c.Status(400).JSON(fiber.Map{"error": "Rol no válido"})
	}

	// Separar nombre y apellido si es necesario
	nameParts := strings.Fields(req.Name)
	firstName := nameParts[0]
	lastName := ""
	if len(nameParts) > 1 {
		lastName = strings.Join(nameParts[1:], " ")
	}

	_, err := db.DB.Exec(context.Background(),
		`UPDATE users SET name=$1, last_name=$2, email=$3, role=$4, email_verified=$5, updated_at=NOW() WHERE id=$6`,
		firstName, lastName, req.Email, req.Role, req.EmailVerified, userID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al actualizar usuario"})
	}

	// Crear notificación automática
	title := "Usuario actualizado"
	message := fmt.Sprintf("El usuario %s ha sido actualizado", req.Name)
	_, err = db.DB.Exec(context.Background(),
		`INSERT INTO notifications (title, message, type, created_at)
		 VALUES ($1, $2, $3, NOW())`,
		title, message, "info")

	if err != nil {
		fmt.Printf("Error creando notificación: %v\n", err)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Usuario actualizado exitosamente",
	})
}

// SuspendUserAdmin suspende un usuario (admin)
func SuspendUserAdmin(c *fiber.Ctx) error {
	userID := c.Params("id")

	_, err := db.DB.Exec(context.Background(),
		`UPDATE users SET role='suspended', updated_at=NOW() WHERE id=$1`,
		userID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al suspender usuario"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Usuario suspendido exitosamente",
	})
}

// ReactivateUserAdmin reactiva un usuario (admin)
func ReactivateUserAdmin(c *fiber.Ctx) error {
	userID := c.Params("id")

	_, err := db.DB.Exec(context.Background(),
		`UPDATE users SET role='user', updated_at=NOW() WHERE id=$1`,
		userID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al reactivar usuario"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Usuario reactivado exitosamente",
	})
}
