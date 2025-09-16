package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/posoqo/backend/internal/db"
)

// Agregar producto a favoritos
func AddFavorite(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))
	
	// Obtener product_id del body o de los parámetros
	var requestBody struct {
		ProductID string `json:"product_id"`
	}
	
	// Intentar obtener del body primero
	if err := c.BodyParser(&requestBody); err != nil {
		// Si no hay body, intentar obtener de los parámetros
		requestBody.ProductID = c.Params("product_id")
	}
	
	if requestBody.ProductID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "product_id es requerido"})
	}
	
	_, err := db.DB.Exec(context.Background(),
		"INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
		userID, requestBody.ProductID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo agregar a favoritos"})
	}
	return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "Agregado a favoritos"})
}

// Quitar producto de favoritos
func RemoveFavorite(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))
	productID := c.Params("product_id")
	
	if productID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "product_id es requerido"})
	}
	
	_, err := db.DB.Exec(context.Background(),
		"DELETE FROM favorites WHERE user_id=$1 AND product_id=$2",
		userID, productID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo quitar de favoritos"})
	}
	return c.JSON(fiber.Map{"message": "Quitado de favoritos"})
}

// Listar favoritos del usuario
func ListFavorites(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))
	
	rows, err := db.DB.Query(context.Background(),
		`SELECT p.id, p.name, p.description, p.price, p.image_url, p.category_id, p.is_active, p.created_at, p.updated_at
		 FROM favorites f
		 JOIN products p ON f.product_id = p.id
		 WHERE f.user_id = $1
		 ORDER BY f.created_at DESC`, userID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener favoritos"})
	}
	defer rows.Close()

	products := []fiber.Map{}
	for rows.Next() {
		var id, name, description, imageURL, categoryID string
		var price float64
		var isActive bool
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &name, &description, &price, &imageURL, &categoryID, &isActive, &createdAt, &updatedAt); err != nil {
			continue
		}
		products = append(products, fiber.Map{
			"id":          id,
			"name":        name,
			"description": description,
			"price":       price,
			"image_url":   imageURL,
			"category_id": categoryID,
			"is_active":   isActive,
			"created_at":  createdAt.Format("2006-01-02T15:04:05Z07:00"),
			"updated_at":  updatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}
	
	// Devolver en el formato esperado por el frontend
	return c.JSON(fiber.Map{
		"data": products,
		"message": "Favoritos obtenidos correctamente",
	})
}

// ListFavoritesPublic versión pública que devuelve favoritos vacíos si no hay usuario autenticado
func ListFavoritesPublic(c *fiber.Ctx) error {
	// Verificar si hay usuario autenticado
	user := c.Locals("user")
	if user == nil {
		// Si no hay usuario autenticado, devolver array vacío
		return c.JSON([]interface{}{})
	}

	// Si hay usuario autenticado, usar la función original
	return ListFavorites(c)
}
