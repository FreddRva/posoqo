package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/utils"
)

type CouponRequest struct {
	Code       string  `json:"code"`
	Value      float64 `json:"value"`
	Type       string  `json:"type"`
	Expiration string  `json:"expiration"`
}

type ValidateCouponRequest struct {
	Code string `json:"code"`
}

// Crear cupón (solo admin)
func CreateCoupon(c *fiber.Ctx) error {
	var req CouponRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	if !utils.IsValidString(req.Code, 3, 20) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Código inválido (3-20 caracteres)"})
	}
	if req.Value <= 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Valor debe ser mayor a 0"})
	}
	if req.Type != "fixed" && req.Type != "percent" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Tipo de cupón inválido"})
	}
	if !utils.IsValidString(req.Expiration, 8, 10) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Fecha de expiración inválida"})
	}
	_, err := db.DB.Exec(context.Background(),
		`INSERT INTO coupons (code, value, type, expiration) VALUES ($1, $2, $3, $4)`,
		strings.ToUpper(strings.TrimSpace(req.Code)), req.Value, req.Type, req.Expiration)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "No se pudo crear el cupón (¿ya existe?)"})
	}
	return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "Cupón creado"})
}

// Listar cupones (solo admin)
func ListCoupons(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	countQuery := "SELECT COUNT(*) FROM coupons"
	var total int
	if err := db.DB.QueryRow(context.Background(), countQuery).Scan(&total); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar cupones"})
	}
	offset := (page - 1) * limit
	listQuery := `SELECT id, code, value, type, expiration, is_active, created_at, updated_at FROM coupons ORDER BY created_at DESC LIMIT $1 OFFSET $2`
	rows, err := db.DB.Query(context.Background(), listQuery, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener cupones"})
	}
	defer rows.Close()

	coupons := []fiber.Map{}
	for rows.Next() {
		var id, code, ctype, expiration string
		var value float64
		var isActive bool
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &code, &value, &ctype, &expiration, &isActive, &createdAt, &updatedAt); err != nil {
			continue
		}
		coupons = append(coupons, fiber.Map{
			"id":         id,
			"code":       code,
			"value":      value,
			"type":       ctype,
			"expiration": expiration,
			"is_active":  isActive,
			"created_at": createdAt,
			"updated_at": updatedAt,
		})
	}
	return c.JSON(fiber.Map{
		"coupons": coupons,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (total + limit - 1) / limit,
		},
	})
}

// Validar cupón (usuario)
func ValidateCoupon(c *fiber.Ctx) error {
	var req ValidateCouponRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Código requerido"})
	}
	if !utils.IsValidString(req.Code, 3, 20) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Código inválido"})
	}
	var id, code, ctype, expiration string
	var value float64
	var isActive bool
	var createdAt, updatedAt time.Time
	err := db.DB.QueryRow(context.Background(),
		`SELECT id, code, value, type, expiration, is_active, created_at, updated_at FROM coupons WHERE code=$1`,
		strings.ToUpper(strings.TrimSpace(req.Code))).Scan(&id, &code, &value, &ctype, &expiration, &isActive, &createdAt, &updatedAt)
	if err != nil || !isActive {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Cupón no válido"})
	}
	exp, _ := time.Parse("2006-01-02", expiration)
	if exp.Before(time.Now()) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Cupón expirado"})
	}
	return c.JSON(fiber.Map{
		"id":         id,
		"code":       code,
		"value":      value,
		"type":       ctype,
		"expiration": expiration,
		"is_active":  isActive,
		"created_at": createdAt,
		"updated_at": updatedAt,
	})
}
