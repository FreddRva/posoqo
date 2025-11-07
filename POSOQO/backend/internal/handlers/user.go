package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/posoqo/backend/internal/db"
	"github.com/posoqo/backend/internal/models"
	"github.com/posoqo/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

// Estructuras para tokens
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// Configuración de tokens
const (
	ACCESS_TOKEN_DURATION  = 15 * time.Minute   // 15 minutos para producción
	REFRESH_TOKEN_DURATION = 7 * 24 * time.Hour // 7 días
)

// Generar par de tokens (access + refresh)
func generateTokenPair(userID int64, name, email, role string) (*TokenPair, error) {
	// Obtener secretos de variables de entorno
	accessSecret := os.Getenv("JWT_ACCESS_SECRET")
	refreshSecret := os.Getenv("JWT_REFRESH_SECRET")

	if accessSecret == "" || refreshSecret == "" {
		return nil, fmt.Errorf("JWT secrets no configurados")
	}

	// Generar Access Token (corta duración)
	accessClaims := jwt.MapClaims{
		"id":    userID,
		"name":  name,
		"email": email,
		"role":  role,
		"type":  "access",
		"exp":   time.Now().Add(ACCESS_TOKEN_DURATION).Unix(),
		"iat":   time.Now().Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(accessSecret))
	if err != nil {
		return nil, err
	}

	// Generar Refresh Token (larga duración)
	refreshClaims := jwt.MapClaims{
		"id":    userID,
		"email": email,
		"type":  "refresh",
		"exp":   time.Now().Add(REFRESH_TOKEN_DURATION).Unix(),
		"iat":   time.Now().Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(refreshSecret))
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiresIn:    int64(ACCESS_TOKEN_DURATION.Seconds()),
	}, nil
}

// Log de auditoría para intentos de login
func logAuthAttempt(email, ip, userAgent, status string) {
	log.Printf("[AUTH] %s | IP: %s | User-Agent: %s | Status: %s",
		email, ip, userAgent, status)
}

// Log de auditoría para registros
func logRegistration(email, ip, userAgent string) {
	log.Printf("[REGISTER] %s | IP: %s | User-Agent: %s | Status: SUCCESS",
		email, ip, userAgent)
}

// createAuditLog crea un log de auditoría en la base de datos
func createAuditLog(ctx context.Context, userID *int64, action, resourceType string, resourceID *int64, ipAddress, userAgent, method, path, requestBody string, responseStatus int, errorMessage, metadata string) {
	auditLog := &models.AuditLog{
		UserID:         userID,
		Action:         action,
		ResourceType:   resourceType,
		ResourceID:     resourceID,
		IPAddress:      ipAddress,
		UserAgent:      userAgent,
		RequestMethod:  method,
		RequestPath:    path,
		RequestBody:    requestBody,
		ResponseStatus: responseStatus,
		ErrorMessage:   errorMessage,
		Metadata:       metadata,
	}

	// Ejecutar en goroutine para no bloquear la respuesta
	go func() {
		if err := models.CreateAuditLog(context.Background(), auditLog); err != nil {
			log.Printf("[ERROR] Error creating audit log: %v", err)
		}
	}()
}

