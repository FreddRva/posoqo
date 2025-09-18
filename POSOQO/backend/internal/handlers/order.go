package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"database/sql"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/utils"
)

type OrderItemRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type CreateOrderRequest struct {
	Items    []OrderItemRequest `json:"items"`
	Location string             `json:"location"`
	Lat      *float64           `json:"lat,omitempty"`
	Lng      *float64           `json:"lng,omitempty"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

var allowedStatuses = map[string]bool{
	"recibido":   true,
	"preparando": true,
	"camino":     true,
	"entregado":  true,
	"cancelado":  true,
}

// CreateOrder godoc
// @Summary Crear pedido
// @Description Crea un nuevo pedido para el usuario autenticado
// @Tags pedidos
// @Accept json
// @Produce json
// @Param data body CreateOrderRequest true "Datos del pedido"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /api/orders [post]
func CreateOrder(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))

	var req CreateOrderRequest
	if err := c.BodyParser(&req); err != nil || len(req.Items) == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos o carrito vacío"})
	}
	if !utils.IsValidString(req.Location, 2, 200) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Ubicación inválida (2-200 caracteres)"})
	}
	for _, item := range req.Items {
		if !utils.IsValidString(item.ProductID, 1, 50) {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "ID de producto inválido"})
		}
		if !utils.IsValidNumber(item.Quantity, 1, 100) {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Cantidad inválida (1-100)"})
		}
	}

	tx, err := db.DB.Begin(context.Background())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error interno"})
	}
	defer tx.Rollback(context.Background())

	total := 0.0
	for _, item := range req.Items {
		var price float64
		err := tx.QueryRow(context.Background(), "SELECT price FROM products WHERE id=$1 AND is_active=TRUE", item.ProductID).Scan(&price)
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Producto no encontrado o inactivo"})
		}
		total += price * float64(item.Quantity)
	}

	var orderID string

	// Construir la ubicación para la orden
	orderLocation := req.Location

	// Variables para coordenadas
	var orderLat, orderLng interface{}

	// Debug temporal
	fmt.Printf("🔍 [ORDER] Request: lat=%v, lng=%v, location=%s\n", req.Lat, req.Lng, req.Location)
	
	// Primero verificar si el frontend envió coordenadas
	if req.Lat != nil && req.Lng != nil && *req.Lat != 0 && *req.Lng != 0 {
		fmt.Printf("🔍 [ORDER] Usando coordenadas del frontend: lat=%f, lng=%f\n", *req.Lat, *req.Lng)
		orderLat = *req.Lat
		orderLng = *req.Lng
	} else if orderLocation == "" || orderLocation == "Ubicación no especificada" || orderLocation == "Dirección del cliente" {
		var userAddress, userAddressRef, userStreetNumber sql.NullString
		var userLat, userLng sql.NullFloat64

		err := db.DB.QueryRow(context.Background(),
			"SELECT address, address_ref, street_number, lat, lng FROM users WHERE id = $1",
			userID).Scan(&userAddress, &userAddressRef, &userStreetNumber, &userLat, &userLng)

		if err == nil {
			// Construir dirección desde los datos del usuario
			addressParts := []string{}
			if userAddress.Valid && userAddress.String != "" {
				addressParts = append(addressParts, userAddress.String)
			}
			if userAddressRef.Valid && userAddressRef.String != "" {
				addressParts = append(addressParts, userAddressRef.String)
			}
			if userStreetNumber.Valid && userStreetNumber.String != "" {
				addressParts = append(addressParts, "N° "+userStreetNumber.String)
			}

			if len(addressParts) > 0 {
				orderLocation = strings.Join(addressParts, ", ")
			} else {
				orderLocation = "Dirección del cliente"
			}

			// Usar coordenadas del usuario si están disponibles
			if userLat.Valid && userLng.Valid {
				orderLat = userLat.Float64
				orderLng = userLng.Float64
			} else {
				orderLat = nil
				orderLng = nil
			}
		} else {
			// Si no se puede obtener la dirección del usuario, usar valor por defecto
			orderLocation = "Dirección del cliente"
			orderLat = nil
			orderLng = nil
		}
	} else {
		// Si hay ubicación válida del frontend pero no coordenadas, mantener nil
		if orderLat == nil {
			orderLat = nil
			orderLng = nil
		}
	}

	fmt.Printf("🔍 [ORDER] Final: location=%s, lat=%v, lng=%v\n", orderLocation, orderLat, orderLng)
	
	err = tx.QueryRow(context.Background(),
		"INSERT INTO orders (user_id, status, total, location, lat, lng) VALUES ($1, 'recibido', $2, $3, $4, $5) RETURNING id",
		userID, total, orderLocation, orderLat, orderLng).Scan(&orderID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo crear el pedido"})
	}

	for _, item := range req.Items {
		var price float64
		err := tx.QueryRow(context.Background(), "SELECT price FROM products WHERE id=$1", item.ProductID).Scan(&price)
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Producto no encontrado"})
		}
		_, err = tx.Exec(context.Background(),
			"INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
			orderID, item.ProductID, item.Quantity, price)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al guardar detalle de pedido"})
		}
	}

	if err := tx.Commit(context.Background()); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al guardar pedido"})
	}

	// Crear notificación automática
	CreateOrderNotification(orderID, fmt.Sprintf("%d", userID), "creado")

	return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "Pedido creado", "order_id": orderID})
}

// Listar pedidos del usuario autenticado
func ListMyOrders(c *fiber.Ctx) error {
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

	countQuery := "SELECT COUNT(*) FROM orders WHERE user_id=$1"
	var total int
	if err := db.DB.QueryRow(context.Background(), countQuery, userID).Scan(&total); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar pedidos"})
	}
	offset := (page - 1) * limit
	listQuery := `SELECT id, status, total, location, created_at, updated_at FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`
	rows, err := db.DB.Query(context.Background(), listQuery, userID, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener pedidos"})
	}
	defer rows.Close()

	orders := []fiber.Map{}
	for rows.Next() {
		var id, status, location string
		var totalF float64
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &status, &totalF, &location, &createdAt, &updatedAt); err != nil {
			continue
		}
		orders = append(orders, fiber.Map{
			"id":         id,
			"status":     status,
			"total":      totalF,
			"location":   location,
			"created_at": createdAt,
			"updated_at": updatedAt,
		})
	}
	return c.JSON(fiber.Map{
		"orders": orders,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (total + limit - 1) / limit,
		},
	})
}

// Obtener detalle de un pedido
func GetOrderDetail(c *fiber.Ctx) error {
	orderID := c.Params("id")
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))
	role := claims["role"].(string)

	// Verificar que el pedido exista y pertenezca al usuario, o que sea admin
	var dbUserID int64
	var status, location string
	var total float64
	var createdAt, updatedAt time.Time
	err := db.DB.QueryRow(context.Background(),
		`SELECT user_id, status, total, location, created_at, updated_at FROM orders WHERE id=$1`, orderID).
		Scan(&dbUserID, &status, &total, &location, &createdAt, &updatedAt)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Pedido no encontrado"})
	}
	if role != "admin" && dbUserID != userID {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "No autorizado"})
	}

	// Obtener los items del pedido
	rows, err := db.DB.Query(context.Background(),
		`SELECT oi.product_id, p.name, oi.quantity, oi.unit_price
		 FROM order_items oi
		 JOIN products p ON oi.product_id = p.id
		 WHERE oi.order_id = $1`, orderID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al obtener items"})
	}
	defer rows.Close()

	items := []fiber.Map{}
	for rows.Next() {
		var productID, name string
		var quantity int
		var unitPrice float64
		if err := rows.Scan(&productID, &name, &quantity, &unitPrice); err != nil {
			continue
		}
		items = append(items, fiber.Map{
			"product_id": productID,
			"name":       name,
			"quantity":   quantity,
			"unit_price": unitPrice,
			"subtotal":   unitPrice * float64(quantity),
		})
	}

	return c.JSON(fiber.Map{
		"id":         orderID,
		"status":     status,
		"total":      total,
		"location":   location,
		"created_at": createdAt,
		"updated_at": updatedAt,
		"items":      items,
	})
}

// Cambiar el estado de un pedido (solo admin)
func UpdateOrderStatus(c *fiber.Ctx) error {
	orderID := c.Params("id")
	var req UpdateOrderStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	if !allowedStatuses[req.Status] {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Estado no permitido"})
	}
	// Obtener user_id del pedido
	var userID int64
	err := db.DB.QueryRow(context.Background(), "SELECT user_id FROM orders WHERE id=$1", orderID).Scan(&userID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Pedido no encontrado"})
	}
	res, err := db.DB.Exec(context.Background(),
		"UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2",
		req.Status, orderID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar el estado"})
	}
	if res.RowsAffected() == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Pedido no encontrado"})
	}

	// Crear notificación automática ASYNC - NO ESPERAR RESPUESTA
	go func() {
		CreateOrderNotification(orderID, fmt.Sprintf("%d", userID), req.Status)
	}()

	// Notificar usuario y admins ASYNC
	go func() {
		msg := "El estado de tu pedido " + orderID + " cambió a: " + req.Status
		NotifyUserAndAdmins(userID, msg)
	}()
	return c.JSON(fiber.Map{"success": true, "message": "Estado actualizado"})
}
