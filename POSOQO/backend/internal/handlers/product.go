package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
	"github.com/posoqo/backend/internal/db"
)

// Product representa un producto de cerveza artesanal
// id, category_id, subcategory son uuid (string en Go)
type Product struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Price       float64        `json:"price"`
	Image       sql.NullString `json:"-"` // No exponer directamente
	CategoryID  sql.NullString `json:"-"`
	IsActive    bool           `json:"is_active"`
	IsFeatured  bool           `json:"is_featured"`
	Stock       int            `json:"stock"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Subcategory sql.NullString `json:"-"`
	Estilo      sql.NullString `json:"-"`
	ABV         sql.NullString `json:"-"`
	IBU         sql.NullString `json:"-"`
	Color       sql.NullString `json:"-"`
}

type ProductResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	ImageURL    string    `json:"image_url"`
	CategoryID  string    `json:"category_id"`
	IsActive    bool      `json:"is_active"`
	IsFeatured  bool      `json:"is_featured"`
	Stock       int       `json:"stock"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Subcategory string    `json:"subcategory"`
	Estilo      string    `json:"estilo"`
	ABV         string    `json:"abv"`
	IBU         string    `json:"ibu"`
	Color       string    `json:"color"`
}

// GetProducts devuelve todos los productos desde la base de datos
func GetProducts(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(), `
		SELECT id, name, description, price, image_url, category_id, is_active, is_featured, stock, created_at, updated_at, subcategory, estilo, abv, ibu, color
		FROM products
		WHERE is_active = true
		ORDER BY id
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error consultando productos: " + err.Error(),
		})
	}
	defer rows.Close()

	var products []ProductResponse
	for rows.Next() {
		var id, name, description, categoryID string
		var imageURL, subcategory, estilo, abv, ibu, color sql.NullString
		var price float64
		var isActive, isFeatured bool
		var createdAt, updatedAt time.Time
		var stock int
		
		err := rows.Scan(
			&id, &name, &description, &price, &imageURL,
			&categoryID, &isActive, &isFeatured, &stock, &createdAt, &updatedAt, &subcategory,
			&estilo, &abv, &ibu, &color,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Error leyendo producto: " + err.Error(),
			})
		}
		products = append(products, ProductResponse{
			ID:          id,
			Name:        name,
			Description: description,
			Price:       price,
			ImageURL:    imageURL.String,
			CategoryID:  categoryID,
			IsActive:    isActive,
			IsFeatured:  isFeatured,
			Stock:       stock,
			CreatedAt:   createdAt,
			UpdatedAt:   updatedAt,
			Subcategory: subcategory.String,
			Estilo:      estilo.String,
			ABV:         abv.String,
			IBU:         ibu.String,
			Color:       color.String,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    products,
		"total":   len(products),
	})
}

// GetProduct devuelve un producto específico por ID desde la base de datos
func GetProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var p Product
	err := db.DB.QueryRow(context.Background(), `
		SELECT id, name, description, price, image_url, category_id, is_active, is_featured, stock, created_at, updated_at, subcategory, estilo, abv, ibu, color
		FROM products
		WHERE id = $1
	`, id).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Image,
		&p.CategoryID, &p.IsActive, &p.IsFeatured, &p.Stock, &p.CreatedAt, &p.UpdatedAt, &p.Subcategory,
		&p.Estilo, &p.ABV, &p.IBU, &p.Color,
	)
	if err != nil {
		fmt.Println("ERROR AL LEER PRODUCTO POR ID:", err)
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"error":   "Producto no encontrado",
		})
	}
	resp := ProductResponse{
		ID:          p.ID,
		Name:        p.Name,
		Description: p.Description,
		Price:       p.Price,
		ImageURL:    nullableToString(p.Image),
		CategoryID:  nullableToString(p.CategoryID),
		IsActive:    p.IsActive,
		IsFeatured:  p.IsFeatured,
		Stock:       p.Stock,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
		Subcategory: nullableToString(p.Subcategory),
		Estilo:      nullableToString(p.Estilo),
		ABV:         nullableToString(p.ABV),
		IBU:         nullableToString(p.IBU),
		Color:       nullableToString(p.Color),
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    resp,
	})
}

// Crear producto
func CreateProduct(c *fiber.Ctx) error {
	var req struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		ImageURL    string  `json:"image_url"`
		CategoryID  string  `json:"category_id"`
		Subcategory string  `json:"subcategory"`
		Estilo      string  `json:"estilo"`
		ABV         string  `json:"abv"`
		IBU         string  `json:"ibu"`
		Color       string  `json:"color"`
		Stock       int     `json:"stock"`
		IsFeatured  bool    `json:"is_featured"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var categoryID sql.NullString
	if req.CategoryID != "" {
		categoryID = sql.NullString{String: req.CategoryID, Valid: true}
	} else {
		categoryID = sql.NullString{Valid: false}
	}

	var subcategoryID sql.NullString
	if req.Subcategory != "" {
		subcategoryID = sql.NullString{String: req.Subcategory, Valid: true}
	} else {
		subcategoryID = sql.NullString{Valid: false}
	}
	id := ""
	err := db.DB.QueryRow(context.Background(),
		`INSERT INTO products (name, description, price, image_url, category_id, subcategory, estilo, abv, ibu, color, stock, is_active, is_featured, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, NOW(), NOW()) RETURNING id`,
		req.Name, req.Description, req.Price, req.ImageURL, categoryID, subcategoryID, req.Estilo, req.ABV, req.IBU, req.Color, req.Stock, req.IsFeatured).Scan(&id)
	if err != nil {
		fmt.Printf("❌ [CREATE] Error creando producto: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear el producto: " + err.Error()})
	}

	fmt.Printf("✅ [CREATE] Producto creado exitosamente con ID: %s\n", id)
	return c.JSON(fiber.Map{"success": true, "message": "Producto creado", "id": id})
}

