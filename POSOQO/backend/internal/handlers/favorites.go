package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/posoqo/backend/internal/db"
)

type Favorite struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	ProductID string    `json:"product_id"`
	CreatedAt time.Time `json:"created_at"`
}

type FavoriteWithProduct struct {
	ID        int64           `json:"id"`
	UserID    int64           `json:"user_id"`
	ProductID string          `json:"product_id"`
	CreatedAt time.Time       `json:"created_at"`
	Product   ProductResponse `json:"product"`
}

// GetFavorites obtiene todos los favoritos de un usuario
func GetFavorites(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))

	fmt.Printf("🔍 [FAVORITES] Obteniendo favoritos para usuario: %d\n", userID)

	query := `
		SELECT f.id, f.user_id, f.product_id, f.created_at,
		       p.id, p.name, p.description, p.price, p.image_url, p.category_id, p.is_active, p.created_at, p.updated_at
		FROM favorites f
		JOIN products p ON f.product_id = p.id
		WHERE f.user_id = $1
		ORDER BY f.created_at DESC
	`

	fmt.Printf("🔍 [FAVORITES] Ejecutando query: %s\n", query)

	rows, err := db.DB.Query(context.Background(), query, userID)
	if err != nil {
		fmt.Printf("❌ [FAVORITES] Error en query: %v\n", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Error obteniendo favoritos: " + err.Error(),
		})
	}
	defer rows.Close()

	var favorites []FavoriteWithProduct
	for rows.Next() {
		var fav FavoriteWithProduct
		var p Product
		err := rows.Scan(
			&fav.ID, &fav.UserID, &fav.ProductID, &fav.CreatedAt,
			&p.ID, &p.Name, &p.Description, &p.Price, &p.Image,
			&p.CategoryID, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			fmt.Printf("❌ [FAVORITES] Error escaneando fila: %v\n", err)
			continue
		}
		fav.Product = ProductResponse{
			ID:            p.ID,
			Name:          p.Name,
			Description:   p.Description,
			Price:         p.Price,
			ImageURL:      nullableToString(p.Image),
			CategoryID:    nullableToString(p.CategoryID),
			IsActive:      p.IsActive,
			IsFeatured:    false, // Campo no existe en la BD, usar valor por defecto
			Stock:         0,     // Campo no existe en la BD, usar valor por defecto
			CreatedAt:     p.CreatedAt,
			UpdatedAt:     p.UpdatedAt,
			Subcategory:   "", // Campo no existe en la BD, usar valor por defecto
			Estilo:        "", // Campo no existe en la BD, usar valor por defecto
			ABV:           "", // Campo no existe en la BD, usar valor por defecto
			IBU:           "", // Campo no existe en la BD, usar valor por defecto
			Color:         "", // Campo no existe en la BD, usar valor por defecto
		}
		favorites = append(favorites, fav)
	}

	fmt.Printf("✅ [FAVORITES] Encontrados %d favoritos\n", len(favorites))

	return c.JSON(fiber.Map{
		"success": true,
		"data":    favorites,
	})
}

// AddToFavorites agrega un producto a favoritos
func AddToFavorites(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))

	var req struct {
		ProductID string `json:"product_id"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	// Verificar si el producto existe
	var productID string
	err := db.DB.QueryRow(context.Background(), "SELECT id FROM products WHERE id = $1 AND is_active = true", req.ProductID).Scan(&productID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Producto no encontrado",
		})
	}

	// Verificar si ya está en favoritos
	var existingID int64
	err = db.DB.QueryRow(context.Background(), "SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2", userID, req.ProductID).Scan(&existingID)
	if err == nil {
		return c.Status(http.StatusConflict).JSON(fiber.Map{
			"success": false,
			"error":   "Producto ya está en favoritos",
		})
	}

	// Agregar a favoritos
	_, err = db.DB.Exec(context.Background(), "INSERT INTO favorites (user_id, product_id) VALUES ($1, $2)", userID, req.ProductID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Error agregando a favoritos",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Producto agregado a favoritos",
	})
}

// RemoveFromFavorites remueve un producto de favoritos
func RemoveFromFavorites(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))
	productID := c.Params("product_id")

	// Verificar si existe en favoritos
	var existingID int64
	err := db.DB.QueryRow(context.Background(), "SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2", userID, productID).Scan(&existingID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Producto no encontrado en favoritos",
		})
	}

	// Remover de favoritos
	_, err = db.DB.Exec(context.Background(), "DELETE FROM favorites WHERE user_id = $1 AND product_id = $2", userID, productID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Error removiendo de favoritos",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Producto removido de favoritos",
	})
}

// CheckFavorite verifica si un producto está en favoritos
func CheckFavorite(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))
	productID := c.Params("product_id")

	var existingID int64
	err := db.DB.QueryRow(context.Background(), "SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2", userID, productID).Scan(&existingID)

	isFavorite := err == nil

	return c.JSON(fiber.Map{
		"success":     true,
		"is_favorite": isFavorite,
	})
}