type RegisterRequest struct {
	Name     string `json:"name"`
	LastName string `json:"last_name"`
	DNI      string `json:"dni"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterUser godoc
// @Summary Registro de usuario
// @Description Crea un nuevo usuario en el sistema
// @Tags auth
// @Accept json
// @Produce json
// @Param data body RegisterRequest true "Datos de registro"
// @Success 201 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Router /api/register [post]
func RegisterUser(c *fiber.Ctx) error {
	// Obtener información del cliente para auditoría
	clientIP := c.IP()
	userAgent := c.Get("User-Agent")

	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		logAuthAttempt(req.Email, clientIP, userAgent, "INVALID_DATA")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Sanitización de datos
	req.Name = strings.TrimSpace(req.Name)
	req.LastName = strings.TrimSpace(req.LastName)
	req.DNI = strings.TrimSpace(req.DNI) // DNI es opcional, puede estar vacío
	req.Phone = strings.TrimSpace(req.Phone)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Password = strings.TrimSpace(req.Password)

	// Validaciones robustas
	if !utils.IsValidName(req.Name, 2, 50) {
		logAuthAttempt(req.Email, clientIP, userAgent, "INVALID_NAME")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Nombre inválido (solo letras, 2-50 caracteres)"})
	}
	if !utils.IsValidName(req.LastName, 2, 50) {
		logAuthAttempt(req.Email, clientIP, userAgent, "INVALID_LASTNAME")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Apellido inválido (solo letras, 2-50 caracteres)"})
	}
	// DNI es opcional - no se valida en el registro, se puede completar después
	if !utils.IsValidPeruvianPhone(req.Phone) {
		logAuthAttempt(req.Email, clientIP, userAgent, "INVALID_PHONE")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Número de teléfono inválido. Debe ser un celular peruano válido (ej: 987654321 o +51 987654321)"})
	}
	if !utils.IsValidEmail(req.Email) {
		logAuthAttempt(req.Email, clientIP, userAgent, "INVALID_EMAIL")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Email inválido o dominio no válido"})
	}

	// Verificar que el dominio del email tenga registros MX (puede recibir emails)
	// Esto verifica que el dominio realmente exista y pueda recibir emails
	domainValid, err := utils.VerifyEmailDomain(req.Email)
	if err != nil || !domainValid {
		logAuthAttempt(req.Email, clientIP, userAgent, "INVALID_EMAIL_DOMAIN")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "El dominio del email no existe o no puede recibir correos. Por favor, usa un email válido."})
	}

	if !utils.IsStrongPassword(req.Password) {
		logAuthAttempt(req.Email, clientIP, userAgent, "WEAK_PASSWORD")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo"})
	}

	// Verificar si el email ya existe
	var exists bool
	err := db.DB.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)", req.Email).Scan(&exists)
	if err != nil {
		logAuthAttempt(req.Email, clientIP, userAgent, "DB_ERROR")
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error interno"})
	}
	if exists {
		logAuthAttempt(req.Email, clientIP, userAgent, "EMAIL_EXISTS")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "El email ya está registrado"})
	}

	// Hashear la contraseña con bcrypt
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		logAuthAttempt(req.Email, clientIP, userAgent, "HASH_ERROR")
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al procesar contraseña"})
	}

	// Insertar usuario en la base de datos (DNI es opcional, puede ser string vacío)
	// El DNI se puede completar después en el perfil del usuario
	_, err = db.DB.Exec(context.Background(),
		"INSERT INTO users (name, last_name, dni, phone, email, password, role) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		req.Name, req.LastName, req.DNI, req.Phone, req.Email, string(hash), "user")
	if err != nil {
		logAuthAttempt(req.Email, clientIP, userAgent, "INSERT_ERROR")
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al registrar usuario"})
	}

	// Enviar email de verificación
	var userID int64
	db.DB.QueryRow(context.Background(), "SELECT id FROM users WHERE email=$1", req.Email).Scan(&userID)
	if userID != 0 {
		go sendVerificationEmail(userID, req.Email, req.Name)
	}

	// Crear notificación automática para nuevo usuario
	title := "Nuevo usuario registrado"
	message := fmt.Sprintf("El usuario %s se ha registrado con el email %s", req.Name, req.Email)
	_, err = db.DB.Exec(context.Background(),
		`INSERT INTO notifications (title, message, type, is_read, created_at)
		 VALUES ($1, $2, $3, false, NOW())`,
		title, message, "info")

	if err != nil {
		fmt.Printf("Error creando notificación: %v\n", err)
	}

	// Log de auditoría exitoso
	logRegistration(req.Email, clientIP, userAgent)

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"message": "Usuario registrado correctamente. Se ha enviado un email de verificación a tu correo electrónico. Por favor, revisa tu bandeja de entrada y verifica tu email antes de iniciar sesión.",
		"user": fiber.Map{
			"name":  req.Name,
			"email": req.Email,
		},
	})
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginUser godoc
// @Summary Login de usuario
// @Description Autentica un usuario y retorna tokens JWT
// @Tags auth
// @Accept json
// @Produce json
// @Param data body LoginRequest true "Credenciales de login"
// @Success 200 {object} TokenPair
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /api/login [post]
func LoginUser(c *fiber.Ctx) error {
	ctx := context.Background()
	clientIP := c.IP()
	userAgent := c.Get("User-Agent")
	startTime := time.Now() // Para protección contra timing attacks

	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		logAuthAttempt("unknown", clientIP, userAgent, "INVALID_DATA")
		createAuditLog(ctx, nil, "LOGIN_ATTEMPT", "user", nil, clientIP, userAgent, "POST", "/api/auth/login", "", 400, "Invalid request data", "")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Sanitización de inputs
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Password = strings.TrimSpace(req.Password)

	if req.Email == "" || req.Password == "" {
		logAuthAttempt(req.Email, clientIP, userAgent, "EMPTY_CREDENTIALS")
		createAuditLog(ctx, nil, "LOGIN_ATTEMPT", "user", nil, clientIP, userAgent, "POST", "/api/auth/login", "", 400, "Empty credentials", "")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Email y contraseña son obligatorios"})
	}

	// 1. VERIFICAR BLOQUEO DE CUENTA
	lock, err := models.CheckAccountLock(ctx, req.Email, clientIP)
	if err == nil && lock != nil {
		remaining := time.Until(lock.LockedUntil)
		logAuthAttempt(req.Email, clientIP, userAgent, "ACCOUNT_LOCKED")
		createAuditLog(ctx, nil, "LOGIN_ATTEMPT", "user", nil, clientIP, userAgent, "POST", "/api/auth/login", "", 423, "Account locked", fmt.Sprintf(`{"locked_until": "%s", "remaining_minutes": %.0f}`, lock.LockedUntil, remaining.Minutes()))
		return c.Status(423).JSON(fiber.Map{
			"error":             "Cuenta bloqueada temporalmente debido a múltiples intentos fallidos",
			"locked_until":      lock.LockedUntil,
			"remaining_minutes": int(remaining.Minutes()) + 1,
		})
	}

	// 2. VERIFICAR INTENTOS FALLIDOS RECIENTES
	failedAttempts, err := models.GetFailedLoginAttempts(ctx, req.Email, clientIP, utils.FailedAttemptWindow)
	if err != nil {
		log.Printf("[ERROR] Error checking failed attempts: %v", err)
	}

	if failedAttempts >= utils.MaxFailedAttempts {
		// Bloquear cuenta
		lockUntil := time.Now().Add(utils.GetLockoutDuration())
		accountLock := &models.AccountLock{
			Email:       req.Email,
			IPAddress:   clientIP,
			LockedUntil: lockUntil,
			LockReason:  "Too many failed login attempts",
		}
		models.CreateAccountLock(ctx, accountLock)

		logAuthAttempt(req.Email, clientIP, userAgent, "ACCOUNT_LOCKED_AUTO")
		createAuditLog(ctx, nil, "ACCOUNT_LOCKED", "user", nil, clientIP, userAgent, "POST", "/api/auth/login", "", 423, "Account auto-locked", fmt.Sprintf(`{"locked_until": "%s"}`, lockUntil))

		return c.Status(423).JSON(fiber.Map{
			"error":             "Cuenta bloqueada temporalmente debido a múltiples intentos fallidos",
			"locked_until":      lockUntil,
			"remaining_minutes": utils.LockoutDurationMinutes,
		})
	}

	// 3. BUSCAR USUARIO (protección contra timing attack - siempre buscar, incluso si no existe)
	var id int64
	var name, email, hash, role string
	var emailVerified bool
	var userExists bool

	err = db.DB.QueryRow(ctx,
		"SELECT id, name, email, password, role, email_verified FROM users WHERE email=$1",
		req.Email).Scan(&id, &name, &email, &hash, &role, &emailVerified)

	if err != nil {
		userExists = false
		// Crear hash dummy para prevenir timing attacks
		dummyHash, _ := bcrypt.GenerateFromPassword([]byte("dummy"), bcrypt.DefaultCost)
		hash = string(dummyHash)
	} else {
		userExists = true
	}

	// 4. VERIFICAR CONTRASEÑA (siempre ejecutar para prevenir timing attacks)
	passwordValid := false
	if userExists {
		if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err == nil {
			passwordValid = true
		}
	} else {
		// Comparar con hash dummy para mantener tiempo constante
		bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password))
	}

	// 5. VERIFICAR EMAIL VERIFICADO (solo si usuario existe y contraseña válida)
	if !userExists || !passwordValid || !emailVerified {
		// Registrar intento fallido
		failureReason := "INVALID_CREDENTIALS"
		if userExists && passwordValid && !emailVerified {
			failureReason = "EMAIL_NOT_VERIFIED"
		}

		attempt := &models.LoginAttempt{
			Email:         req.Email,
			IPAddress:     clientIP,
			UserAgent:     userAgent,
			Success:       false,
			FailureReason: failureReason,
		}
		if userExists {
			attempt.UserID = &id
		}
		models.CreateLoginAttempt(ctx, attempt)

		logAuthAttempt(req.Email, clientIP, userAgent, failureReason)
		createAuditLog(ctx, &id, "LOGIN_ATTEMPT_FAILED", "user", &id, clientIP, userAgent, "POST", "/api/auth/login", "", 401, failureReason, "")

		// Asegurar tiempo constante antes de responder (protección timing attack)
		elapsed := time.Since(startTime)
		minDuration := 200 * time.Millisecond // Mínimo 200ms para prevenir timing attacks
		if elapsed < minDuration {
			time.Sleep(minDuration - elapsed)
		}

		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Credenciales inválidas"})
	}

	// 6. VERIFICAR 2FA SI ESTÁ HABILITADO
	user2FA, err := models.GetUser2FA(ctx, id)
	if err == nil && user2FA != nil && user2FA.Enabled {
		// Verificar código 2FA del request
		var req2FA struct {
			TotpCode string `json:"totp_code"`
		}
		c.BodyParser(&req2FA)

		if req2FA.TotpCode == "" {
			createAuditLog(ctx, &id, "LOGIN_2FA_REQUIRED", "user", &id, clientIP, userAgent, "POST", "/api/auth/login", "", 200, "", "")
			return c.Status(http.StatusOK).JSON(fiber.Map{
				"requires_2fa": true,
				"message":      "Código 2FA requerido",
			})
		}

		// Validar código TOTP
		if !utils.ValidateTOTP(user2FA.Secret, req2FA.TotpCode) {
			// También verificar backup codes
			backupValid := false
			for i, code := range user2FA.BackupCodes {
				if utils.ConstantTimeCompare(code, req2FA.TotpCode) {
					backupValid = true
					// Remover código usado
					user2FA.BackupCodes = append(user2FA.BackupCodes[:i], user2FA.BackupCodes[i+1:]...)
					models.CreateUser2FA(ctx, user2FA)
					break
				}
			}

			if !backupValid {
				attempt := &models.LoginAttempt{
					UserID:        &id,
					Email:         req.Email,
					IPAddress:     clientIP,
					UserAgent:     userAgent,
					Success:       false,
					FailureReason: "INVALID_2FA_CODE",
				}
				models.CreateLoginAttempt(ctx, attempt)
				logAuthAttempt(req.Email, clientIP, userAgent, "INVALID_2FA_CODE")
				createAuditLog(ctx, &id, "LOGIN_2FA_FAILED", "user", &id, clientIP, userAgent, "POST", "/api/auth/login", "", 401, "Invalid 2FA code", "")
				return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Código 2FA inválido"})
			}
		}
	}

	// 7. LOGIN EXITOSO
	// Registrar intento exitoso
	attempt := &models.LoginAttempt{
		UserID:    &id,
		Email:     req.Email,
		IPAddress: clientIP,
		UserAgent: userAgent,
		Success:   true,
	}
	models.CreateLoginAttempt(ctx, attempt)

	// Generar par de tokens
	tokenPair, err := generateTokenPair(id, name, email, role)
	if err != nil {
		logAuthAttempt(req.Email, clientIP, userAgent, "TOKEN_GENERATION_ERROR")
		createAuditLog(ctx, &id, "LOGIN_TOKEN_ERROR", "user", &id, clientIP, userAgent, "POST", "/api/auth/login", "", 500, "Token generation failed", "")
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al generar tokens"})
	}

	// Log de auditoría exitoso
	logAuthAttempt(req.Email, clientIP, userAgent, "SUCCESS")
	createAuditLog(ctx, &id, "LOGIN_SUCCESS", "user", &id, clientIP, userAgent, "POST", "/api/auth/login", "", 200, "", "")

	return c.JSON(fiber.Map{
		"message": "Login exitoso",
		"user": fiber.Map{
			"id":    id,
			"name":  name,
			"email": email,
			"role":  role,
		},
		"tokens": tokenPair,
	})
}

// RefreshToken godoc
// @Summary Renovar token de acceso
// @Description Renueva el access token usando un refresh token válido
// @Tags auth
// @Accept json
// @Produce json
// @Param data body RefreshTokenRequest true "Refresh token"
// @Success 200 {object} TokenPair
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /api/refresh [post]
func RefreshToken(c *fiber.Ctx) error {
	clientIP := c.IP()
	userAgent := c.Get("User-Agent")

	var req RefreshTokenRequest
	if err := c.BodyParser(&req); err != nil {
		logAuthAttempt("unknown", clientIP, userAgent, "INVALID_REFRESH_DATA")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if req.RefreshToken == "" {
		logAuthAttempt("unknown", clientIP, userAgent, "EMPTY_REFRESH_TOKEN")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Refresh token requerido"})
	}

	// Verificar refresh token
	refreshSecret := os.Getenv("JWT_REFRESH_SECRET")
	if refreshSecret == "" {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Configuración inválida"})
	}

	token, err := jwt.Parse(req.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
		}
		return []byte(refreshSecret), nil
	})

	if err != nil {
		logAuthAttempt("unknown", clientIP, userAgent, "INVALID_REFRESH_TOKEN")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Refresh token inválido"})
	}

	if !token.Valid {
		logAuthAttempt("unknown", clientIP, userAgent, "INVALID_REFRESH_TOKEN")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Refresh token inválido"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		logAuthAttempt("unknown", clientIP, userAgent, "INVALID_REFRESH_CLAIMS")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Token inválido"})
	}

	// Verificar que sea un refresh token
	if claims["type"] != "refresh" {
		logAuthAttempt("unknown", clientIP, userAgent, "WRONG_TOKEN_TYPE")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Tipo de token inválido"})
	}

	// Obtener datos del usuario
	userID := int64(claims["id"].(float64))
	email := claims["email"].(string)

	var name, role string
	err = db.DB.QueryRow(context.Background(),
		"SELECT name, role FROM users WHERE id=$1 AND email=$2",
		userID, email).Scan(&name, &role)

	if err != nil {
		logAuthAttempt(email, clientIP, userAgent, "USER_NOT_FOUND_REFRESH")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Generar nuevo par de tokens
	tokenPair, err := generateTokenPair(userID, name, email, role)
	if err != nil {
		logAuthAttempt(email, clientIP, userAgent, "REFRESH_TOKEN_GENERATION_ERROR")
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al generar tokens"})
	}

	logAuthAttempt(email, clientIP, userAgent, "REFRESH_SUCCESS")

	return c.JSON(fiber.Map{
		"message": "Tokens renovados exitosamente",
		"tokens":  tokenPair,
	})
}

func Profile(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := claims["id"].(float64)
	userName := claims["name"].(string)
	userEmail := claims["email"].(string)
	userRole := claims["role"].(string)

	// Log solo en desarrollo
	if os.Getenv("NODE_ENV") != "production" {
		log.Printf("[DEBUG] Profile - Request for user ID: %v, Name: %s, Email: %s", userID, userName, utils.SanitizeForLog(userEmail))
	}

	// Una sola consulta que obtenga todos los datos
	var name, lastName, dni, phone, email, role string
	var address, addressRef, streetNumber sql.NullString
	var lat, lng sql.NullFloat64

	err := db.DB.QueryRow(context.Background(),
		`SELECT name, last_name, dni, phone, email, role, 
		        address, address_ref, street_number, lat, lng 
		 FROM users WHERE id = $1`, int64(userID)).
		Scan(&name, &lastName, &dni, &phone, &email, &role, &address, &addressRef, &streetNumber, &lat, &lng)

	if err != nil {
		log.Printf("[ERROR] Profile - Error fetching user data: %v", err)
		// Si hay error, devolver datos básicos del token
		return c.JSON(fiber.Map{
			"id":           userID,
			"name":         userName,
			"last_name":    "",
			"dni":          "",
			"phone":        "",
			"email":        userEmail,
			"role":         userRole,
			"address":      "",
			"addressRef":   "",
			"streetNumber": "",
			"lat":          nil,
			"lng":          nil,
			"warning":      "Error al obtener datos del usuario",
		})
	}

	log.Printf("[DEBUG] Profile - Found user in database: ID=%v, Name=%s, LastName=%s, DNI=%s, Phone=%s, Address=%s",
		userID, name, lastName, dni, phone, address.String)

	return c.JSON(fiber.Map{
		"id":           userID,
		"name":         name,
		"last_name":    lastName,
		"dni":          dni,
		"phone":        phone,
		"email":        email,
		"role":         role,
		"address":      address.String,
		"addressRef":   addressRef.String,
		"streetNumber": streetNumber.String,
		"lat":          lat.Float64,
		"lng":          lng.Float64,
	})
}

// Logout godoc
// @Summary Logout de usuario
// @Description Invalida el refresh token del usuario
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]string
// @Router /api/logout [post]
func Logout(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	email := claims["email"].(string)
	clientIP := c.IP()
	userAgent := c.Get("User-Agent")

	// En una implementación más avanzada, aquí se invalidaría el refresh token
	// guardándolo en una blacklist o base de datos

	logAuthAttempt(email, clientIP, userAgent, "LOGOUT")

	return c.JSON(fiber.Map{
		"message": "Logout exitoso",
	})
}

// Listar todos los usuarios (solo admin)
func ListUsers(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	search := strings.TrimSpace(c.Query("search"))

	where := ""
	args := []interface{}{}
	if search != "" {
		where = "WHERE LOWER(name) LIKE $1 OR LOWER(email) LIKE $1"
		args = append(args, "%"+strings.ToLower(search)+"%")
	}

	countQuery := "SELECT COUNT(*) FROM users " + where
	var total int
	if err := db.DB.QueryRow(context.Background(), countQuery, args...).Scan(&total); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al contar usuarios"})
	}
	offset := (page - 1) * limit
	listQuery := "SELECT id, name, email, role, created_at FROM users " + where + " ORDER BY created_at DESC LIMIT $" + fmt.Sprint(len(args)+1) + " OFFSET $" + fmt.Sprint(len(args)+2)
	args = append(args, limit, offset)

	rows, err := db.DB.Query(context.Background(), listQuery, args...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al obtener usuarios"})
	}
	defer rows.Close()

	users := []fiber.Map{}
	for rows.Next() {
		var id int64
		var name, email, role, createdAt string
		if err := rows.Scan(&id, &name, &email, &role, &createdAt); err != nil {
			continue
		}
		users = append(users, fiber.Map{
			"id":         id,
			"name":       name,
			"email":      email,
			"role":       role,
			"created_at": createdAt,
		})
	}
	return c.JSON(fiber.Map{
		"users": users,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
			"pages": (total + limit - 1) / limit,
		},
	})
}

// Ver detalle de un usuario (solo admin)
func GetUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var name, email, role, createdAt string
	err := db.DB.QueryRow(context.Background(),
		`SELECT name, email, role, created_at FROM users WHERE id=$1`, id).Scan(&name, &email, &role, &createdAt)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}
	return c.JSON(fiber.Map{
		"id":         id,
		"name":       name,
		"email":      email,
		"role":       role,
		"created_at": createdAt,
	})
}

// Obtener usuario por email (para auth social y sesión)
func GetUserByEmail(c *fiber.Ctx) error {
	email := strings.ToLower(c.Params("email"))
	var id int64
	var name, emailDB, role string
	err := db.DB.QueryRow(context.Background(), "SELECT id, name, email, role FROM users WHERE email=$1", email).Scan(&id, &name, &emailDB, &role)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}
	return c.JSON(fiber.Map{
		"user": fiber.Map{
			"id":    id,
			"name":  name,
			"email": emailDB,
			"role":  role,
		},
	})
}

type UpdateUserRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

// Editar datos y rol de un usuario (solo admin)
func UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil || req.Name == "" || req.Email == "" || req.Role == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	_, err := db.DB.Exec(context.Background(),
		`UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4`,
		req.Name, req.Email, req.Role, id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar el usuario"})
	}
	return c.JSON(fiber.Map{"message": "Usuario actualizado"})
}

type SocialLoginRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

func SocialLogin(c *fiber.Ctx) error {
	var req SocialLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Name = strings.TrimSpace(req.Name)
	if !utils.IsValidEmail(req.Email) || !utils.IsValidName(req.Name, 2, 50) {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Buscar usuario
	var id int64
	var name, email, role string
	err := db.DB.QueryRow(context.Background(), "SELECT id, name, email, role FROM users WHERE email=$1", req.Email).Scan(&id, &name, &email, &role)
	if err == nil {
		// Usuario ya existe, actualizar email_verified a true (Google ya verificó el email)
		_, err = db.DB.Exec(context.Background(), "UPDATE users SET email_verified = true WHERE id = $1", id)
		if err != nil {
			// Log el error pero continúa, no es crítico
			fmt.Printf("Error actualizando email_verified para usuario %d: %v\n", id, err)
		}
		// Genera token y retorna info
		tokenPair, err := generateTokenPair(id, name, email, role)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error al generar tokens"})
		}
		return c.JSON(fiber.Map{
			"id": id, "name": name, "email": email, "role": role, "tokens": tokenPair,
		})
	}

	// Crear usuario con password aleatorio/no usable
	// Marcar email_verified como true porque Google ya verificó el email
	fakePassword := utils.GenerateRandomPassword(32)
	hash, _ := bcrypt.GenerateFromPassword([]byte(fakePassword), bcrypt.DefaultCost)
	err = db.DB.QueryRow(context.Background(),
		"INSERT INTO users (name, last_name, dni, phone, email, password, role, email_verified) VALUES ($1, $2, $3, $4, $5, $6, 'user', true) RETURNING id",
		req.Name, "", "", "", req.Email, string(hash)).Scan(&id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear usuario"})
	}
	// Generar token para el nuevo usuario
	tokenPair, err := generateTokenPair(id, req.Name, req.Email, "user")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al generar tokens"})
	}
	return c.JSON(fiber.Map{
		"id": id, "name": req.Name, "email": req.Email, "role": "user", "tokens": tokenPair,
	})
}

// Actualizar perfil del usuario autenticado
func UpdateProfile(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID := claims["id"].(float64)
	userName := claims["name"].(string)
	userEmail := claims["email"].(string)
	userRole := claims["role"].(string)

	// Log solo en desarrollo
	if os.Getenv("NODE_ENV") != "production" {
		log.Printf("[DEBUG] UpdateProfile - Iniciando actualización para usuario ID: %v", userID)
	}

	type UpdateProfileRequest struct {
		Name         string   `json:"name"`
		LastName     string   `json:"last_name"`
		DNI          string   `json:"dni"`
		Phone        string   `json:"phone"`
		Address      string   `json:"address"`
		AddressRef   string   `json:"addressRef"`
		StreetNumber string   `json:"streetNumber"`
		Lat          *float64 `json:"lat"`
		Lng          *float64 `json:"lng"`
	}
	var req UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("[ERROR] UpdateProfile - BodyParser error: %v", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Log solo en desarrollo (sin datos sensibles)
	if os.Getenv("NODE_ENV") != "production" {
		log.Printf("[DEBUG] UpdateProfile - UserID: %v", userID)
	}

	// Validaciones más flexibles - solo validar si el campo no está vacío
	if req.Name != "" && !utils.IsValidName(req.Name, 2, 50) {
		log.Printf("[ERROR] UpdateProfile - Nombre inválido: %s", req.Name)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Nombre inválido (solo letras, 2-50 caracteres)"})
	}
	if req.LastName != "" && !utils.IsValidName(req.LastName, 2, 50) {
		log.Printf("[ERROR] UpdateProfile - Apellido inválido: %s", req.LastName)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Apellido inválido (solo letras, 2-50 caracteres)"})
	}
	if req.DNI != "" && !utils.IsValidString(req.DNI, 8, 12) {
		log.Printf("[ERROR] UpdateProfile - DNI inválido: %s", req.DNI)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "DNI inválido (8-12 caracteres)"})
	}
	if req.Phone != "" && !utils.IsValidPeruvianPhone(req.Phone) {
		log.Printf("[ERROR] UpdateProfile - Teléfono inválido: %s", req.Phone)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Número de teléfono inválido. Debe ser un celular peruano válido (ej: 987654321 o +51 987654321)"})
	}

	// Log solo en desarrollo
	if os.Getenv("NODE_ENV") != "production" {
		log.Printf("[DEBUG] UpdateProfile - Validaciones pasadas, verificando existencia de usuario")
	}

	// Verificar que el usuario existe antes de actualizar
	var exists bool
	err := db.DB.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM users WHERE id=$1)", int64(userID)).Scan(&exists)
	if err != nil {
		log.Printf("[ERROR] UpdateProfile - Check user exists error: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al verificar usuario"})
	}

	// Log solo en desarrollo
	if os.Getenv("NODE_ENV") != "production" {
		log.Printf("[DEBUG] UpdateProfile - Usuario existe en BD: %v", exists)
	}

	if !exists {
		log.Printf("[WARNING] UpdateProfile - User not found in DB, creating user: %v", userID)
		// Crear el usuario si no existe
		fakePassword := utils.GenerateRandomPassword(32)
		hash, _ := bcrypt.GenerateFromPassword([]byte(fakePassword), bcrypt.DefaultCost)

		// Usar los datos del token para crear el usuario
		_, err = db.DB.Exec(context.Background(),
			"INSERT INTO users (id, name, last_name, dni, phone, email, password, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
			int64(userID), userName, "", "", "", userEmail, string(hash), userRole)
		if err != nil {
			log.Printf("[ERROR] UpdateProfile - Failed to create user: %v", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al crear usuario"})
		}
		log.Printf("[INFO] UpdateProfile - Created user: %v", userID)
	}

	// Preparar valores para lat y lng (pueden ser nulos)
	var latValue, lngValue interface{}
	if req.Lat != nil {
		latValue = *req.Lat
	} else {
		latValue = nil
	}
	if req.Lng != nil {
		lngValue = *req.Lng
	} else {
		lngValue = nil
	}

	// Log solo en desarrollo
	if os.Getenv("NODE_ENV") != "production" {
		log.Printf("[DEBUG] UpdateProfile - Preparando actualización con valores: lat=%v, lng=%v", latValue, lngValue)
	}

	// Intentar actualizar todos los campos del perfil
	_, err = db.DB.Exec(context.Background(),
		"UPDATE users SET name=$1, last_name=$2, dni=$3, phone=$4, address=$5, address_ref=$6, street_number=$7, lat=$8, lng=$9 WHERE id=$10",
		req.Name, req.LastName, req.DNI, req.Phone, req.Address, req.AddressRef, req.StreetNumber, latValue, lngValue, int64(userID))

	// Si falla por columnas faltantes, intentar solo campos básicos
	if err != nil {
		log.Printf("[WARNING] UpdateProfile - Error updating with address fields: %v", err)
		log.Printf("[INFO] UpdateProfile - Trying basic fields only")

		_, err = db.DB.Exec(context.Background(),
			"UPDATE users SET name=$1, last_name=$2, dni=$3, phone=$4 WHERE id=$5",
			req.Name, req.LastName, req.DNI, req.Phone, int64(userID))

		if err != nil {
			log.Printf("[ERROR] UpdateProfile - Database update error: %v", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar el perfil"})
		}
	}
	if err != nil {
		log.Printf("[ERROR] UpdateProfile - Database update error: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo actualizar el perfil"})
	}

	log.Printf("[INFO] UpdateProfile - Successfully updated user: %v", userID)

	// Obtener los datos actualizados del usuario
	var updatedUser struct {
		ID           int64    `json:"id"`
		Name         string   `json:"name"`
		LastName     string   `json:"last_name"`
		DNI          string   `json:"dni"`
		Phone        string   `json:"phone"`
		Email        string   `json:"email"`
		Role         string   `json:"role"`
		Address      string   `json:"address"`
		AddressRef   string   `json:"addressRef"`
		StreetNumber string   `json:"streetNumber"`
		Lat          *float64 `json:"lat"`
		Lng          *float64 `json:"lng"`
	}

	var address, addressRef, streetNumber sql.NullString
	var lat, lng sql.NullFloat64

	// Intentar obtener todos los campos
	err = db.DB.QueryRow(context.Background(),
		"SELECT id, name, last_name, dni, phone, email, role, address, address_ref, street_number, lat, lng FROM users WHERE id = $1",
		userID).Scan(&updatedUser.ID, &updatedUser.Name, &updatedUser.LastName, &updatedUser.DNI, &updatedUser.Phone, &updatedUser.Email, &updatedUser.Role, &address, &addressRef, &streetNumber, &lat, &lng)

	if err != nil {
		log.Printf("[WARNING] UpdateProfile - Error fetching with address fields: %v", err)
		// Intentar solo campos básicos
		err = db.DB.QueryRow(context.Background(),
			"SELECT id, name, last_name, dni, phone, email, role FROM users WHERE id = $1",
			userID).Scan(&updatedUser.ID, &updatedUser.Name, &updatedUser.LastName, &updatedUser.DNI, &updatedUser.Phone, &updatedUser.Email, &updatedUser.Role)

		if err != nil {
			log.Printf("[ERROR] UpdateProfile - Error fetching updated user data: %v", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "No se pudo obtener los datos actualizados"})
		}

		// Si solo tenemos campos básicos, dejar los campos de dirección vacíos
		updatedUser.Address = ""
		updatedUser.AddressRef = ""
		updatedUser.StreetNumber = ""
		updatedUser.Lat = nil
		updatedUser.Lng = nil
	} else {
		// Asignar valores de campos opcionales
		updatedUser.Address = address.String
		updatedUser.AddressRef = addressRef.String
		updatedUser.StreetNumber = streetNumber.String
		if lat.Valid {
			updatedUser.Lat = &lat.Float64
		}
		if lng.Valid {
			updatedUser.Lng = &lng.Float64
		}
	}

	return c.JSON(updatedUser)
}

// ProfilePublic versión pública que devuelve datos básicos cuando no hay usuario autenticado
func ProfilePublic(c *fiber.Ctx) error {
	// Verificar si hay usuario autenticado
	user := c.Locals("user")
	if user == nil {
		// Si no hay usuario autenticado, devolver datos básicos
		return c.JSON(fiber.Map{
			"authenticated": false,
			"message":       "Usuario no autenticado",
			"profile": fiber.Map{
				"name":  "",
				"email": "",
				"role":  "",
			},
		})
	}

	// Si hay usuario autenticado, usar la función original
	return Profile(c)
}

// TestDatabaseConnection prueba la conexión a la base de datos
func TestDatabaseConnection(c *fiber.Ctx) error {
	// Intentar hacer una consulta simple para verificar la conexión
	var result string
	err := db.DB.QueryRow(context.Background(), "SELECT 'OK' as status").Scan(&result)
	if err != nil {
		log.Printf("[ERROR] TestDatabaseConnection - Database connection failed: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Error de conexión a la base de datos",
			"error":   err.Error(),
		})
	}

	log.Printf("[INFO] TestDatabaseConnection - Database connection successful")
	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Conexión a la base de datos exitosa",
		"result":  result,
	})
}

// TestUsersConnection prueba la conexión y lista usuarios en la base de datos
func TestUsersConnection(c *fiber.Ctx) error {
	// Contar usuarios
	var userCount int
	err := db.DB.QueryRow(c.Context(), "SELECT COUNT(*) FROM users").Scan(&userCount)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Error al contar usuarios",
			"error":   err.Error(),
		})
	}

	// Listar usuarios (solo IDs y emails para privacidad)
	rows, err := db.DB.Query(c.Context(), "SELECT id, name, email, role FROM users ORDER BY id")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Error al listar usuarios",
			"error":   err.Error(),
		})
	}
	defer rows.Close()

	users := []fiber.Map{}
	for rows.Next() {
		var id int64
		var name, email, role string
		if err := rows.Scan(&id, &name, &email, &role); err != nil {
			continue
		}
		users = append(users, fiber.Map{
			"id":    id,
			"name":  name,
			"email": email,
			"role":  role,
		})
	}

	return c.JSON(fiber.Map{
		"status":     "ok",
		"message":    "Usuarios en la base de datos",
		"user_count": userCount,
		"users":      users,
	})
}

// TestTableStructure verifica la estructura de la tabla users
func TestTableStructure(c *fiber.Ctx) error {
	// Verificar qué columnas existen en la tabla users
	rows, err := db.DB.Query(c.Context(), `
		SELECT column_name, data_type, is_nullable, column_default
		FROM information_schema.columns 
		WHERE table_name = 'users' 
		ORDER BY ordinal_position
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Error al verificar estructura de tabla",
			"error":   err.Error(),
		})
	}
	defer rows.Close()

	columns := []fiber.Map{}
	for rows.Next() {
		var columnName, dataType, isNullable, columnDefault sql.NullString
		if err := rows.Scan(&columnName, &dataType, &isNullable, &columnDefault); err != nil {
			continue
		}
		columns = append(columns, fiber.Map{
			"name":     columnName.String,
			"type":     dataType.String,
			"nullable": isNullable.String,
			"default":  columnDefault.String,
		})
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Estructura de tabla users",
		"columns": columns,
		"count":   len(columns),
	})
}

