package services

import (
	"fmt"
	"strings"
)

// NotificationContext contiene información contextual para generar notificaciones
type NotificationContext struct {
	Type       string  // order, user, product, system, complaint, reservation
	Action     string  // created, updated, cancelled, completed, etc.
	UserName   string  // Nombre del usuario relevante
	EntityID   string  // ID del pedido, producto, etc.
	Amount     float64 // Monto si es relevante (pedidos, pagos)
	Status     string  // Estado actual
	Details    string  // Detalles adicionales
	IsForAdmin bool    // Si la notificación es para admin o usuario
	Priority   string  // high, medium, low
}

// GenerateSmartNotification genera una notificación inteligente usando IA
func GenerateSmartNotification(ctx NotificationContext) (title, message, notificationType string, priority int, err error) {
	geminiService := NewGeminiService()
	
	// Si no hay API key, usar fallback
	if geminiService.APIKey == "" {
		return generateFallbackNotification(ctx)
	}

	// Construir el prompt para la IA
	prompt := buildNotificationPrompt(ctx)

	// Generar contenido con Gemini
	response, err := geminiService.GenerateContent(prompt, &GenerationConfig{
		Temperature:     0.7,
		MaxOutputTokens: 500,
	})
	
	if err != nil || response == "" {
		// Fallback si hay error
		return generateFallbackNotification(ctx)
	}

	// Parsear la respuesta
	parsedResponse := parseAITextResponse(response)

	// Asignar prioridad basada en el tipo y contexto
	priority = calculatePriority(ctx)

	return parsedResponse.Title, parsedResponse.Message, parsedResponse.Type, priority, nil
}

// buildNotificationPrompt construye el prompt para la IA
func buildNotificationPrompt(ctx NotificationContext) string {
	target := "usuario"
	if ctx.IsForAdmin {
		target = "administrador"
	}

	prompt := fmt.Sprintf(`Genera una notificación profesional y amigable para un %s de una plataforma de comida/restaurante.

Contexto:
- Tipo: %s
- Acción: %s
- Usuario: %s
- ID: %s
- Monto: S/ %.2f
- Estado: %s
- Detalles: %s
- Prioridad: %s

Requisitos:
1. El título debe ser corto (máximo 50 caracteres), claro y con un emoji apropiado
2. El mensaje debe ser amigable, profesional y conciso (máximo 150 caracteres)
3. Usa un tono cálido y personalizado
4. Incluye el nombre del usuario cuando sea relevante
5. Tipo de notificación: success (verde), info (azul), warning (amarillo), error (rojo)

Formato de respuesta (una línea por campo):
TITULO: [título con emoji]
MENSAJE: [mensaje amigable]
TIPO: [success/info/warning/error]

Ejemplo:
TITULO: 🎉 ¡Pedido Confirmado!
MENSAJE: Hola Juan, tu pedido #12345 ha sido confirmado y está en preparación. ¡Gracias por tu compra!
TIPO: success`,
		target, ctx.Type, ctx.Action, ctx.UserName, ctx.EntityID, ctx.Amount, ctx.Status, ctx.Details, ctx.Priority)

	return prompt
}

// AIResponse estructura la respuesta de la IA
type AIResponse struct {
	Title   string
	Message string
	Type    string
}

// parseAITextResponse parsea la respuesta de texto de la IA
func parseAITextResponse(text string) AIResponse {
	// Parsear las líneas
	lines := strings.Split(text, "\n")
	result := AIResponse{
		Title:   "Notificación",
		Message: "Tienes una nueva notificación",
		Type:    "info",
	}

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "TITULO:") {
			result.Title = strings.TrimSpace(strings.TrimPrefix(line, "TITULO:"))
		} else if strings.HasPrefix(line, "MENSAJE:") {
			result.Message = strings.TrimSpace(strings.TrimPrefix(line, "MENSAJE:"))
		} else if strings.HasPrefix(line, "TIPO:") {
			result.Type = strings.TrimSpace(strings.TrimPrefix(line, "TIPO:"))
		}
	}

	return result
}

// calculatePriority calcula la prioridad de la notificación
func calculatePriority(ctx NotificationContext) int {
	// Priorizar usando un switch con condiciones etiquetadas para claridad
	switch {
	case ctx.Action == "cancelled" || ctx.Type == "payment" || strings.Contains(ctx.Status, "error"):
		return 3
	case ctx.Action == "created" || ctx.Action == "completed":
		return 2
	default:
		return 1
	}
}

