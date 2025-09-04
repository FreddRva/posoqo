package handlers

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/posoqo/backend/internal/db"
)

type CartItemRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type SaveCartRequest struct {
	Items []CartItemRequest `json:"items"`
}

// GET /api/cart
func GetCart(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))

	var cartID string
	err := db.DB.QueryRow(context.Background(), "SELECT id FROM carts WHERE user_id=$1", userID).Scan(&cartID)
	if err != nil {
		return c.JSON(fiber.Map{"items": []interface{}{}})
	}

	rows, err := db.DB.Query(context.Background(), `
		SELECT product_id, quantity FROM cart_items WHERE cart_id=$1
	`, cartID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener carrito"})
	}
	defer rows.Close()

	items := []fiber.Map{}
	for rows.Next() {
		var productID string
		var quantity int
		if err := rows.Scan(&productID, &quantity); err != nil {
			continue
		}
		items = append(items, fiber.Map{
			"product_id": productID,
			"quantity":   quantity,
		})
	}
	return c.JSON(fiber.Map{"items": items})
}

// POST /api/cart
func SaveCart(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))

	var req SaveCartRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	tx, err := db.DB.Begin(context.Background())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error interno"})
	}
	defer tx.Rollback(context.Background())

	var cartID string
	err = tx.QueryRow(context.Background(), `
		INSERT INTO carts (user_id) VALUES ($1)
		ON CONFLICT (user_id) DO UPDATE SET updated_at=NOW()
		RETURNING id
	`, userID).Scan(&cartID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear/obtener carrito"})
	}

	_, err = tx.Exec(context.Background(), "DELETE FROM cart_items WHERE cart_id=$1", cartID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo limpiar carrito"})
	}

	for _, item := range req.Items {
		if item.Quantity < 1 {
			continue
		}
		_, err = tx.Exec(context.Background(), `
			INSERT INTO cart_items (cart_id, product_id, quantity)
			VALUES ($1, $2, $3)
			ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity
		`, cartID, item.ProductID, item.Quantity)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "No se pudo guardar producto en carrito"})
		}
	}

	if err := tx.Commit(context.Background()); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al guardar carrito"})
	}
	return c.JSON(fiber.Map{"success": true})
}

// GetCartPublic versión pública que devuelve carrito vacío si no hay usuario autenticado
func GetCartPublic(c *fiber.Ctx) error {
	// Verificar si hay usuario autenticado
	user := c.Locals("user")
	if user == nil {
		// Si no hay usuario autenticado, devolver carrito vacío
		return c.JSON(fiber.Map{"items": []interface{}{}})
	}

	// Si hay usuario autenticado, usar la función original
	return GetCart(c)
}

// SaveCartPublic versión pública que maneja el guardado del carrito
func SaveCartPublic(c *fiber.Ctx) error {
	// Verificar si hay usuario autenticado
	user := c.Locals("user")
	if user == nil {
		// Si no hay usuario autenticado, devolver error 401
		return c.Status(401).JSON(fiber.Map{
			"error":   "Usuario no autenticado",
			"message": "Se requiere autenticación para guardar el carrito",
		})
	}

	// Si hay usuario autenticado, usar la función original
	return SaveCart(c)
}