// TestUserExists verifica si un usuario específico existe
func TestUserExists(c *fiber.Ctx) error {
	userID := c.Query("id")
	if userID == "" {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "ID de usuario requerido",
		})
	}

	var exists bool
	var name, email, role string
	var last_name, dni, phone sql.NullString
	var address, address_ref, street_number sql.NullString
	var lat, lng sql.NullFloat64

	err := db.DB.QueryRow(c.Context(), `
		SELECT 
			EXISTS(SELECT 1 FROM users WHERE id = $1),
			name, email, role, last_name, dni, phone, 
			address, address_ref, street_number, lat, lng
		FROM users WHERE id = $1
	`, userID).Scan(&exists, &name, &email, &role, &last_name, &dni, &phone,
		&address, &address_ref, &street_number, &lat, &lng)

	if err != nil {
		if err == sql.ErrNoRows {
			return c.JSON(fiber.Map{
				"status":  "ok",
				"message": "Usuario no encontrado",
				"exists":  false,
				"user_id": userID,
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Error al verificar usuario",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Usuario encontrado",
		"exists":  true,
		"user_id": userID,
		"user_data": fiber.Map{
			"name":          name,
			"email":         email,
			"role":          role,
			"last_name":     last_name.String,
			"dni":           dni.String,
			"phone":         phone.String,
			"address":       address.String,
			"address_ref":   address_ref.String,
			"street_number": street_number.String,
			"lat":           lat.Float64,
			"lng":           lng.Float64,
		},
	})
}

// RunMigrations ejecuta las migraciones faltantes
func RunMigrations(c *fiber.Ctx) error {
	// Ejecutar migración de campos de dirección
	migrationSQL := `
	DO $$ 
	BEGIN
		IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
			ALTER TABLE users ADD COLUMN address TEXT;
		END IF;
		IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address_ref') THEN
			ALTER TABLE users ADD COLUMN address_ref TEXT;
		END IF;
		IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'street_number') THEN
			ALTER TABLE users ADD COLUMN street_number TEXT;
		END IF;
		IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lat') THEN
			ALTER TABLE users ADD COLUMN lat DOUBLE PRECISION;
		END IF;
		IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lng') THEN
			ALTER TABLE users ADD COLUMN lng DOUBLE PRECISION;
		END IF;
	END $$;
	`

	_, err := db.DB.Exec(c.Context(), migrationSQL)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  "error",
			"message": "Error ejecutando migración de campos de dirección",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Migraciones ejecutadas correctamente",
	})
}

