package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/services"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/checkout/session"
	"github.com/stripe/stripe-go/v78/paymentintent"
	"github.com/stripe/stripe-go/v78/refund"
	"github.com/stripe/stripe-go/v78/webhook"
)

type CheckoutRequest struct {
	Type   string  `json:"type"` // "order" o "reservation"
	ID     string  `json:"id"`
	Amount float64 `json:"amount"`
}

type RefundRequest struct {
	PaymentID string  `json:"payment_id"`
	Amount    float64 `json:"amount"` // 0 para reembolso completo
	Reason    string  `json:"reason"`
}

// Crear Checkout Session de Stripe
func CreateStripeCheckout(c *fiber.Ctx) error {
	var req CheckoutRequest
	if err := c.BodyParser(&req); err != nil || req.Amount <= 0 || (req.Type != "order" && req.Type != "reservation") {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	if stripe.Key == "" {
		return c.Status(500).JSON(fiber.Map{"error": "Stripe no configurado"})
	}

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency:   stripe.String("pen"),
					UnitAmount: stripe.Int64(int64(req.Amount * 100)),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String(fmt.Sprintf("Pago %s %s", req.Type, req.ID)),
					},
				},
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(os.Getenv("FRONTEND_URL") + "/pago-exitoso"),
		CancelURL:  stripe.String(os.Getenv("FRONTEND_URL") + "/pago-cancelado"),
		Metadata: map[string]string{
			"type": req.Type,
			"id":   req.ID,
		},
	}

	s, err := session.New(params)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error creando sesión de pago"})
	}

	return c.JSON(fiber.Map{"url": s.URL})
}