// generateFallbackNotification genera notificaciones sin IA
func generateFallbackNotification(ctx NotificationContext) (title, message, notificationType string, priority int, err error) {
	priority = calculatePriority(ctx)

	switch ctx.Type {
	case "order":
		return generateOrderNotification(ctx)
	case "user":
		return generateUserNotification(ctx)
	case "product":
		return generateProductNotification(ctx)
	case "complaint":
		return generateComplaintNotification(ctx)
	case "reservation":
		return generateReservationNotification(ctx)
	case "payment":
		return generatePaymentNotification(ctx)
	default:
		return generateSystemNotification(ctx)
	}
}

func generateOrderNotification(ctx NotificationContext) (title, message, notificationType string, priority int, err error) {
	shortID := ctx.EntityID
	if len(shortID) > 8 {
		shortID = shortID[len(shortID)-8:]
	}

	switch ctx.Action {
	case "created", "recibido":
		if ctx.IsForAdmin {
			title = "📋 Nuevo Pedido Recibido"
			message = fmt.Sprintf("Pedido #%s de %s ha sido recibido (S/ %.2f)", shortID, ctx.UserName, ctx.Amount)
		} else {
			title = "🎉 ¡Pedido Recibido!"
			message = fmt.Sprintf("¡Hola %s! Tu pedido #%s ha sido recibido y está siendo procesado. ¡Gracias!", ctx.UserName, shortID)
		}
		notificationType = "success"

	case "preparando":
		if ctx.IsForAdmin {
			title = "👨‍🍳 Pedido en Preparación"
			message = fmt.Sprintf("Pedido #%s de %s está siendo preparado", shortID, ctx.UserName)
		} else {
			title = "👨‍🍳 ¡Preparando tu Pedido!"
			message = fmt.Sprintf("¡%s! Tu pedido #%s se está preparando con mucho cariño. ¡Estará listo pronto!", ctx.UserName, shortID)
		}
		notificationType = "info"

	case "camino":
		if ctx.IsForAdmin {
			title = "🚚 Pedido en Camino"
			message = fmt.Sprintf("Pedido #%s de %s está en camino", shortID, ctx.UserName)
		} else {
			title = "🚚 ¡Tu Pedido va en Camino!"
			message = fmt.Sprintf("¡%s! Tu pedido #%s ya está en camino hacia ti. ¡Prepárate para disfrutar!", ctx.UserName, shortID)
		}
		notificationType = "info"

	case "entregado":
		if ctx.IsForAdmin {
			title = "✅ Pedido Entregado"
			message = fmt.Sprintf("Pedido #%s de %s ha sido entregado exitosamente", shortID, ctx.UserName)
		} else {
			title = "✅ ¡Pedido Entregado!"
			message = fmt.Sprintf("¡%s! Tu pedido #%s ha sido entregado. ¡Buen provecho! 😋", ctx.UserName, shortID)
		}
		notificationType = "success"

	case "cancelado":
		if ctx.IsForAdmin {
			title = "❌ Pedido Cancelado"
			message = fmt.Sprintf("Pedido #%s de %s ha sido cancelado", shortID, ctx.UserName)
		} else {
			title = "❌ Pedido Cancelado"
			message = fmt.Sprintf("¡%s! Tu pedido #%s ha sido cancelado. Si tienes dudas, contáctanos.", ctx.UserName, shortID)
		}
		notificationType = "warning"

	default:
		title = fmt.Sprintf("📦 Pedido #%s", shortID)
		message = fmt.Sprintf("Tu pedido #%s ha sido actualizado", shortID)
		notificationType = "info"
	}

	priority = calculatePriority(ctx)
	return title, message, notificationType, priority, nil
}

func generateUserNotification(ctx NotificationContext) (title, message, notificationType string, priority int, err error) {
	switch ctx.Action {
	case "registered":
		title = "👤 Nuevo Usuario Registrado"
		message = fmt.Sprintf("El usuario %s se ha registrado en la plataforma", ctx.UserName)
		notificationType = "info"

	case "verified":
		title = "✅ Usuario Verificado"
		message = fmt.Sprintf("El usuario %s ha verificado su email", ctx.UserName)
		notificationType = "success"

	case "suspended":
		title = "🚫 Usuario Suspendido"
		message = fmt.Sprintf("El usuario %s ha sido suspendido", ctx.UserName)
		notificationType = "warning"

	default:
		title = "👤 Actualización de Usuario"
		message = fmt.Sprintf("El usuario %s ha sido actualizado", ctx.UserName)
		notificationType = "info"
	}

	priority = calculatePriority(ctx)
	return title, message, notificationType, priority, nil
}

