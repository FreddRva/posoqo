package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/utils"
)

type ReservationRequest struct {
	Date          string  `json:"date"`
	Time          string  `json:"time"`
	People        int     `json:"people"`
	PaymentMethod string  `json:"payment_method"`
	Advance       float64 `json:"advance"`
}

type UpdateReservationStatusRequest struct {
	Status string `json:"status"`
}

var allowedReservationStatuses = map[string]bool{
	"pendiente":  true,
	"confirmada": true,
	"cancelada":  true,
	"finalizada": true,
}

// Crear reserva
func CreateReservation(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))
	var req ReservationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	if !utils.IsValidString(req.Date, 8, 10) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Fecha inválida"})
	}
	if !utils.IsValidString(req.Time, 4, 5) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Hora inválida"})
	}
	if !utils.IsValidNumber(req.People, 1, 50) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Cantidad de personas inválida (1-50)"})
	}
	if !utils.IsValidString(req.PaymentMethod, 2, 30) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Método de pago inválido"})
	}
	if req.Advance < 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Adelanto inválido"})
	}
	fmt.Printf("🔍 [DEBUG] Creando reserva - UserID: %d, Date: %s, Time: %s, People: %d, PaymentMethod: %s, Advance: %f\n",
		userID, req.Date, req.Time, req.People, req.PaymentMethod, req.Advance)

	// Obtener información del usuario para la notificación
	var userName string
	err := db.DB.QueryRow(context.Background(), "SELECT name FROM users WHERE id = $1", userID).Scan(&userName)
	if err != nil {
		userName = "Usuario"
	}

	_, err = db.DB.Exec(context.Background(),
		`INSERT INTO reservations (user_id, date, time, people, payment_method, advance) VALUES ($1, $2, $3, $4, $5, $6)`,
		userID, req.Date, req.Time, req.People, req.PaymentMethod, req.Advance)
	if err != nil {
		fmt.Printf("❌ [DEBUG] Error creando reserva: %v\n", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo crear la reserva"})
	}

	// Crear notificación para el usuario
	userIDStr := fmt.Sprintf("%d", userID)
	userNotificationTitle := "Reserva Creada"
	userNotificationMessage := fmt.Sprintf("Tu reserva para el %s a las %s ha sido creada exitosamente. Estado: Pendiente", req.Date, req.Time)
	CreateAutomaticNotification("success", userNotificationTitle, userNotificationMessage, &userIDStr, nil)

	// Crear notificación para el admin
	adminNotificationTitle := "Nueva Reserva"
	adminNotificationMessage := fmt.Sprintf("Nueva reserva de %s para el %s a las %s (%d personas)", userName, req.Date, req.Time, req.People)
	CreateAutomaticNotification("info", adminNotificationTitle, adminNotificationMessage, nil, nil)

	fmt.Printf("✅ [DEBUG] Reserva creada exitosamente con notificaciones\n")
	return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "Reserva creada"})
}

// Listar reservas del usuario
func ListMyReservations(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	countQuery := "SELECT COUNT(*) FROM reservations WHERE user_id=$1"
	var total int
	if err := db.DB.QueryRow(context.Background(), countQuery, userID).Scan(&total); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar reservas"})
	}
	offset := (page - 1) * limit
	listQuery := `SELECT id, date, time, people, payment_method, advance, status, created_at, updated_at FROM reservations WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`
	rows, err := db.DB.Query(context.Background(), listQuery, userID, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener reservas"})
	}
	defer rows.Close()

	reservations := []fiber.Map{}
	for rows.Next() {
		var id, paymentMethod, status string
		var date time.Time
		var timeS string
		var people int
		var advance float64
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &date, &timeS, &people, &paymentMethod, &advance, &status, &createdAt, &updatedAt); err != nil {
			continue
		}
		reservations = append(reservations, fiber.Map{
			"id":             id,
			"date":           date.Format("2006-01-02"),
			"time":           timeS,
			"people":         people,
			"payment_method": paymentMethod,
			"advance":        advance,
			"status":         status,
			"created_at":     createdAt,
			"updated_at":     updatedAt,
		})
	}
	return c.JSON(fiber.Map{
		"reservations": reservations,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (total + limit - 1) / limit,
		},
	})
}

// Listar todas las reservas (admin)
func ListAllReservations(c *fiber.Ctx) error {
	rows, err := db.DB.Query(context.Background(),
		`SELECT r.id, COALESCE(u.name, 'Usuario ' || r.user_id) as user_name, r.date, r.time, r.people, r.payment_method, r.status, r.advance, r.created_at, r.updated_at
		 FROM reservations r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC`)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener reservas"})
	}
	defer rows.Close()

	reservations := []fiber.Map{}
	for rows.Next() {
		var id, userName, paymentMethod, status string
		var date time.Time
		var timeStr string
		var people int
		var advance float64
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &userName, &date, &timeStr, &people, &paymentMethod, &status, &advance, &createdAt, &updatedAt); err != nil {
			continue
		}
		reservations = append(reservations, fiber.Map{
			"id":             id,
			"user_name":      userName,
			"date":           date.Format("2006-01-02"),
			"time":           timeStr,
			"people":         people,
			"payment_method": paymentMethod,
			"status":         status,
			"advance":        advance,
			"created_at":     createdAt,
			"updated_at":     updatedAt,
		})
	}
	return c.JSON(fiber.Map{
		"reservations": reservations,
	})
}

// Cambiar estado de reserva (admin)
func UpdateReservationStatus(c *fiber.Ctx) error {
	reservationID := c.Params("id")

	var req UpdateReservationStatusRequest
	if err := c.BodyParser(&req); err != nil || !allowedReservationStatuses[req.Status] {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos o estado no permitido"})
	}

	// Obtener información de la reserva antes de actualizar
	var userID int64
	var date time.Time
	var timeStr string
	var people int
	err := db.DB.QueryRow(context.Background(),
		"SELECT user_id, date, time, people FROM reservations WHERE id = $1",
		reservationID).Scan(&userID, &date, &timeStr, &people)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Reserva no encontrada"})
	}

	// Obtener nombre del usuario
	var userName string
	err = db.DB.QueryRow(context.Background(), "SELECT name FROM users WHERE id = $1", userID).Scan(&userName)
	if err != nil {
		userName = "Usuario"
	}

	res, err := db.DB.Exec(context.Background(),
		"UPDATE reservations SET status=$1, updated_at=NOW() WHERE id=$2",
		req.Status, reservationID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar el estado"})
	}
	if res.RowsAffected() == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Reserva no encontrada"})
	}

	// Crear notificación para el usuario
	userIDStr := fmt.Sprintf("%d", userID)
	userNotificationTitle := "Estado de Reserva Actualizado"
	userNotificationMessage := fmt.Sprintf("Tu reserva para el %s a las %s ha sido %s", date.Format("2006-01-02"), timeStr, req.Status)
	CreateAutomaticNotification("info", userNotificationTitle, userNotificationMessage, &userIDStr, nil)

	// Crear notificación para el admin
	adminNotificationTitle := "Reserva Actualizada"
	adminNotificationMessage := fmt.Sprintf("Reserva de %s para el %s a las %s ha sido %s", userName, date.Format("2006-01-02"), timeStr, req.Status)
	CreateAutomaticNotification("info", adminNotificationTitle, adminNotificationMessage, nil, nil)

	return c.JSON(fiber.Map{"message": "Estado actualizado"})
}