// Crear PaymentIntent para Stripe Elements
func CreateStripePaymentIntent(c *fiber.Ctx) error {
	// Verificar autenticación
	claims, ok := c.Locals("user").(jwt.MapClaims)
	if !ok {
		fmt.Printf("[ERROR] No se pudo obtener claims del usuario\n")
		return c.Status(401).JSON(fiber.Map{"error": "No autenticado"})
	}

	userID := int64(claims["id"].(float64))
	fmt.Printf("[DEBUG] UserID: %d\n", userID)

	var req struct {
		Amount   float64 `json:"amount"`
		Currency string  `json:"currency"`
		Items    []struct {
			ID       string  `json:"id"`
			Quantity int     `json:"quantity"`
			Price    float64 `json:"price"`
		} `json:"items"`
		Shipping struct {
			Address      string   `json:"address"`
			AddressRef   string   `json:"addressRef"`
			StreetNumber string   `json:"streetNumber"`
			Lat          *float64 `json:"lat"`
			Lng          *float64 `json:"lng"`
		} `json:"shipping"`
	}

	if err := c.BodyParser(&req); err != nil {
		fmt.Printf("[ERROR] Error parsing body: %v\n", err)
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos", "details": err.Error()})
	}

	if req.Amount <= 0 {
		fmt.Printf("[ERROR] Amount inválido: %f\n", req.Amount)
		return c.Status(400).JSON(fiber.Map{"error": "Monto inválido"})
	}

	if len(req.Items) == 0 {
		fmt.Printf("[ERROR] Carrito vacío\n")
		return c.Status(400).JSON(fiber.Map{"error": "Carrito vacío"})
	}

	fmt.Printf("[DEBUG] Request válido. Items: %d, Amount: %f\n", len(req.Items), req.Amount)

	// Iniciar transacción para crear el pedido
	tx, err := db.DB.Begin(context.Background())
	if err != nil {
		fmt.Printf("[ERROR] No se pudo iniciar transacción: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"error": "Error interno", "details": err.Error()})
	}
	defer tx.Rollback(context.Background())

	// Calcular total y validar productos
	total := 0.0
	for i, item := range req.Items {
		fmt.Printf("[DEBUG] Validando producto %d: ID=%s, Cantidad=%d\n", i+1, item.ID, item.Quantity)
		var price float64
		err := tx.QueryRow(context.Background(),
			"SELECT price FROM products WHERE id=$1 AND is_active=TRUE", item.ID).Scan(&price)
		if err != nil {
			fmt.Printf("[ERROR] Producto no encontrado: %s - Error: %v\n", item.ID, err)
			return c.Status(400).JSON(fiber.Map{"error": fmt.Sprintf("Producto %s no encontrado o inactivo", item.ID), "details": err.Error()})
		}
		total += price * float64(item.Quantity)
		fmt.Printf("[DEBUG] Producto %s: Precio=%.2f, Subtotal=%.2f\n", item.ID, price, price*float64(item.Quantity))
	}

	fmt.Printf("[DEBUG] Total calculado: %.2f\n", total)

	// Construir la ubicación para la orden
	orderLocation := req.Shipping.Address
	if req.Shipping.AddressRef != "" {
		orderLocation += ", " + req.Shipping.AddressRef
	}
	if req.Shipping.StreetNumber != "" {
		orderLocation += " N° " + req.Shipping.StreetNumber
	}

	var orderLat, orderLng interface{}
	if req.Shipping.Lat != nil && req.Shipping.Lng != nil {
		orderLat = *req.Shipping.Lat
		orderLng = *req.Shipping.Lng
	}

	// Crear el pedido con status 'pendiente'
	fmt.Printf("[DEBUG] Creando pedido: user_id=%d, total=%.2f, location=%s\n", userID, total, orderLocation)
	var orderID string
	err = tx.QueryRow(context.Background(),
		"INSERT INTO orders (user_id, status, total, location, lat, lng) VALUES ($1, 'pendiente', $2, $3, $4, $5) RETURNING id",
		userID, total, orderLocation, orderLat, orderLng).Scan(&orderID)
	if err != nil {
		fmt.Printf("[ERROR] No se pudo crear el pedido: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear el pedido", "details": err.Error()})
	}

	fmt.Printf("[DEBUG] Pedido creado con ID: %s\n", orderID)

	// Insertar items del pedido
	fmt.Printf("[DEBUG] Insertando %d items del pedido\n", len(req.Items))
	for i, item := range req.Items {
		var price float64
		err := tx.QueryRow(context.Background(), "SELECT price FROM products WHERE id=$1", item.ID).Scan(&price)
		if err != nil {
			fmt.Printf("[ERROR] Producto no encontrado al insertar item: %s - Error: %v\n", item.ID, err)
			return c.Status(400).JSON(fiber.Map{"error": "Producto no encontrado", "details": err.Error()})
		}
		_, err = tx.Exec(context.Background(),
			"INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
			orderID, item.ID, item.Quantity, price)
		if err != nil {
			fmt.Printf("[ERROR] Error insertando item %d: %v\n", i+1, err)
			return c.Status(500).JSON(fiber.Map{"error": "Error al guardar detalle de pedido", "details": err.Error()})
		}
		fmt.Printf("[DEBUG] Item %d insertado correctamente\n", i+1)
	}

	// Confirmar transacción
	fmt.Printf("[DEBUG] Confirmando transacción...\n")
	if err := tx.Commit(context.Background()); err != nil {
		fmt.Printf("[ERROR] Error al confirmar transacción: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"error": "Error al guardar pedido", "details": err.Error()})
	}

	fmt.Printf("[DEBUG] Transacción confirmada exitosamente\n")

	// Ahora crear el PaymentIntent de Stripe con el order_id
	fmt.Printf("[DEBUG] Creando PaymentIntent de Stripe...\n")
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	if stripe.Key == "" {
		fmt.Printf("[ERROR] STRIPE_SECRET_KEY no configurada\n")
		db.DB.Exec(context.Background(), "UPDATE orders SET status='cancelado' WHERE id=$1", orderID)
		return c.Status(500).JSON(fiber.Map{"error": "Stripe no configurado"})
	}

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(req.Amount)),
		Currency: stripe.String(req.Currency),
		Metadata: map[string]string{
			"type":    "order",
			"id":      orderID,
			"user_id": fmt.Sprintf("%d", userID),
		},
	}

	fmt.Printf("[DEBUG] Stripe params: Amount=%d, Currency=%s\n", int64(req.Amount), req.Currency)

	pi, err := paymentintent.New(params)
	if err != nil {
		// Si falla el payment intent, marcar pedido como fallido
		fmt.Printf("[ERROR] Error creando PaymentIntent: %v\n", err)
		db.DB.Exec(context.Background(), "UPDATE orders SET status='cancelado' WHERE id=$1", orderID)
		return c.Status(500).JSON(fiber.Map{"error": "Error creando PaymentIntent", "details": err.Error()})
	}

	fmt.Printf("[DEBUG] PaymentIntent creado exitosamente. OrderID: %s\n", orderID)

	return c.JSON(fiber.Map{
		"clientSecret": pi.ClientSecret,
		"orderId":      orderID,
	})
}

