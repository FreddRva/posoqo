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
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Email inválido"})
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
		"message": "Usuario registrado correctamente. Por favor, verifica tu email antes de iniciar sesión.",
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
	// Obtener información del cliente para auditoría
	clientIP := c.IP()
	userAgent := c.Get("User-Agent")

	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		logAuthAttempt("unknown", clientIP, userAgent, "INVALID_DATA")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	// Sanitización de inputs
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Password = strings.TrimSpace(req.Password)

	if req.Email == "" || req.Password == "" {
		logAuthAttempt(req.Email, clientIP, userAgent, "EMPTY_CREDENTIALS")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Email y contraseña son obligatorios"})
	}

	// Buscar usuario en la base de datos
	var id int64
	var name, email, hash, role string
	var emailVerified bool
	err := db.DB.QueryRow(context.Background(),
		"SELECT id, name, email, password, role, email_verified FROM users WHERE email=$1",
		req.Email).Scan(&id, &name, &email, &hash, &role, &emailVerified)

	if err != nil {
		logAuthAttempt(req.Email, clientIP, userAgent, "USER_NOT_FOUND")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Credenciales inválidas"})
	}

	if !emailVerified {
		// No revelar que el email no está verificado por seguridad
		logAuthAttempt(req.Email, clientIP, userAgent, "EMAIL_NOT_VERIFIED")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Credenciales inválidas"})
	}

	// Verificar contraseña con bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		logAuthAttempt(req.Email, clientIP, userAgent, "INVALID_PASSWORD")
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Credenciales inválidas"})
	}

	// Generar par de tokens
	tokenPair, err := generateTokenPair(id, name, email, role)
	if err != nil {
		logAuthAttempt(req.Email, clientIP, userAgent, "TOKEN_GENERATION_ERROR")
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al generar tokens"})
	}

	// Log de auditoría exitoso
	logAuthAttempt(req.Email, clientIP, userAgent, "SUCCESS")

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

	log.Printf("[DEBUG] Profile - Request for user ID: %v, Name: %s, Email: %s", userID, userName, userEmail)

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
		// Usuario ya existe, genera token y retorna info
		tokenPair, err := generateTokenPair(id, name, email, role)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error al generar tokens"})
		}
		return c.JSON(fiber.Map{
			"id": id, "name": name, "email": email, "role": role, "tokens": tokenPair,
		})
	}

	// Crear usuario con password aleatorio/no usable
	fakePassword := utils.GenerateRandomPassword(32)
	hash, _ := bcrypt.GenerateFromPassword([]byte(fakePassword), bcrypt.DefaultCost)
	err = db.DB.QueryRow(context.Background(),
		"INSERT INTO users (name, last_name, dni, phone, email, password, role) VALUES ($1, $2, $3, $4, $5, $6, 'user') RETURNING id",
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

	log.Printf("[DEBUG] UpdateProfile - Iniciando actualización para usuario ID: %v", userID)

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

	// Log para debugging
	log.Printf("[DEBUG] UpdateProfile - UserID: %v, Request: %+v", userID, req)

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

	log.Printf("[DEBUG] UpdateProfile - Validaciones pasadas, verificando existencia de usuario")

	// Verificar que el usuario existe antes de actualizar
	var exists bool
	err := db.DB.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM users WHERE id=$1)", int64(userID)).Scan(&exists)
	if err != nil {
		log.Printf("[ERROR] UpdateProfile - Check user exists error: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Error al verificar usuario"})
	}

	log.Printf("[DEBUG] UpdateProfile - Usuario existe en BD: %v", exists)

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

	log.Printf("[DEBUG] UpdateProfile - Preparando actualización con valores: lat=%v, lng=%v", latValue, lngValue)

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