// Función temporal para verificar tokens
func VerifyToken(c *fiber.Ctx) error {
	tokenString := c.Query("token")
	if tokenString == "" {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Token no proporcionado",
		})
	}

	// Configurar secretos por defecto si no están configurados
	accessSecret := os.Getenv("JWT_ACCESS_SECRET")
	if accessSecret == "" {
		accessSecret = "your-secret-key-for-development-only"
	}

	// Parsear y verificar el token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
		}
		return []byte(accessSecret), nil
	})

	if err != nil {
		return c.JSON(fiber.Map{
			"status":  "error",
			"message": "Token inválido",
			"error":   err.Error(),
		})
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Token válido",
			"claims":  claims,
		})
	}

	return c.JSON(fiber.Map{
		"status":  "error",
		"message": "Token inválido",
	})
}

// ForgotPassword godoc
// @Summary Solicitar código de recuperación de contraseña
// @Description Envía un código de 6 dígitos al email del usuario para recuperar su contraseña
// @Tags auth
// @Accept json
// @Produce json
// @Param email body string true "Email del usuario"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/forgot-password [post]
func ForgotPassword(c *fiber.Ctx) error {
	var req struct {
		Email string `json:"email"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Datos inválidos",
		})
	}

	if req.Email == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Email requerido",
		})
	}

	// Normalizar email
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	// Validar formato de email
	if !utils.IsValidEmail(req.Email) {
		return c.Status(400).JSON(fiber.Map{
			"error": "Email inválido",
		})
	}

	// Buscar usuario
	var userID int64
	var name string
	var emailVerified bool
	err := db.DB.QueryRow(context.Background(),
		"SELECT id, name, email_verified FROM users WHERE email = $1",
		req.Email,
	).Scan(&userID, &name, &emailVerified)

	if err != nil {
		// Por seguridad, no revelar si el usuario existe o no
		// Devolver éxito siempre para evitar enumeración de emails
		return c.JSON(fiber.Map{
			"message": "Si el email existe, recibirás un código de recuperación",
		})
	}

	// Verificar que el email esté verificado
	if !emailVerified {
		return c.Status(400).JSON(fiber.Map{
			"error": "El email no está verificado. Por favor, verifica tu email primero.",
		})
	}

	// Crear código de recuperación
	resetCode, createErr := createPasswordResetCode(userID, req.Email)
	if createErr != nil {
		fmt.Printf("[FORGOT PASSWORD] Error creando código: %v\n", createErr)
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al generar código de recuperación",
		})
	}

	// Enviar email con código en background
	go func() {
		fmt.Printf("[FORGOT PASSWORD] Enviando código de recuperación a: %s\n", req.Email)
		sendErr := sendPasswordResetCode(userID, req.Email, name, resetCode.Code)
		if sendErr != nil {
			fmt.Printf("[FORGOT PASSWORD] ❌ Error enviando email: %v\n", sendErr)
		} else {
			fmt.Printf("[FORGOT PASSWORD] ✅ Email con código enviado exitosamente\n")
		}
	}()

	// Por seguridad, no devolver el código en la respuesta
	// Solo confirmar que se envió (si el usuario existe)
	return c.JSON(fiber.Map{
		"message": "Si el email existe y está verificado, recibirás un código de recuperación en tu correo",
	})
}

// ResetPassword godoc
// @Summary Restablecer contraseña con código
// @Description Restablece la contraseña del usuario usando el código de verificación recibido por email
// @Tags auth
// @Accept json
// @Produce json
// @Param data body map[string]string true "Email, código y nueva contraseña"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /api/reset-password [post]
func ResetPassword(c *fiber.Ctx) error {
	var req struct {
		Email       string `json:"email"`
		Code        string `json:"code"`
		NewPassword string `json:"new_password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Datos inválidos",
		})
	}

	// Validar campos requeridos
	if req.Email == "" || req.Code == "" || req.NewPassword == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Email, código y nueva contraseña son requeridos",
		})
	}

	// Normalizar email
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Code = strings.TrimSpace(req.Code)

	// Validar formato de email
	if !utils.IsValidEmail(req.Email) {
		return c.Status(400).JSON(fiber.Map{
			"error": "Email inválido",
		})
	}

	// Validar código (debe ser de 6 dígitos)
	if len(req.Code) != 6 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Código inválido. Debe ser de 6 dígitos",
		})
	}

	// Validar contraseña fuerte
	if !utils.IsStrongPassword(req.NewPassword) {
		return c.Status(400).JSON(fiber.Map{
			"error": "La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo",
		})
	}

	// Buscar código de recuperación válido
	var userID int64
	var expiresAt time.Time
	err := db.DB.QueryRow(context.Background(),
		"SELECT user_id, expires_at FROM password_reset_codes WHERE email = $1 AND code = $2 AND used = false",
		req.Email, req.Code,
	).Scan(&userID, &expiresAt)

	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Código inválido o expirado",
		})
	}

	// Verificar si el código ha expirado
	if time.Now().After(expiresAt) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Código expirado. Solicita uno nuevo",
		})
	}

	// Hashear nueva contraseña
	hash, hashErr := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if hashErr != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al procesar contraseña",
		})
	}

	// Actualizar contraseña del usuario
	_, updateErr := db.DB.Exec(context.Background(),
		"UPDATE users SET password = $1 WHERE id = $2",
		string(hash), userID,
	)
	if updateErr != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al actualizar contraseña",
		})
	}

	// Marcar código como usado
	_, markErr := db.DB.Exec(context.Background(),
		"UPDATE password_reset_codes SET used = true WHERE email = $1 AND code = $2",
		req.Email, req.Code,
	)
	if markErr != nil {
		// Log error pero no fallar, la contraseña ya se cambió
		fmt.Printf("[RESET PASSWORD] Error marcando código como usado: %v\n", markErr)
	}

	fmt.Printf("[RESET PASSWORD] ✅ Contraseña restablecida exitosamente para usuario ID: %d\n", userID)

	return c.JSON(fiber.Map{
		"message": "Contraseña restablecida exitosamente. Puedes iniciar sesión con tu nueva contraseña",
	})
}