// Obtener historial de pagos
func GetPaymentHistory(c *fiber.Ctx) error {
	var userID int64

	// Intentar obtener userID del contexto de autenticación
	if user := c.Locals("user"); user != nil {
		if claims, ok := user.(jwt.MapClaims); ok {
			userID = int64(claims["id"].(float64))
		}
	}

	// Si no hay usuario autenticado, usar un ID por defecto para pruebas
	if userID == 0 {
		userID = 1 // ID por defecto para pruebas
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	// Contar total
	var total int
	err := db.DB.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM payments WHERE user_id = $1", userID).Scan(&total)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error contando pagos"})
	}

	// Obtener pagos
	rows, err := db.DB.Query(context.Background(),
		`SELECT id, order_id, reservation_id, stripe_payment_id, amount, status, method, created_at 
		 FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		userID, limit, offset)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error obteniendo pagos"})
	}
	defer rows.Close()

	payments := []fiber.Map{}
	for rows.Next() {
		var id, orderID, reservationID, stripePaymentID, status, method string
		var amount float64
		var createdAt time.Time

		if err := rows.Scan(&id, &orderID, &reservationID, &stripePaymentID, &amount, &status, &method, &createdAt); err != nil {
			continue
		}

		payments = append(payments, fiber.Map{
			"id":                id,
			"order_id":          orderID,
			"reservation_id":    reservationID,
			"stripe_payment_id": stripePaymentID,
			"amount":            amount,
			"status":            status,
			"method":            method,
			"created_at":        createdAt,
		})
	}

	return c.JSON(fiber.Map{
		"payments": payments,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (total + limit - 1) / limit,
		},
	})
}

// Crear reembolso
func CreateRefund(c *fiber.Ctx) error {
	var req RefundRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// Obtener información del pago
	var stripePaymentID string
	var amount float64
	var userID int64
	err := db.DB.QueryRow(context.Background(),
		"SELECT stripe_payment_id, amount, user_id FROM payments WHERE id = $1",
		req.PaymentID).Scan(&stripePaymentID, &amount, &userID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Pago no encontrado"})
	}

	// Verificar que el usuario sea el propietario del pago (solo si está autenticado)
	if user := c.Locals("user"); user != nil {
		if claims, ok := user.(jwt.MapClaims); ok {
			currentUserID := int64(claims["id"].(float64))
			if userID != currentUserID {
				return c.Status(403).JSON(fiber.Map{"error": "No autorizado"})
			}
		}
	}

	// Calcular monto del reembolso
	refundAmount := req.Amount
	if refundAmount == 0 {
		refundAmount = amount
	}

	if refundAmount > amount {
		return c.Status(400).JSON(fiber.Map{"error": "Monto de reembolso inválido"})
	}

	// Crear reembolso en Stripe
	refundParams := &stripe.RefundParams{
		PaymentIntent: stripe.String(stripePaymentID),
		Amount:        stripe.Int64(int64(refundAmount * 100)),
		Reason:        stripe.String(req.Reason),
	}

	ref, err := refund.New(refundParams)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error creando reembolso"})
	}

	// Actualizar estado del pago
	_, err = db.DB.Exec(context.Background(),
		"UPDATE payments SET status = 'refunded', updated_at = NOW() WHERE id = $1",
		req.PaymentID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error actualizando pago"})
	}

	// Crear notificación
	userIDStr := fmt.Sprintf("%d", userID)
	CreateAutomaticNotification("info", "Reembolso Procesado",
		fmt.Sprintf("Tu reembolso de S/%.2f ha sido procesado", refundAmount),
		&userIDStr, nil)

	return c.JSON(fiber.Map{
		"message":   "Reembolso procesado exitosamente",
		"refund_id": ref.ID,
		"amount":    refundAmount,
	})
}

// Webhook de Stripe
func StripeWebhook(c *fiber.Ctx) error {
	fmt.Printf("[WEBHOOK] Recibiendo webhook de Stripe\n")

	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if endpointSecret == "" {
		fmt.Printf("[WEBHOOK ERROR] STRIPE_WEBHOOK_SECRET no configurado\n")
		return c.Status(500).SendString("Webhook no configurado")
	}

	fmt.Printf("[WEBHOOK] Secret configurado: %s\n", endpointSecret[:10]+"...")

	sigHeader := c.Get("Stripe-Signature")
	fmt.Printf("[WEBHOOK] Signature header: %s\n", sigHeader[:20]+"...")

	// Intentar construir el evento, pero si falla por versión de API, parsearlo directamente
	event, err := webhook.ConstructEvent(c.Body(), sigHeader, endpointSecret)
	if err != nil {
		// Si el error es por versión de API, parsear el JSON directamente
		if strings.Contains(err.Error(), "API version") {
			fmt.Printf("[WEBHOOK] Ignorando error de versión de API, parseando evento directamente\n")
			if err := json.Unmarshal(c.Body(), &event); err != nil {
				fmt.Printf("[WEBHOOK ERROR] Error parseando evento: %v\n", err)
				return c.Status(400).SendString(fmt.Sprintf("Error parseando evento: %v", err))
			}
		} else {
			fmt.Printf("[WEBHOOK ERROR] Error verificando firma: %v\n", err)
			return c.Status(400).SendString(fmt.Sprintf("Firma inválida: %v", err))
		}
	}

	fmt.Printf("[WEBHOOK] Evento recibido: %s\n", event.Type)

	switch event.Type {
	case "checkout.session.completed":
		handleCheckoutCompleted(event)
	case "payment_intent.succeeded":
		handlePaymentSucceeded(event)
	case "payment_intent.payment_failed":
		handlePaymentFailed(event)
	case "charge.refunded":
		handleRefundCompleted(event)
	}

	return c.SendStatus(200)
}

func handleCheckoutCompleted(event stripe.Event) {
	var session stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
		return
	}

	userID := int64(0)
	amount := float64(session.AmountTotal) / 100.0
	typeStr := session.Metadata["type"]
	id := session.Metadata["id"]

	var orderID, reservationID *string
	if typeStr == "order" {
		db.DB.QueryRow(context.Background(), "SELECT user_id FROM orders WHERE id=$1", id).Scan(&userID)
		orderID = &id
	}
	if typeStr == "reservation" {
		db.DB.QueryRow(context.Background(), "SELECT user_id FROM reservations WHERE id=$1", id).Scan(&userID)
		reservationID = &id
	}

	// Registrar pago
	_, _ = db.DB.Exec(context.Background(),
		`INSERT INTO payments (user_id, order_id, reservation_id, stripe_payment_id, amount, status, method) 
		 VALUES ($1, $2, $3, $4, $5, 'paid', 'stripe')`,
		userID, orderID, reservationID, session.PaymentIntent.ID, amount,
	)

	// Actualizar estado
	if typeStr == "order" {
		_, _ = db.DB.Exec(context.Background(), "UPDATE orders SET status='pagado' WHERE id=$1", id)
	} else if typeStr == "reservation" {
		_, _ = db.DB.Exec(context.Background(), "UPDATE reservations SET status='confirmada' WHERE id=$1", id)
	}

	// Crear notificación de pago exitoso con IA
	if userID > 0 {
		userIDStr := fmt.Sprintf("%d", userID)

		// Obtener nombre del usuario
		var userName string
		db.DB.QueryRow(context.Background(), "SELECT name FROM users WHERE id=$1", userID).Scan(&userName)
		if userName == "" {
			userName = "Usuario"
		}

		// Crear notificación de pago con IA
		ctx := services.NotificationContext{
			Type:       "payment",
			Action:     "success",
			UserName:   userName,
			EntityID:   "",
			Amount:     amount,
			Status:     "paid",
			IsForAdmin: false,
		}

		title, message, notifType, priority, err := services.GenerateSmartNotification(ctx)
		if err != nil {
			fmt.Printf("Error generando notificación de pago con IA: %v\n", err)
			// Fallback a notificación simple
			CreateAutomaticNotification("success", "Pago Exitoso",
				fmt.Sprintf("Tu pago de S/%.2f ha sido procesado exitosamente", amount),
				&userIDStr, orderID)
		} else {
			CreateAutomaticNotificationWithPriority(notifType, title, message, &userIDStr, orderID, priority)
		}

		// Si es un pedido, también crear notificación de pedido
		if typeStr == "order" && orderID != nil {
			CreateOrderNotification(*orderID, userIDStr, "pagado")
		}
	}
}

func handlePaymentSucceeded(event stripe.Event) {
	var paymentIntent stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
		return
	}

	// Obtener metadata del payment intent
	typeStr := paymentIntent.Metadata["type"]
	orderID := paymentIntent.Metadata["id"]

	if typeStr == "order" && orderID != "" {
		// Obtener información del pedido
		var userID int64
		var total float64
		err := db.DB.QueryRow(context.Background(),
			"SELECT user_id, total FROM orders WHERE id=$1", orderID).Scan(&userID, &total)

		if err == nil {
			// Registrar pago
			_, _ = db.DB.Exec(context.Background(),
				`INSERT INTO payments (user_id, order_id, stripe_payment_id, amount, status, method) 
				 VALUES ($1, $2, $3, $4, 'paid', 'stripe')
				 ON CONFLICT (stripe_payment_id) DO UPDATE SET status = 'paid'`,
				userID, orderID, paymentIntent.ID, float64(paymentIntent.Amount)/100.0,
			)

			// Actualizar estado del pedido a 'recibido' (ya fue pagado)
			_, _ = db.DB.Exec(context.Background(), "UPDATE orders SET status='recibido' WHERE id=$1", orderID)

			// Crear notificación de pago exitoso con IA
			if userID > 0 {
				userIDStrLocal := fmt.Sprintf("%d", userID)

				// Obtener nombre del usuario
				var userName string
				db.DB.QueryRow(context.Background(), "SELECT name FROM users WHERE id=$1", userID).Scan(&userName)
				if userName == "" {
					userName = "Usuario"
				}

				// Crear notificación de pago con IA
				ctx := services.NotificationContext{
					Type:       "payment",
					Action:     "success",
					UserName:   userName,
					EntityID:   "",
					Amount:     float64(paymentIntent.Amount) / 100.0,
					Status:     "paid",
					IsForAdmin: false,
				}

				title, message, notifType, priority, err := services.GenerateSmartNotification(ctx)
				if err != nil {
					fmt.Printf("Error generando notificación de pago con IA: %v\n", err)
					// Fallback a notificación simple
					CreateAutomaticNotification("success", "Pago Exitoso",
						fmt.Sprintf("Tu pago de S/%.2f ha sido procesado exitosamente", float64(paymentIntent.Amount)/100.0),
						&userIDStrLocal, &orderID)
				} else {
					CreateAutomaticNotificationWithPriority(notifType, title, message, &userIDStrLocal, &orderID, priority)
				}

				// Crear notificación de pedido recibido
				CreateOrderNotification(orderID, userIDStrLocal, "recibido")
			}
		}
	} else {
		// Si no hay metadata, intentar actualizar por payment_id
		_, _ = db.DB.Exec(context.Background(),
			"UPDATE payments SET status = 'paid' WHERE stripe_payment_id = $1",
			paymentIntent.ID)
	}
}

func handlePaymentFailed(event stripe.Event) {
	var paymentIntent stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
		return
	}

	// Actualizar estado del pago
	_, _ = db.DB.Exec(context.Background(),
		"UPDATE payments SET status = 'failed' WHERE stripe_payment_id = $1",
		paymentIntent.ID)

	// Obtener user_id para notificación
	var userID int64
	err := db.DB.QueryRow(context.Background(),
		"SELECT user_id FROM payments WHERE stripe_payment_id = $1", paymentIntent.ID).Scan(&userID)
	if err == nil && userID > 0 {
		userIDStr := fmt.Sprintf("%d", userID)
		CreateAutomaticNotification("error", "Pago Fallido",
			"Tu pago no pudo ser procesado. Por favor, intenta nuevamente.",
			&userIDStr, nil)
	}
}

func handleRefundCompleted(event stripe.Event) {
	var charge stripe.Charge
	if err := json.Unmarshal(event.Data.Raw, &charge); err != nil {
		return
	}

	// Actualizar estado del pago
	_, _ = db.DB.Exec(context.Background(),
		"UPDATE payments SET status = 'refunded' WHERE stripe_payment_id = $1",
		charge.PaymentIntent.ID)

	// Obtener user_id para notificación
	var userID int64
	err := db.DB.QueryRow(context.Background(),
		"SELECT user_id FROM payments WHERE stripe_payment_id = $1", charge.PaymentIntent.ID).Scan(&userID)
	if err == nil && userID > 0 {
		userIDStr := fmt.Sprintf("%d", userID)
		CreateAutomaticNotification("info", "Reembolso Completado",
			"Tu reembolso ha sido procesado exitosamente.",
			&userIDStr, nil)
	}
}

// Utilidad para nil en Go
func ifThenElse(cond bool, a, b interface{}) interface{} {
	if cond {
		return a
	}
	return b
}
