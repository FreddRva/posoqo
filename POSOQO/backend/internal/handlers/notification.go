package handlers

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/services"
)

// Notification representa una notificación
type Notification struct {
	ID        int64     `json:"id"`
	UserID    *string   `json:"user_id"` // ID del usuario destinatario (null para admin)
	Type      string    `json:"type"`    // success, error, warning, info
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	OrderID   *string   `json:"order_id,omitempty"`
	Priority  int       `json:"priority"` // 1=Baja, 2=Media, 3=Alta
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

// GetNotifications obtiene notificaciones para un usuario específico
func GetNotifications(c *fiber.Ctx) error {
	userID := c.Query("user_id")

	var query string
	var args []interface{}

	if userID != "" {
		// Notificaciones específicas del usuario
		query = `SELECT id, user_id, type, title, message, COALESCE(priority, 1), read_at, created_at 
		         FROM notifications 
		         WHERE user_id = $1 
		         ORDER BY priority DESC, created_at DESC 
		         LIMIT 50`
		args = []interface{}{userID}
	} else {
		// Notificaciones de admin (sin user_id)
		query = `SELECT id, user_id, type, title, message, COALESCE(priority, 1), read_at, created_at 
		         FROM notifications 
		         WHERE user_id IS NULL 
		         ORDER BY priority DESC, created_at DESC 
		         LIMIT 50`
	}

	rows, err := db.DB.Query(context.Background(), query, args...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error obteniendo notificaciones"})
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var n Notification
		var readAt *time.Time
		err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Title, &n.Message, &n.Priority, &readAt, &n.CreatedAt)
		if err != nil {
			continue
		}
		// Convertir read_at a is_read
		n.IsRead = readAt != nil
		notifications = append(notifications, n)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    notifications,
	})
}

// CreateNotification crea una nueva notificación
func CreateNotification(c *fiber.Ctx) error {
	var req struct {
		UserID  interface{} `json:"user_id,omitempty"`
		Type    string      `json:"type"`
		Title   string      `json:"title"`
		Message string      `json:"message"`
		OrderID *string     `json:"order_id,omitempty"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Validar tipo de notificación
	validTypes := map[string]bool{
		"success": true,
		"error":   true,
		"warning": true,
		"info":    true,
	}

	if !validTypes[req.Type] {
		return c.Status(400).JSON(fiber.Map{"error": "Tipo de notificación inválido"})
	}

	// Convertir user_id a string si es necesario
	var userID *string
	if req.UserID != nil {
		switch v := req.UserID.(type) {
		case string:
			userID = &v
		case float64:
			str := fmt.Sprintf("%.0f", v)
			userID = &str
		case int:
			str := fmt.Sprintf("%d", v)
			userID = &str
		default:
			return c.Status(400).JSON(fiber.Map{"error": "Tipo de user_id inválido"})
		}
	}

	// Crear notificación ASYNC - NO ESPERAR RESPUESTA
	fmt.Printf("Creando notificación: UserID=%v, Type=%s, Title=%s, Message=%s\n",
		userID, req.Type, req.Title, req.Message)

	// Respuesta inmediata sin esperar la base de datos
	go func() {
		_, err := db.DB.Exec(context.Background(),
			`INSERT INTO notifications (user_id, type, title, message, order_id, created_at)
			 VALUES ($1, $2, $3, $4, $5, NOW())`,
			userID, req.Type, req.Title, req.Message, req.OrderID)

		if err != nil {
			fmt.Printf("Error en la base de datos (async): %v\n", err)
		}
	}()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Notificación creada",
	})
}

// MarkNotificationAsRead marca una notificación como leída
func MarkNotificationAsRead(c *fiber.Ctx) error {
	notificationID := c.Params("id")

	// Actualizar la notificación marcándola como leída
	query := `UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = $1`
	result, err := db.DB.Exec(context.Background(), query, notificationID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error marcando notificación como leída"})
	}

	if result.RowsAffected() == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Notificación no encontrada"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Notificación marcada como leída",
	})
}

// GetNotificationStats obtiene estadísticas de notificaciones
func GetNotificationStats(c *fiber.Ctx) error {
	userID := c.Query("user_id")

	// Obtener estadísticas de notificaciones no leídas
	var unreadQuery string
	var unreadArgs []interface{}

	if userID != "" {
		// Estadísticas para usuario específico
		unreadQuery = `SELECT type, COUNT(*) as count
		               FROM notifications
		               WHERE user_id = $1 AND read_at IS NULL
		               GROUP BY type`
		unreadArgs = []interface{}{userID}
	} else {
		// Estadísticas para admin
		unreadQuery = `SELECT type, COUNT(*) as count
		               FROM notifications
		               WHERE user_id IS NULL AND read_at IS NULL
		               GROUP BY type`
	}

	unreadRows, err := db.DB.Query(context.Background(), unreadQuery, unreadArgs...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error obteniendo estadísticas"})
	}
	defer unreadRows.Close()

	// Obtener estadísticas totales
	var totalQuery string
	var totalArgs []interface{}

	if userID != "" {
		totalQuery = `SELECT type, COUNT(*) as count
		              FROM notifications
		              WHERE user_id = $1
		              GROUP BY type`
		totalArgs = []interface{}{userID}
	} else {
		totalQuery = `SELECT type, COUNT(*) as count
		              FROM notifications
		              WHERE user_id IS NULL
		              GROUP BY type`
	}

	totalRows, err := db.DB.Query(context.Background(), totalQuery, totalArgs...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error obteniendo estadísticas"})
	}
	defer totalRows.Close()

	stats := fiber.Map{
		"total":    0,
		"unread":   0,
		"orders":   0,
		"users":    0,
		"products": 0,
		"system":   0,
	}

	// Procesar notificaciones no leídas
	for unreadRows.Next() {
		var notificationType string
		var count int
		if err := unreadRows.Scan(&notificationType, &count); err != nil {
			continue
		}

		// Mapear tipos a categorías
		switch notificationType {
		case "order":
			stats["orders"] = count
		case "user":
			stats["users"] = count
		case "product":
			stats["products"] = count
		case "system":
			stats["system"] = count
		case "admin":
			stats["admin"] = count
		}
		stats["unread"] = stats["unread"].(int) + count
	}

	// Procesar total de notificaciones
	for totalRows.Next() {
		var notificationType string
		var count int
		if err := totalRows.Scan(&notificationType, &count); err != nil {
			continue
		}
		stats["total"] = stats["total"].(int) + count
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

// MarkNotificationsAsReadByType marca todas las notificaciones de un tipo específico como leídas
func MarkNotificationsAsReadByType(c *fiber.Ctx) error {
	notificationType := c.Params("type")

	// Validar tipo de notificación
	validTypes := map[string]bool{
		"success": true,
		"error":   true,
		"warning": true,
		"info":    true,
	}

	if !validTypes[notificationType] {
		return c.Status(400).JSON(fiber.Map{"error": "Tipo de notificación inválido"})
	}

	// Marcar como leídas todas las notificaciones del tipo especificado
	_, err := db.DB.Exec(context.Background(),
		`UPDATE notifications 
		 SET is_read = true, updated_at = NOW() 
		 WHERE type = $1 AND is_read = false`,
		notificationType)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error marcando notificaciones como leídas"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Notificaciones marcadas como leídas",
	})
}

// CreatePaymentNotification crea una notificación de pago exitoso
func CreatePaymentNotification(c *fiber.Ctx) error {
	var req struct {
		UserID int64   `json:"user_id"`
		Amount float64 `json:"amount"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Crear notificación de pago exitoso
	_, err := db.DB.Exec(context.Background(),
		`INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
		 VALUES ($1, 'success', 'Pago Exitoso', $2, false, NOW())`,
		req.UserID, fmt.Sprintf("Tu pago de S/%.2f ha sido procesado exitosamente", req.Amount),
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error creando notificación"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Notificación de pago creada",
	})
}

