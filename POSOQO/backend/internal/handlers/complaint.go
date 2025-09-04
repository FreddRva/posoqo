package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/microcosm-cc/bluemonday"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/utils"
)

type ComplaintRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Text  string `json:"text"`
}

type UpdateComplaintStatusRequest struct {
	Status string `json:"status"`
}

var allowedComplaintStatuses = map[string]bool{
	"pendiente": true,
	"atendido":  true,
	"archivado": true,
}

// Crear reclamo (público)
func CreateComplaint(c *fiber.Ctx) error {
	var req ComplaintRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	if !utils.IsValidName(req.Name, 2, 50) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Nombre inválido (solo letras, 2-50 caracteres)"})
	}
	if !utils.IsValidEmail(req.Email) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Email inválido"})
	}
	if !utils.IsValidString(req.Text, 10, 1000) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Texto del reclamo inválido (10-1000 caracteres)"})
	}
	p := bluemonday.UGCPolicy()
	safeText := p.Sanitize(strings.TrimSpace(req.Text))
	_, err := db.DB.Exec(context.Background(),
		`INSERT INTO complaints (name, email, text) VALUES ($1, $2, $3)`,
		strings.TrimSpace(req.Name), strings.TrimSpace(req.Email), safeText)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo registrar el reclamo"})
	}

	// Crear notificación para el admin
	adminNotificationTitle := "Nuevo Reclamo"
	// Limitar el texto a 100 caracteres para la notificación
	notificationText := safeText
	if len(safeText) > 100 {
		notificationText = safeText[:100] + "..."
	}
	adminNotificationMessage := fmt.Sprintf("Nuevo reclamo de %s (%s): %s", req.Name, req.Email, notificationText)
	CreateAutomaticNotification("warning", adminNotificationTitle, adminNotificationMessage, nil, nil)

	return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "Reclamo registrado"})
}

// Listar reclamos (solo admin)
func ListComplaints(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	countQuery := "SELECT COUNT(*) FROM complaints"
	var total int
	if err := db.DB.QueryRow(context.Background(), countQuery).Scan(&total); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar reclamos"})
	}
	offset := (page - 1) * limit
	listQuery := `SELECT id, name, email, text, status, created_at, updated_at FROM complaints ORDER BY created_at DESC LIMIT $1 OFFSET $2`
	rows, err := db.DB.Query(context.Background(), listQuery, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener reclamos"})
	}
	defer rows.Close()

	reclamos := []fiber.Map{}
	for rows.Next() {
		var id, name, email, text, status string
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &name, &email, &text, &status, &createdAt, &updatedAt); err != nil {
			continue
		}
		reclamos = append(reclamos, fiber.Map{
			"id":         id,
			"name":       name,
			"email":      email,
			"text":       text,
			"status":     status,
			"created_at": createdAt,
			"updated_at": updatedAt,
		})
	}
	return c.JSON(fiber.Map{
		"complaints": reclamos,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (total + limit - 1) / limit,
		},
	})
}

// Cambiar estado del reclamo (solo admin)
func UpdateComplaintStatus(c *fiber.Ctx) error {
	complaintID := c.Params("id")
	var req UpdateComplaintStatusRequest
	if err := c.BodyParser(&req); err != nil || !allowedComplaintStatuses[req.Status] {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos o estado no permitido"})
	}

	// Obtener información del reclamo antes de actualizar
	var name, email, text string
	err := db.DB.QueryRow(context.Background(),
		"SELECT name, email, text FROM complaints WHERE id = $1",
		complaintID).Scan(&name, &email, &text)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Reclamo no encontrado"})
	}

	res, err := db.DB.Exec(context.Background(),
		"UPDATE complaints SET status=$1, updated_at=NOW() WHERE id=$2",
		req.Status, complaintID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar el estado"})
	}
	if res.RowsAffected() == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Reclamo no encontrado"})
	}

	// Crear notificación para el admin
	adminNotificationTitle := "Reclamo Actualizado"
	adminNotificationMessage := fmt.Sprintf("Reclamo de %s (%s) ha sido %s", name, email, req.Status)
	CreateAutomaticNotification("info", adminNotificationTitle, adminNotificationMessage, nil, nil)

	return c.JSON(fiber.Map{"message": "Estado actualizado"})
}

// Listar mis reclamos (opcional, si el usuario está autenticado)
func ListMyComplaints(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	email := claims["email"].(string)
	rows, err := db.DB.Query(context.Background(),
		`SELECT id, name, email, text, status, created_at, updated_at FROM complaints WHERE email=$1 ORDER BY created_at DESC`, email)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener reclamos"})
	}
	defer rows.Close()

	complaints := []fiber.Map{}
	for rows.Next() {
		var id, name, email, text, status string
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &name, &email, &text, &status, &createdAt, &updatedAt); err != nil {
			continue
		}
		complaints = append(complaints, fiber.Map{
			"id":         id,
			"name":       name,
			"email":      email,
			"text":       text,
			"status":     status,
			"created_at": createdAt,
			"updated_at": updatedAt,
		})
	}
	return c.JSON(fiber.Map{
		"complaints": complaints,
	})
}