// Editar producto
func UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		ImageURL    string  `json:"image_url"`
		CategoryID  string  `json:"category_id"`
		Subcategory string  `json:"subcategory"`
		Estilo      string  `json:"estilo"`
		ABV         string  `json:"abv"`
		IBU         string  `json:"ibu"`
		Color       string  `json:"color"`
		Stock       int     `json:"stock"`
		IsActive    bool    `json:"is_active"`
		IsFeatured  bool    `json:"is_featured"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	var categoryID sql.NullString
	if req.CategoryID != "" {
		categoryID = sql.NullString{String: req.CategoryID, Valid: true}
	} else {
		categoryID = sql.NullString{Valid: false}
	}

	var subcategoryID sql.NullString
	if req.Subcategory != "" {
		subcategoryID = sql.NullString{String: req.Subcategory, Valid: true}
	} else {
		subcategoryID = sql.NullString{Valid: false}
	}


	_, err := db.DB.Exec(context.Background(),
		`UPDATE products SET name=$1, description=$2, price=$3, image_url=$4, category_id=$5, subcategory=$6, estilo=$7, abv=$8, ibu=$9, color=$10, stock=$11, is_active=$12, is_featured=$13, updated_at=NOW() WHERE id=$14`,
		req.Name, req.Description, req.Price, req.ImageURL, categoryID, subcategoryID, req.Estilo, req.ABV, req.IBU, req.Color, req.Stock, req.IsActive, req.IsFeatured, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al actualizar producto"})
	}

	// Crear notificación automática
	title := "Producto actualizado"
	message := fmt.Sprintf("El producto %s ha sido actualizado", req.Name)
	_, err = db.DB.Exec(context.Background(),
		`INSERT INTO notifications (title, message, type, is_read, created_at)
		 VALUES ($1, $2, $3, false, NOW())`,
		title, message, "info")

	if err != nil {
		fmt.Printf("Error creando notificación: %v\n", err)
	}

	return c.JSON(fiber.Map{"success": true, "message": "Producto actualizado"})
}

// Eliminar producto
func DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := db.DB.Exec(context.Background(),
		`DELETE FROM products WHERE id=$1`, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo eliminar el producto"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Producto eliminado"})
}

// GetAllProductsAdmin devuelve todos los productos (activos e inactivos) para el panel admin
func GetAllProductsAdmin(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(), `
		SELECT id, name, description, price, image_url, category_id, is_active, is_featured, stock, created_at, updated_at, subcategory, estilo, abv, ibu, color
		FROM products
		ORDER BY id
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error consultando productos: " + err.Error(),
		})
	}
	defer rows.Close()

	var products []ProductResponse
	for rows.Next() {
		var p Product
		err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.Price, &p.Image,
			&p.CategoryID, &p.IsActive, &p.IsFeatured, &p.Stock, &p.CreatedAt, &p.UpdatedAt, &p.Subcategory,
			&p.Estilo, &p.ABV, &p.IBU, &p.Color,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Error leyendo producto: " + err.Error(),
			})
		}
		products = append(products, ProductResponse{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Price:       p.Price,
			ImageURL:    nullableToString(p.Image),
			CategoryID:  nullableToString(p.CategoryID),
			IsActive:    p.IsActive,
			IsFeatured:  p.IsFeatured,
			Stock:       p.Stock,
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
			Subcategory: nullableToString(p.Subcategory),
			Estilo:      nullableToString(p.Estilo),
			ABV:         nullableToString(p.ABV),
			IBU:         nullableToString(p.IBU),
			Color:       nullableToString(p.Color),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    products,
		"total":   len(products),
	})
}

func nullableToString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

// GetFeaturedProducts devuelve productos destacados por categoría
func GetFeaturedProducts(c *fiber.Ctx) error {
	categoryID := c.Query("category_id")
	fmt.Printf("🔍 [FEATURED] Consultando productos destacados con category_id: %s\n", categoryID)

	query := `
		SELECT id, name, description, price, image_url, category_id, is_active, is_featured, stock, created_at, updated_at, subcategory, estilo, abv, ibu, color
		FROM products
		WHERE is_active = true AND is_featured = true
	`

	var rows pgx.Rows
	var err error

	if categoryID != "" {
		query += ` AND category_id = $1`
		fmt.Printf("🔍 [FEATURED] Query con filtro: %s\n", query)
		rows, err = db.DB.Query(context.Background(), query, categoryID)
	} else {
		fmt.Printf("🔍 [FEATURED] Query sin filtro: %s\n", query)
		rows, err = db.DB.Query(context.Background(), query)
	}

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error consultando productos destacados: " + err.Error(),
		})
	}
	defer rows.Close()

	var products []ProductResponse
	for rows.Next() {
		var p Product
		err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.Price, &p.Image,
			&p.CategoryID, &p.IsActive, &p.IsFeatured, &p.Stock, &p.CreatedAt, &p.UpdatedAt, &p.Subcategory,
			&p.Estilo, &p.ABV, &p.IBU, &p.Color,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Error leyendo producto destacado: " + err.Error(),
			})
		}
		products = append(products, ProductResponse{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Price:       p.Price,
			ImageURL:    nullableToString(p.Image),
			CategoryID:  nullableToString(p.CategoryID),
			IsActive:    p.IsActive,
			IsFeatured:  p.IsFeatured,
			Stock:       p.Stock,
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
			Subcategory: nullableToString(p.Subcategory),
			Estilo:      nullableToString(p.Estilo),
			ABV:         nullableToString(p.ABV),
			IBU:         nullableToString(p.IBU),
			Color:       nullableToString(p.Color),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    products,
		"total":   len(products),
	})
}