// MarkAllNotificationsAsRead marca todas las notificaciones no leídas como leídas
func MarkAllNotificationsAsRead(c *fiber.Ctx) error {
	userID := c.Query("user_id")

	var query string
	var args []interface{}

	if userID != "" {
		// Para usuario específico
		query = `UPDATE notifications 
		         SET is_read = true, updated_at = NOW() 
		         WHERE user_id = $1 AND is_read = false`
		args = []interface{}{userID}
	} else {
		// Para admin (todas las notificaciones sin user_id)
		query = `UPDATE notifications 
		         SET is_read = true, updated_at = NOW() 
		         WHERE user_id IS NULL AND is_read = false`
	}

	_, err := db.DB.Exec(context.Background(), query, args...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error marcando notificaciones como leídas"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Todas las notificaciones marcadas como leídas",
	})
}

// CreateNotificationsTable crea/actualiza la tabla de notificaciones
func CreateNotificationsTable(c *fiber.Ctx) error {
	_, err := db.DB.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS notifications (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			type VARCHAR(50) NOT NULL,
			title VARCHAR(255) NOT NULL,
			message TEXT NOT NULL,
			order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
			is_read BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		)
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error creando tabla: " + err.Error()})
	}

	// Crear índices
	db.DB.Exec(context.Background(), `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`)
	db.DB.Exec(context.Background(), `CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)`)
	db.DB.Exec(context.Background(), `CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)`)
	db.DB.Exec(context.Background(), `CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)`)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tabla de notificaciones creada/actualizada",
	})
}

// CreateAutomaticNotification crea notificaciones automáticas (sin prioridad)
func CreateAutomaticNotification(notificationType string, title string, message string, userID *string, orderID *string) error {
	return CreateAutomaticNotificationWithPriority(notificationType, title, message, userID, orderID, 1)
}

