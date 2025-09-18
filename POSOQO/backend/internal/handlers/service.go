package handlers

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/posoqo/backend/internal/db"
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
		fmt.Println("ERROR AL CONSULTAR SERVICIOS:", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error consultando servicios: " + err.Error(),
		})
	}
	defer rows.Close()

	var services []ServiceResponse
	for rows.Next() {
		var s Service
		err := rows.Scan(&s.ID, &s.Name, &s.Description, &s.Image, &s.IsActive, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			fmt.Println("ERROR AL LEER SERVICIO:", err)
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"error":   "Error leyendo servicio: " + err.Error(),
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
		fmt.Println("ERROR AL LEER SERVICIO POR ID:", err)
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
	_, err := db.DB.Exec(context.Background(),
		`DELETE FROM services WHERE id=$1`, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo eliminar el servicio"})
	}
	return c.JSON(fiber.Map{"message": "Servicio eliminado"})
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