// Enable2FA habilita 2FA para un usuario
func Enable2FA(c *fiber.Ctx) error {
	ctx := context.Background()
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))

	// Obtener email del usuario primero
	var email string
	if err := db.DB.QueryRow(ctx, "SELECT email FROM users WHERE id=$1", userID).Scan(&email); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Usuario no encontrado",
		})
	}

	// Generar secreto TOTP
	secret, err := utils.GenerateTOTPSecret(email)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error generando secreto 2FA",
		})
	}

	// Generar códigos de respaldo
	backupCodes, err := utils.GenerateBackupCodes(10)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error generando códigos de respaldo",
		})
	}

	// Crear configuración 2FA (sin habilitar aún)
	user2FA := &models.User2FA{
		UserID:      userID,
		Secret:      secret,
		Enabled:     false,
		BackupCodes: backupCodes,
	}

	if err := models.CreateUser2FA(ctx, user2FA); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error guardando configuración 2FA",
		})
	}

	// Generar URL del QR code
	qrURL, err := utils.GenerateQRCodeURL(email, secret)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error generando QR code",
		})
	}

	createAuditLog(ctx, &userID, "2FA_SETUP_INITIATED", "user", &userID, c.IP(), c.Get("User-Agent"), "POST", "/api/auth/2fa/enable", "", 200, "", "")

	return c.JSON(fiber.Map{
		"secret":       secret,
		"qr_code_url":  qrURL,
		"backup_codes": backupCodes,
		"message":      "Escanea el QR code con tu app de autenticación y confirma con un código",
	})
}