// CreateAutomaticNotificationWithPriority crea notificaciones automáticas con prioridad
func CreateAutomaticNotificationWithPriority(notificationType string, title string, message string, userID *string, orderID *string, priority int) error {
	_, err := db.DB.Exec(context.Background(),
		`INSERT INTO notifications (user_id, type, title, message, order_id, priority, is_read, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, false, NOW())`,
		userID, notificationType, title, message, orderID, priority)

	return err
}

// CreateOrderNotification crea notificación cuando se crea un pedido usando IA
func CreateOrderNotification(orderID string, userID string, status string) error {
	// Obtener información del pedido y usuario
	var userName string
	var orderTotal float64

	err := db.DB.QueryRow(context.Background(),
		`SELECT u.name, o.total 
		 FROM orders o 
		 JOIN users u ON o.user_id = u.id 
		 WHERE o.id = $1`, orderID).Scan(&userName, &orderTotal)

	if err != nil {
		userName = "Usuario"
		orderTotal = 0.0
	}

	// Crear notificaciones en paralelo para mayor velocidad
	var wg sync.WaitGroup

	// Notificación para el usuario con IA
	if userID != "" {
		wg.Add(1)
		go func() {
			defer wg.Done()

			ctx := services.NotificationContext{
				Type:       "order",
				Action:     status,
				UserName:   userName,
				EntityID:   orderID,
				Amount:     orderTotal,
				Status:     status,
				IsForAdmin: false,
			}

			title, message, notifType, priority, err := services.GenerateSmartNotification(ctx)
			if err != nil {
				fmt.Printf("Error generando notificación con IA: %v\n", err)
				return
			}

			err = CreateAutomaticNotificationWithPriority(notifType, title, message, &userID, &orderID, priority)
			if err != nil {
				fmt.Printf("Error creando notificación de pedido para usuario: %v\n", err)
			}
		}()
	}

	// Notificación para admin con IA
	wg.Add(1)
	go func() {
		defer wg.Done()

		ctx := services.NotificationContext{
			Type:       "order",
			Action:     status,
			UserName:   userName,
			EntityID:   orderID,
			Amount:     orderTotal,
			Status:     status,
			IsForAdmin: true,
		}

		title, message, notifType, priority, err := services.GenerateSmartNotification(ctx)
		if err != nil {
			fmt.Printf("Error generando notificación con IA: %v\n", err)
			return
		}

		err = CreateAutomaticNotificationWithPriority(notifType, title, message, nil, &orderID, priority)
		if err != nil {
			fmt.Printf("Error creando notificación de pedido para admin: %v\n", err)
		}
	}()

	// Esperar a que ambas notificaciones se completen
	wg.Wait()
	return nil
}

// CreateUserNotification crea notificación cuando se registra un usuario
func CreateUserNotification(userID string, userName string) error {
	title := "Nuevo usuario registrado"
	message := fmt.Sprintf("El usuario %s se ha registrado", userName)

	// Notificación para admin
	err := CreateAutomaticNotification("info", title, message, nil, nil)
	if err != nil {
		fmt.Printf("Error creando notificación de usuario: %v\n", err)
	}

	return err
}

// CreateProductNotification crea notificación cuando hay cambios en productos
func CreateProductNotification(productName string, action string) error {
	title := fmt.Sprintf("Producto %s", action)
	message := fmt.Sprintf("El producto '%s' ha sido %s", productName, action)

	// Notificación para admin
	err := CreateAutomaticNotification("info", title, message, nil, nil)
	if err != nil {
		fmt.Printf("Error creando notificación de producto: %v\n", err)
	}

	return err
}

// CreateSystemNotification crea notificación del sistema
func CreateSystemNotification(title string, message string, userID *string) error {
	err := CreateAutomaticNotification("info", title, message, userID, nil)
	if err != nil {
		fmt.Printf("Error creando notificación del sistema: %v\n", err)
	}

	return err
}

// CreateTestNotifications crea notificaciones de prueba
func CreateTestNotifications(c *fiber.Ctx) error {
	// Crear algunas notificaciones de prueba
	testNotifications := []struct {
		title   string
		message string
		type_   string
	}{
		{
			title:   "Nuevo pedido recibido",
			message: "Se ha recibido un nuevo pedido #12345",
			type_:   "success",
		},
		{
			title:   "Usuario registrado",
			message: "Un nuevo usuario se ha registrado en el sistema",
			type_:   "info",
		},
		{
			title:   "Producto actualizado",
			message: "El producto 'Cerveza Artesanal' ha sido actualizado",
			type_:   "warning",
		},
		{
			title:   "Mantenimiento del sistema",
			message: "El sistema estará en mantenimiento mañana de 2:00 a 4:00 AM",
			type_:   "error",
		},
	}

	for _, notification := range testNotifications {
		_, err := db.DB.Exec(context.Background(),
			`INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
			 VALUES (NULL, $1, $2, $3, false, NOW())`,
			notification.type_, notification.title, notification.message)

		if err != nil {
			fmt.Printf("Error creando notificación de prueba: %v\n", err)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Notificaciones de prueba creadas",
	})
}
