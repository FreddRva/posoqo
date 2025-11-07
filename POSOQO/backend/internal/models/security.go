package models

import (
	"context"
	"database/sql"
	"time"

	"github.com/posoqo/backend/internal/db"
)

// LoginAttempt representa un intento de login
type LoginAttempt struct {
	ID           int64     `json:"id"`
	UserID       *int64    `json:"user_id"`
	Email        string    `json:"email"`
	IPAddress    string    `json:"ip_address"`
	UserAgent    string    `json:"user_agent"`
	Success      bool      `json:"success"`
	FailureReason string   `json:"failure_reason"`
	AttemptedAt  time.Time `json:"attempted_at"`
	CreatedAt    time.Time `json:"created_at"`
}

// AccountLock representa un bloqueo de cuenta
type AccountLock struct {
	ID         int64     `json:"id"`
	UserID     *int64    `json:"user_id"`
	Email      string    `json:"email"`
	IPAddress  string    `json:"ip_address"`
	LockedUntil time.Time `json:"locked_until"`
	LockReason string    `json:"lock_reason"`
	CreatedAt  time.Time `json:"created_at"`
}

// AuditLog representa un log de auditoría
type AuditLog struct {
	ID            int64     `json:"id"`
	UserID        *int64    `json:"user_id"`
	Action        string    `json:"action"`
	ResourceType  string    `json:"resource_type"`
	ResourceID    *int64    `json:"resource_id"`
	IPAddress     string    `json:"ip_address"`
	UserAgent     string    `json:"user_agent"`
	RequestMethod string    `json:"request_method"`
	RequestPath   string    `json:"request_path"`
	RequestBody   string    `json:"request_body"`
	ResponseStatus int      `json:"response_status"`
	ErrorMessage  string    `json:"error_message"`
	Metadata      string    `json:"metadata"`
	CreatedAt     time.Time `json:"created_at"`
}

// CSRFToken representa un token CSRF
type CSRFToken struct {
	ID        int64     `json:"id"`
	Token     string    `json:"token"`
	UserID    *int64    `json:"user_id"`
	IPAddress string    `json:"ip_address"`
	ExpiresAt time.Time `json:"expires_at"`
	Used      bool      `json:"used"`
	CreatedAt time.Time `json:"created_at"`
}

// User2FA representa la configuración 2FA de un usuario
type User2FA struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	Secret     string    `json:"secret"`
	Enabled    bool      `json:"enabled"`
	BackupCodes []string `json:"backup_codes"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// CreateLoginAttempt crea un registro de intento de login
func CreateLoginAttempt(ctx context.Context, attempt *LoginAttempt) error {
	var userID interface{}
	if attempt.UserID != nil {
		userID = *attempt.UserID
	} else {
		userID = nil
	}

	query := `
		INSERT INTO login_attempts (user_id, email, ip_address, user_agent, success, failure_reason)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, attempted_at, created_at
	`
	
	err := db.DB.QueryRow(ctx, query,
		userID, attempt.Email, attempt.IPAddress, attempt.UserAgent,
		attempt.Success, attempt.FailureReason,
	).Scan(&attempt.ID, &attempt.AttemptedAt, &attempt.CreatedAt)
	
	return err
}

// GetFailedLoginAttempts cuenta los intentos fallidos recientes
func GetFailedLoginAttempts(ctx context.Context, email string, ipAddress string, windowMinutes int) (int, error) {
	var count int
	window := time.Now().Add(-time.Duration(windowMinutes) * time.Minute)
	
	query := `
		SELECT COUNT(*) 
		FROM login_attempts 
		WHERE (email = $1 OR ip_address = $2) 
		AND success = FALSE 
		AND attempted_at > $3
	`
	
	err := db.DB.QueryRow(ctx, query, email, ipAddress, window).Scan(&count)
	return count, err
}

// CreateAccountLock crea un bloqueo de cuenta
func CreateAccountLock(ctx context.Context, lock *AccountLock) error {
	var userID interface{}
	if lock.UserID != nil {
		userID = *lock.UserID
	} else {
		userID = nil
	}

	query := `
		INSERT INTO account_locks (user_id, email, ip_address, locked_until, lock_reason)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	
	err := db.DB.QueryRow(ctx, query,
		userID, lock.Email, lock.IPAddress, lock.LockedUntil, lock.LockReason,
	).Scan(&lock.ID, &lock.CreatedAt)
	
	return err
}