// Confirm2FA confirma y habilita 2FA después de verificar el código
func Confirm2FA(c *fiber.Ctx) error {
	ctx := context.Background()
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))

	var req struct {
		TotpCode string `json:"totp_code"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Código TOTP requerido",
		})
	}

	// Obtener configuración 2FA
	user2FA, err := models.GetUser2FA(ctx, userID)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Configuración 2FA no encontrada. Primero inicia la configuración.",
		})
	}

	// Validar código TOTP
	if !utils.ValidateTOTP(user2FA.Secret, req.TotpCode) {
		createAuditLog(ctx, &userID, "2FA_SETUP_FAILED", "user", &userID, c.IP(), c.Get("User-Agent"), "POST", "/api/auth/2fa/confirm", "", 401, "Invalid TOTP code", "")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Código TOTP inválido",
		})
	}

	// Habilitar 2FA
	user2FA.Enabled = true
	if err := models.CreateUser2FA(ctx, user2FA); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error habilitando 2FA",
		})
	}

	createAuditLog(ctx, &userID, "2FA_ENABLED", "user", &userID, c.IP(), c.Get("User-Agent"), "POST", "/api/auth/2fa/confirm", "", 200, "", "")

	return c.JSON(fiber.Map{
		"message":      "2FA habilitado correctamente",
		"backup_codes": user2FA.BackupCodes,
	})
}

// Disable2FA deshabilita 2FA para un usuario
func Disable2FA(c *fiber.Ctx) error {
	ctx := context.Background()
	claims := c.Locals("user").(jwt.MapClaims)
	userID := int64(claims["id"].(float64))

	var req struct {
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Contraseña requerida",
		})
	}

	// Verificar contraseña
	var hash string
	if err := db.DB.QueryRow(ctx, "SELECT password FROM users WHERE id=$1", userID).Scan(&hash); err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Usuario no encontrado",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		createAuditLog(ctx, &userID, "2FA_DISABLE_FAILED", "user", &userID, c.IP(), c.Get("User-Agent"), "POST", "/api/auth/2fa/disable", "", 401, "Invalid password", "")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Contraseña incorrecta",
		})
	}

	// Deshabilitar 2FA
	user2FA := &models.User2FA{
		UserID:  userID,
		Enabled: false,
	}
	if err := models.CreateUser2FA(ctx, user2FA); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error deshabilitando 2FA",
		})
	}

	createAuditLog(ctx, &userID, "2FA_DISABLED", "user", &userID, c.IP(), c.Get("User-Agent"), "POST", "/api/auth/2fa/disable", "", 200, "", "")

	return c.JSON(fiber.Map{
		"message": "2FA deshabilitado correctamente",
	})
}
