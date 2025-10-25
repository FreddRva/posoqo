package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
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
	var req struct {
		Amount   float64 `json:"amount"`
		Currency string  `json:"currency"`
	}
	if err := c.BodyParser(&req); err != nil || req.Amount <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(req.Amount * 100)),
		Currency: stripe.String(req.Currency),
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error creando PaymentIntent"})
	}

	return c.JSON(fiber.Map{"clientSecret": pi.ClientSecret})
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
	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if endpointSecret == "" {
		return c.Status(500).SendString("Webhook no configurado")
	}

	sigHeader := c.Get("Stripe-Signature")
	event, err := webhook.ConstructEvent(c.Body(), sigHeader, endpointSecret)
	if err != nil {
		return c.Status(400).SendString("Firma inválida")
	}

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

	// Actualizar estado del pago si no existe
	_, _ = db.DB.Exec(context.Background(),
		"UPDATE payments SET status = 'paid' WHERE stripe_payment_id = $1",
		paymentIntent.ID)
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
