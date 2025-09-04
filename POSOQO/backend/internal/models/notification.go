package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/posoqo/backend/internal/db"
)

// Notification representa una notificación en el sistema
type Notification struct {
	ID          int64           `json:"id" db:"id"`
	UserID      int64           `json:"user_id" db:"user_id"`
	Title       string          `json:"title" db:"title"`
	Message     *string         `json:"message,omitempty" db:"message"`
	Type        string          `json:"type" db:"type"`
	ReadAt      *time.Time      `json:"read_at,omitempty" db:"read_at"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
	ExpiresAt   *time.Time      `json:"expires_at,omitempty" db:"expires_at"`
	ActionURL   *string         `json:"action_url,omitempty" db:"action_url"`
	ActionLabel *string         `json:"action_label,omitempty" db:"action_label"`
	Metadata    json.RawMessage `json:"metadata,omitempty" db:"metadata"`
	Priority    int             `json:"priority" db:"priority"`
}

// NotificationStats representa estadísticas de notificaciones
type NotificationStats struct {
	UserID             int64      `json:"user_id" db:"user_id"`
	TotalNotifications int        `json:"total_notifications" db:"total_notifications"`
	UnreadCount        int        `json:"unread_count" db:"unread_count"`
	SuccessCount       int        `json:"success_count" db:"success_count"`
	ErrorCount         int        `json:"error_count" db:"error_count"`
	WarningCount       int        `json:"warning_count" db:"warning_count"`
	InfoCount          int        `json:"info_count" db:"info_count"`
	LastNotificationAt *time.Time `json:"last_notification_at,omitempty" db:"last_notification_at"`
}

// CreateNotification crea una nueva notificación
func CreateNotification(ctx context.Context, notification *Notification) error {
	query := `
		INSERT INTO notifications (user_id, title, message, type, expires_at, action_url, action_label, metadata, priority)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`

	return db.DB.QueryRow(ctx, query,
		notification.UserID,
		notification.Title,
		notification.Message,
		notification.Type,
		notification.ExpiresAt,
		notification.ActionURL,
		notification.ActionLabel,
		notification.Metadata,
		notification.Priority,
	).Scan(&notification.ID, &notification.CreatedAt, &notification.UpdatedAt)
}

// GetNotificationsByUser obtiene las notificaciones de un usuario
func GetNotificationsByUser(ctx context.Context, userID int64, limit, offset int) ([]Notification, error) {
	query := `
		SELECT id, user_id, title, message, type, read_at, created_at, updated_at, 
		       expires_at, action_url, action_label, metadata, priority
		FROM notifications 
		WHERE user_id = $1 
		ORDER BY priority DESC, created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := db.DB.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var n Notification
		err := rows.Scan(
			&n.ID, &n.UserID, &n.Title, &n.Message, &n.Type, &n.ReadAt,
			&n.CreatedAt, &n.UpdatedAt, &n.ExpiresAt, &n.ActionURL,
			&n.ActionLabel, &n.Metadata, &n.Priority,
		)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}

	return notifications, rows.Err()
}

// GetUnreadNotifications obtiene las notificaciones no leídas de un usuario
func GetUnreadNotifications(ctx context.Context, userID int64) ([]Notification, error) {
	query := `
		SELECT id, user_id, title, message, type, read_at, created_at, updated_at, 
		       expires_at, action_url, action_label, metadata, priority
		FROM notifications 
		WHERE user_id = $1 
		AND read_at IS NULL
		AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
		ORDER BY priority DESC, created_at DESC
	`

	rows, err := db.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var n Notification
		err := rows.Scan(
			&n.ID, &n.UserID, &n.Title, &n.Message, &n.Type, &n.ReadAt,
			&n.CreatedAt, &n.UpdatedAt, &n.ExpiresAt, &n.ActionURL,
			&n.ActionLabel, &n.Metadata, &n.Priority,
		)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}

	return notifications, rows.Err()
}

// MarkNotificationAsRead marca una notificación como leída
func MarkNotificationAsRead(ctx context.Context, notificationID, userID int64) error {
	query := `
		UPDATE notifications 
		SET read_at = CURRENT_TIMESTAMP 
		WHERE id = $1 AND user_id = $2
	`

	result, err := db.DB.Exec(ctx, query, notificationID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// MarkAllNotificationsAsRead marca todas las notificaciones de un usuario como leídas
func MarkAllNotificationsAsRead(ctx context.Context, userID int64) (int64, error) {
	query := `
		UPDATE notifications 
		SET read_at = CURRENT_TIMESTAMP 
		WHERE user_id = $1 AND read_at IS NULL
	`

	result, err := db.DB.Exec(ctx, query, userID)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}

// GetNotificationStats obtiene estadísticas de notificaciones de un usuario
func GetNotificationStats(ctx context.Context, userID int64) (*NotificationStats, error) {
	// Inicializar estadísticas con valores por defecto
	stats := &NotificationStats{
		UserID: userID,
	}

	// Consulta simple para contar notificaciones
	query := `
		SELECT 
			COUNT(*) as total_notifications,
			COUNT(*) FILTER (WHERE read_at IS NULL) as unread_count
		FROM notifications 
		WHERE user_id = $1
	`

	err := db.DB.QueryRow(ctx, query, userID).Scan(
		&stats.TotalNotifications, &stats.UnreadCount,
	)

	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("error contando notificaciones: %w", err)
	}

	// Consulta separada para contar por tipo
	typeQuery := `
		SELECT 
			COUNT(*) FILTER (WHERE type = 'success') as success_count,
			COUNT(*) FILTER (WHERE type = 'error') as error_count,
			COUNT(*) FILTER (WHERE type = 'warning') as warning_count,
			COUNT(*) FILTER (WHERE type = 'info') as info_count
		FROM notifications 
		WHERE user_id = $1
	`

	err = db.DB.QueryRow(ctx, typeQuery, userID).Scan(
		&stats.SuccessCount, &stats.ErrorCount, &stats.WarningCount, &stats.InfoCount,
	)

	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("error contando por tipo: %w", err)
	}

	// Consulta para obtener la última notificación
	var lastNotificationAt *time.Time
	err = db.DB.QueryRow(ctx, "SELECT MAX(created_at) FROM notifications WHERE user_id = $1", userID).Scan(&lastNotificationAt)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("error obteniendo última notificación: %w", err)
	}

	stats.LastNotificationAt = lastNotificationAt

	return stats, nil
}

// DeleteNotification elimina una notificación
func DeleteNotification(ctx context.Context, notificationID, userID int64) error {
	query := `DELETE FROM notifications WHERE id = $1 AND user_id = $2`

	result, err := db.DB.Exec(ctx, query, notificationID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// CleanupExpiredNotifications limpia las notificaciones expiradas
func CleanupExpiredNotifications(ctx context.Context) error {
	query := `SELECT cleanup_expired_notifications()`
	_, err := db.DB.Exec(ctx, query)
	return err
}

// CreateSystemNotification crea una notificación del sistema para todos los usuarios
func CreateSystemNotification(ctx context.Context, title, message, notificationType string, priority int) error {
	query := `
		INSERT INTO notifications (user_id, title, message, type, priority)
		SELECT id, $1, $2, $3, $4 FROM users WHERE active = true
	`

	_, err := db.DB.Exec(ctx, query, title, message, notificationType, priority)
	return err
}
