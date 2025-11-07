package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/url"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/services"
)

// Service representa un servicio de POSOQO
type Service struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Image       sql.NullString `json:"-"`
	Features    []string       `json:"-"`
	IsActive    bool           `json:"is_active"`
	CreatedAt   sql.NullTime   `json:"-"`
	UpdatedAt   sql.NullTime   `json:"-"`
}

type ServiceResponse struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Image       string   `json:"image_url"`
	IsActive    bool     `json:"is_active"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
	Features    []string `json:"features"`
}

// GetServices devuelve todos los servicios desde la base de datos
func GetServices(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(), `
		SELECT id, name, description, image_url, is_active, created_at, updated_at
		FROM services
		WHERE is_active = true
		ORDER BY id
	`)
	if err != nil {
		log.Printf("[ERROR] Error consultando servicios: %v", err)
		isProduction := os.Getenv("NODE_ENV") == "production"
		errorMsg := "Error al obtener servicios"
		if !isProduction {
			errorMsg = "Error consultando servicios: " + err.Error()
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   errorMsg,
		})
	}
	defer rows.Close()

	var services []ServiceResponse
	for rows.Next() {
		var s Service
		err := rows.Scan(&s.ID, &s.Name, &s.Description, &s.Image, &s.IsActive, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			log.Printf("[ERROR] Error leyendo servicio: %v", err)
			isProduction := os.Getenv("NODE_ENV") == "production"
			errorMsg := "Error al leer servicio"
			if !isProduction {
				errorMsg = "Error leyendo servicio: " + err.Error()
			}
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   errorMsg,
			})
		}
		services = append(services, ServiceResponse{
			ID:          s.ID,
			Name:        s.Name,
			Description: s.Description,
			Image:       nullableString(s.Image),
			IsActive:    s.IsActive,
			CreatedAt:   nullableTimeToString(s.CreatedAt),
			UpdatedAt:   nullableTimeToString(s.UpdatedAt),
			Features:    []string{}, // Array vacío ya que no existe la columna
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    services,
		"total":   len(services),
	})
}

// GetService devuelve un servicio específico por ID desde la base de datos
func GetService(c *fiber.Ctx) error {
	id := c.Params("id")
	var s Service
	err := db.DB.QueryRow(context.Background(), `
		SELECT id, name, description, image_url, is_active, created_at, updated_at
		FROM services
		WHERE id = $1 AND is_active = true
	`, id).Scan(&s.ID, &s.Name, &s.Description, &s.Image, &s.IsActive, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		log.Printf("[ERROR] Error al leer servicio por ID: %v", err)
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"error":   "Servicio no encontrado",
		})
	}
	resp := ServiceResponse{
		ID:          s.ID,
		Name:        s.Name,
		Description: s.Description,
		Image:       nullableString(s.Image),
		IsActive:    s.IsActive,
		CreatedAt:   nullableTimeToString(s.CreatedAt),
		UpdatedAt:   nullableTimeToString(s.UpdatedAt),
		Features:    []string{}, // Array vacío ya que no existe la columna
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    resp,
	})
}

// Crear servicio
func CreateService(c *fiber.Ctx) error {
	var req struct {
		Name        string   `json:"name"`
		Description string   `json:"description"`
		ImageURL    string   `json:"image_url"`
		Features    []string `json:"features"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	id := ""
	err := db.DB.QueryRow(context.Background(),
		`INSERT INTO services (name, description, image_url, is_active, created_at, updated_at)
		 VALUES ($1, $2, $3, true, NOW(), NOW()) RETURNING id`,
		req.Name, req.Description, req.ImageURL).Scan(&id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear el servicio"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Servicio creado", "id": id})
}

// Editar servicio
func UpdateService(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		ImageURL    string `json:"image_url"`
		IsActive    bool   `json:"is_active"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	_, err := db.DB.Exec(context.Background(),
		`UPDATE services SET name=$1, description=$2, image_url=$3, is_active=$4, updated_at=NOW() WHERE id=$5`,
		req.Name, req.Description, req.ImageURL, req.IsActive, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo actualizar el servicio"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Servicio actualizado"})
}

// Eliminar servicio
func DeleteService(c *fiber.Ctx) error {
	id := c.Params("id")
	fmt.Printf("DELETE SERVICE: Intentando eliminar servicio con ID: %s\n", id)

	// Obtener image_url antes de eliminar
	var imageURL sql.NullString
	_ = db.DB.QueryRow(context.Background(), `SELECT image_url FROM services WHERE id=$1`, id).Scan(&imageURL)

	// Si es URL de Cloudinary, intentar eliminar el recurso
	if imageURL.Valid && imageURL.String != "" {
		if isCloudinaryURL(imageURL.String) {
			// extraer public_id si es posible
			if publicID, ok := extractCloudinaryPublicID(imageURL.String); ok {
				_ = services.DeleteImage(context.Background(), publicID)
			}
		}
	}

	result, err := db.DB.Exec(context.Background(),
		`DELETE FROM services WHERE id=$1`, id)
	if err != nil {
		fmt.Printf("ERROR DELETE SERVICE: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo eliminar el servicio: " + err.Error()})
	}

	rowsAffected := result.RowsAffected()
	fmt.Printf("DELETE SERVICE: %d filas afectadas\n", rowsAffected)

	if rowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Servicio no encontrado"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Servicio eliminado"})
}

func isCloudinaryURL(raw string) bool {
	u, err := url.Parse(raw)
	if err != nil {
		return false
	}
	return u.Host == "res.cloudinary.com" || u.Host == "cloudinary.com"
}

func extractCloudinaryPublicID(raw string) (string, bool) {
	// URL típica: https://res.cloudinary.com/<cloud>/image/upload/v12345/<public_id>.<ext>
	u, err := url.Parse(raw)
	if err != nil {
		return "", false
	}
	// u.Path tiene formato /<cloudinary-path>/...; tomamos el último segmento sin extensión
	path := u.Path
	if path == "" {
		return "", false
	}
	// último segmento
	idx := len(path) - 1
	for idx >= 0 && path[idx] != '/' {
		idx--
	}
	last := path[idx+1:]
	if last == "" {
		return "", false
	}
	// quitar extensión
	for i := len(last) - 1; i >= 0; i-- {
		if last[i] == '.' {
			last = last[:i]
			break
		}
	}
	return last, true
}

func nullableString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

func nullableTimeToString(nt sql.NullTime) string {
	if nt.Valid {
		return nt.Time.Format("2006-01-02 15:04:05")
	}
	return ""
}