// CheckAccountLock verifica si una cuenta está bloqueada
func CheckAccountLock(ctx context.Context, email string, ipAddress string) (*AccountLock, error) {
	var lock AccountLock
	var userID *int64
	
	query := `
		SELECT id, user_id, email, ip_address, locked_until, lock_reason, created_at
		FROM account_locks
		WHERE (email = $1 OR ip_address = $2)
		AND locked_until > NOW()
		ORDER BY locked_until DESC
		LIMIT 1
	`
	
	err := db.DB.QueryRow(ctx, query, email, ipAddress).Scan(
		&lock.ID, &userID, &lock.Email, &lock.IPAddress,
		&lock.LockedUntil, &lock.LockReason, &lock.CreatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	lock.UserID = userID
	return &lock, nil
}

// CreateAuditLog crea un log de auditoría
func CreateAuditLog(ctx context.Context, logEntry *AuditLog) error {
	var userID interface{}
	if logEntry.UserID != nil {
		userID = *logEntry.UserID
	} else {
		userID = nil
	}

	var resourceID interface{}
	if logEntry.ResourceID != nil {
		resourceID = *logEntry.ResourceID
	} else {
		resourceID = nil
	}

	query := `
		INSERT INTO audit_logs (
			user_id, action, resource_type, resource_id, ip_address, user_agent,
			request_method, request_path, request_body, response_status, error_message, metadata
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at
	`
	
	err := db.DB.QueryRow(ctx, query,
		userID, logEntry.Action, logEntry.ResourceType, resourceID,
		logEntry.IPAddress, logEntry.UserAgent, logEntry.RequestMethod,
		logEntry.RequestPath, logEntry.RequestBody, logEntry.ResponseStatus,
		logEntry.ErrorMessage, logEntry.Metadata,
	).Scan(&logEntry.ID, &logEntry.CreatedAt)
	
	return err
}

// CreateCSRFToken crea un token CSRF
func CreateCSRFToken(ctx context.Context, token *CSRFToken) error {
	var userID interface{}
	if token.UserID != nil {
		userID = *token.UserID
	} else {
		userID = nil
	}

	query := `
		INSERT INTO csrf_tokens (token, user_id, ip_address, expires_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	
	err := db.DB.QueryRow(ctx, query,
		token.Token, userID, token.IPAddress, token.ExpiresAt,
	).Scan(&token.ID, &token.CreatedAt)
	
	return err
}

// ValidateCSRFToken valida y marca como usado un token CSRF
func ValidateCSRFToken(ctx context.Context, token string, userID *int64, ipAddress string) (bool, error) {
	var dbToken CSRFToken
	var dbUserID sql.NullInt64
	
	query := `
		SELECT id, user_id, ip_address, expires_at, used
		FROM csrf_tokens
		WHERE token = $1 AND expires_at > NOW() AND used = FALSE
		LIMIT 1
	`
	
	err := db.DB.QueryRow(ctx, query, token).Scan(
		&dbToken.ID, &dbUserID, &dbToken.IPAddress, &dbToken.ExpiresAt, &dbToken.Used,
	)
	
	if err != nil {
		return false, err
	}
	
	// Validar que el usuario coincida si se proporciona
	if userID != nil && dbUserID.Valid {
		if *userID != dbUserID.Int64 {
			return false, nil
		}
	}
	
	// Validar IP (opcional, puede ser flexible)
	// if dbToken.IPAddress != ipAddress {
	// 	return false, nil
	// }
	
	// Marcar como usado
	_, err = db.DB.Exec(ctx, "UPDATE csrf_tokens SET used = TRUE WHERE id = $1", dbToken.ID)
	if err != nil {
		return false, err
	}
	
	return true, nil
}

// CreateUser2FA crea o actualiza la configuración 2FA de un usuario
func CreateUser2FA(ctx context.Context, user2FA *User2FA) error {
	query := `
		INSERT INTO user_2fa (user_id, secret, enabled, backup_codes)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id) 
		DO UPDATE SET secret = EXCLUDED.secret, enabled = EXCLUDED.enabled, 
		              backup_codes = EXCLUDED.backup_codes, updated_at = CURRENT_TIMESTAMP
		RETURNING id, created_at, updated_at
	`
	
	err := db.DB.QueryRow(ctx, query,
		user2FA.UserID, user2FA.Secret, user2FA.Enabled, user2FA.BackupCodes,
	).Scan(&user2FA.ID, &user2FA.CreatedAt, &user2FA.UpdatedAt)
	
	return err
}

// GetUser2FA obtiene la configuración 2FA de un usuario
func GetUser2FA(ctx context.Context, userID int64) (*User2FA, error) {
	var user2FA User2FA
	
	query := `
		SELECT id, user_id, secret, enabled, backup_codes, created_at, updated_at
		FROM user_2fa
		WHERE user_id = $1
	`
	
	err := db.DB.QueryRow(ctx, query, userID).Scan(
		&user2FA.ID, &user2FA.UserID, &user2FA.Secret, &user2FA.Enabled,
		&user2FA.BackupCodes, &user2FA.CreatedAt, &user2FA.UpdatedAt,
	)
	
	if err != nil {
		return nil, err
	}
	
	return &user2FA, nil
}

