package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/posoqo/backend/internal/db"
)

type CategoryRequest struct {
	Name     string `json:"name"`
	ParentID string `json:"parent_id,omitempty"`
}

type CategoryResponse struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	ParentID  *string `json:"parent_id,omitempty"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

// ListCategories devuelve todas las categorías
func ListCategories(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(), 
		"SELECT id, name, parent_id, created_at, updated_at FROM categories ORDER BY parent_id NULLS FIRST, name")
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener categorías"})
	}
	defer rows.Close()

	var categories []CategoryResponse
	for rows.Next() {
		var cat CategoryResponse
		var parentID *string
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&cat.ID, &cat.Name, &parentID, &createdAt, &updatedAt); err != nil {
			continue
		}
		cat.ParentID = parentID
		cat.CreatedAt = createdAt.Format("2006-01-02T15:04:05Z")
		cat.UpdatedAt = updatedAt.Format("2006-01-02T15:04:05Z")
		categories = append(categories, cat)
	}
	
	return c.JSON(fiber.Map{
		"success": true,
		"data": categories,
		"total": len(categories),
	})
}

// Obtener categorías con sus subcategorías
func GetCategoriesWithSubcategories(c *fiber.Ctx) error {
	// Obtener categorías padre
	parentRows, err := db.DB.Query(context.Background(), 
		"SELECT id, name, created_at, updated_at FROM categories WHERE parent_id IS NULL ORDER BY name")
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener categorías padre"})
	}
	defer parentRows.Close()

	var categories []fiber.Map
	for parentRows.Next() {
		var id, name string
		var createdAt, updatedAt time.Time
		if err := parentRows.Scan(&id, &name, &createdAt, &updatedAt); err != nil {
			continue
		}

		// Obtener subcategorías de esta categoría padre
		subRows, err := db.DB.Query(context.Background(), 
			"SELECT id, name, created_at, updated_at FROM categories WHERE parent_id = $1 ORDER BY name", id)
		if err != nil {
			continue
		}

		var subcategories []CategoryResponse
		for subRows.Next() {
			var subCat CategoryResponse
			var subCreatedAt, subUpdatedAt time.Time
			if err := subRows.Scan(&subCat.ID, &subCat.Name, &subCreatedAt, &subUpdatedAt); err != nil {
				continue
			}
			subCat.ParentID = &id
			subCat.CreatedAt = subCreatedAt.Format("2006-01-02T15:04:05Z")
			subCat.UpdatedAt = subUpdatedAt.Format("2006-01-02T15:04:05Z")
			subcategories = append(subcategories, subCat)
		}
		subRows.Close()

		categories = append(categories, fiber.Map{
			"id": id,
			"name": name,
			"created_at": createdAt.Format("2006-01-02T15:04:05Z"),
			"updated_at": updatedAt.Format("2006-01-02T15:04:05Z"),
			"subcategories": subcategories,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": categories,
		"total": len(categories),
	})
}

// Crear una nueva categoría (padre o subcategoría)
func CreateCategory(c *fiber.Ctx) error {
	var req CategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "El nombre es obligatorio"})
	}

	var err error
	var categoryID string

	if req.ParentID != "" {
		// Crear subcategoría
		// Verificar que la categoría padre existe
		var exists bool
		err = db.DB.QueryRow(context.Background(), 
			"SELECT EXISTS(SELECT 1 FROM categories WHERE id = $1)", req.ParentID).Scan(&exists)
		if err != nil || !exists {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "La categoría padre no existe"})
		}

		err = db.DB.QueryRow(context.Background(), 
			"INSERT INTO categories (name, parent_id) VALUES ($1, $2) RETURNING id", 
			req.Name, req.ParentID).Scan(&categoryID)
	} else {
		// Crear categoría padre
		err = db.DB.QueryRow(context.Background(), 
			"INSERT INTO categories (name) VALUES ($1) RETURNING id", req.Name).Scan(&categoryID)
	}

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Ya existe una categoría con ese nombre"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo crear la categoría"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Categoría creada exitosamente",
		"id": categoryID,
	})
}

// Editar categoría
func UpdateCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var req CategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "El nombre es obligatorio"})
	}

	// Verificar que la categoría existe
	var exists bool
	err := db.DB.QueryRow(context.Background(), 
		"SELECT EXISTS(SELECT 1 FROM categories WHERE id = $1)", id).Scan(&exists)
	if err != nil || !exists {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Categoría no encontrada"})
	}

	// Si se está cambiando el parent_id, verificar que la nueva categoría padre existe
	if req.ParentID != "" {
		var parentExists bool
		err = db.DB.QueryRow(context.Background(), 
			"SELECT EXISTS(SELECT 1 FROM categories WHERE id = $1)", req.ParentID).Scan(&parentExists)
		if err != nil || !parentExists {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "La nueva categoría padre no existe"})
		}

		// Evitar referencias circulares
		if req.ParentID == id {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Una categoría no puede ser padre de sí misma"})
		}

		_, err = db.DB.Exec(context.Background(), 
			"UPDATE categories SET name=$1, parent_id=$2 WHERE id=$3", req.Name, req.ParentID, id)
	} else {
		_, err = db.DB.Exec(context.Background(), 
			"UPDATE categories SET name=$1, parent_id=NULL WHERE id=$2", req.Name, id)
	}

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Ya existe una categoría con ese nombre"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar la categoría"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Categoría actualizada exitosamente",
	})
}

// Eliminar categoría
func DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("id")

	// Verificar que la categoría existe
	var exists bool
	err := db.DB.QueryRow(context.Background(), 
		"SELECT EXISTS(SELECT 1 FROM categories WHERE parent_id = $1)", id).Scan(&exists)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al verificar categoría"})
	}

	// Iniciar transacción
	tx, err := db.DB.Begin(context.Background())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al iniciar transacción"})
	}
	defer tx.Rollback(context.Background())

	// Eliminar productos asociados a la categoría principal
	if _, err := tx.Exec(context.Background(), 
		"DELETE FROM products WHERE category_id = $1", id); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al eliminar productos de categoría principal"})
	}

	// Eliminar productos asociados a subcategorías
	if _, err := tx.Exec(context.Background(), 
		"DELETE FROM products WHERE category_id IN (SELECT id FROM categories WHERE parent_id = $1)", id); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al eliminar productos de subcategorías"})
	}

	// Eliminar subcategorías
	if _, err := tx.Exec(context.Background(), 
		"DELETE FROM categories WHERE parent_id = $1", id); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al eliminar subcategorías"})
	}

	// Eliminar la categoría principal
	if _, err := tx.Exec(context.Background(), 
		"DELETE FROM categories WHERE id = $1", id); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al eliminar categoría principal"})
	}

	// Confirmar transacción
	if err := tx.Commit(context.Background()); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al confirmar transacción"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Categoría y todas sus subcategorías eliminadas exitosamente",
	})
}