func generateProductNotification(ctx NotificationContext) (title, message, notificationType string, priority int, err error) {
	switch ctx.Action {
	case "created":
		title = "🆕 Nuevo Producto"
		message = fmt.Sprintf("El producto '%s' ha sido agregado al catálogo", ctx.Details)
		notificationType = "success"

	case "updated":
		title = "✏️ Producto Actualizado"
		message = fmt.Sprintf("El producto '%s' ha sido actualizado", ctx.Details)
		notificationType = "info"

	case "deleted":
		title = "🗑️ Producto Eliminado"
		message = fmt.Sprintf("El producto '%s' ha sido eliminado", ctx.Details)
		notificationType = "warning"

	default:
		title = "📦 Actualización de Producto"
		message = fmt.Sprintf("Hay cambios en el producto '%s'", ctx.Details)
		notificationType = "info"
	}

	priority = 1
	return title, message, notificationType, priority, nil
}

func generateComplaintNotification(ctx NotificationContext) (title, message, notificationType string, priority int, err error) {
	switch ctx.Action {
	case "created":
		title = "⚠️ Nuevo Reclamo"
		message = fmt.Sprintf("Nuevo reclamo de %s: %s", ctx.UserName, ctx.Details)
		notificationType = "warning"

	case "resolved":
		title = "✅ Reclamo Resuelto"
		message = fmt.Sprintf("El reclamo de %s ha sido resuelto", ctx.UserName)
		notificationType = "success"

	default:
		title = "📝 Actualización de Reclamo"
		message = fmt.Sprintf("El reclamo de %s ha sido actualizado", ctx.UserName)
		notificationType = "info"
	}

	priority = 2
	return title, message, notificationType, priority, nil
}

func generateReservationNotification(ctx NotificationContext) (title, message, notificationType string, priority int, err error) {
	switch ctx.Action {
	case "created":
		if ctx.IsForAdmin {
			title = "📅 Nueva Reserva"
			message = fmt.Sprintf("Nueva reserva de %s para %s personas", ctx.UserName, ctx.Details)
		} else {
			title = "✅ Reserva Confirmada"
			message = fmt.Sprintf("¡Hola %s! Tu reserva ha sido confirmada exitosamente", ctx.UserName)
		}
		notificationType = "success"

	case "cancelled":
		title = "❌ Reserva Cancelada"
		message = fmt.Sprintf("La reserva de %s ha sido cancelada", ctx.UserName)
		notificationType = "warning"

	case "completed":
		title = "🎉 Reserva Completada"
		message = fmt.Sprintf("La reserva de %s ha sido completada. ¡Gracias por visitarnos!", ctx.UserName)
		notificationType = "success"

	default:
		title = "📅 Actualización de Reserva"
		// No se usa el nombre de usuario en este mensaje; asignar literal
		message = "Tu reserva ha sido actualizada"
		notificationType = "info"
	}

	priority = 2
	return title, message, notificationType, priority, nil
}

func generatePaymentNotification(ctx NotificationContext) (title, message, notificationType string, priority int, err error) {
	if ctx.Action == "success" {
		title = "💳 Pago Exitoso"
		message = fmt.Sprintf("Tu pago de S/ %.2f ha sido procesado correctamente", ctx.Amount)
		notificationType = "success"
	} else if ctx.Action == "failed" {
		title = "❌ Error en el Pago"
		message = fmt.Sprintf("Hubo un problema procesando tu pago de S/ %.2f", ctx.Amount)
		notificationType = "error"
	} else {
		title = "💰 Actualización de Pago"
		message = fmt.Sprintf("Tu pago de S/ %.2f ha sido actualizado", ctx.Amount)
		notificationType = "info"
	}

	priority = 3
	return title, message, notificationType, priority, nil
}

func generateSystemNotification(ctx NotificationContext) (title, message, notificationType string, priority int, err error) {
	title = "🔔 Notificación del Sistema"
	message = ctx.Details
	if message == "" {
		message = "Tienes una nueva notificación"
	}
	notificationType = "info"
	priority = 1
	return title, message, notificationType, priority, nil
}
