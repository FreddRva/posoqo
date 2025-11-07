package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"html/template"
	"net/smtp"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/posoqo/backend/internal/db"
)

// Estructura para tokens de verificación
type EmailVerification struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	Token     string    `json:"token"`
	Email     string    `json:"email"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

// Configuración de email
type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string
	FromEmail    string
	FromName     string
}

// Generar token de verificación
func generateVerificationToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Crear token de verificación en la base de datos
func createVerificationToken(userID int64, email string) (*EmailVerification, error) {
	token, err := generateVerificationToken()
	if err != nil {
		return nil, err
	}

	// Token expira en 24 horas
	expiresAt := time.Now().Add(24 * time.Hour)

	// Insertar token en la base de datos
	var id int64
	err = db.DB.QueryRow(context.Background(),
		"INSERT INTO email_verifications (user_id, token, email, expires_at) VALUES ($1, $2, $3, $4) RETURNING id",
		userID, token, email, expiresAt,
	).Scan(&id)

	if err != nil {
		return nil, err
	}

	return &EmailVerification{
		ID:        id,
		UserID:    userID,
		Token:     token,
		Email:     email,
		ExpiresAt: expiresAt,
		CreatedAt: time.Now(),
	}, nil
}

// Obtener configuración de email desde variables de entorno
func getEmailConfig() *EmailConfig {
	return &EmailConfig{
		SMTPHost:     os.Getenv("SMTP_HOST"),
		SMTPPort:     os.Getenv("SMTP_PORT"),
		SMTPUser:     os.Getenv("SMTP_USER"),
		SMTPPassword: os.Getenv("SMTP_PASSWORD"),
		FromEmail:    os.Getenv("FROM_EMAIL"),
		FromName:     os.Getenv("FROM_NAME"),
	}
}

// Template HTML para email de verificación
const emailVerificationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu email - POSOQO</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #FFD700;
            margin-bottom: 10px;
        }
        .title {
            color: #333;
            font-size: 20px;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #FFD700, #D4AF37);
            color: #000;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background: linear-gradient(135deg, #D4AF37, #FFD700);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">POSOQO</div>
            <div class="title">Verifica tu dirección de email</div>
        </div>
        
        <div class="content">
            <p>Hola {{.Name}},</p>
            
            <p>Gracias por registrarte en POSOQO. Para completar tu registro, necesitamos verificar tu dirección de email.</p>
            
            <p>Haz clic en el botón de abajo para verificar tu email:</p>
            
            <div style="text-align: center;">
                <a href="{{.VerificationURL}}" class="button">Verificar Email</a>
            </div>
            
            <div class="warning">
                <strong>Importante:</strong> Este enlace expirará en 24 horas por seguridad.
            </div>
            
            <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
        </div>
        
        <div class="footer">
            <p>Este es un email automático, no respondas a este mensaje.</p>
            <p>&copy; 2024 POSOQO. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`

// Enviar email de verificación
func sendVerificationEmail(userID int64, email, name string) error {
	// Crear token de verificación
	verification, err := createVerificationToken(userID, email)
	if err != nil {
		return err
	}

	// Obtener configuración de email
	config := getEmailConfig()

	// Verificar que la configuración esté completa
	if config.SMTPHost == "" || config.SMTPUser == "" || config.SMTPPassword == "" {
		// En desarrollo, solo retornar el token
		return nil
	}

	// Construir URL de verificación
	// La URL debe apuntar directamente al endpoint del backend
	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		// Si no hay BACKEND_URL configurada explícitamente, usar la URL del servicio actual de Render
		// Render proporciona RENDER_EXTERNAL_URL automáticamente
		renderURL := os.Getenv("RENDER_EXTERNAL_URL")
		if renderURL != "" {
			backendURL = renderURL
		} else {
			// Fallback: verificar si BASE_URL es del backend
			baseURL := os.Getenv("BASE_URL")
			if strings.Contains(baseURL, "onrender.com") {
				backendURL = baseURL
			} else {
				// Para desarrollo local
				backendURL = "http://localhost:4000"
			}
		}
	}
	verificationURL := fmt.Sprintf("%s/api/verify-email?token=%s", backendURL, verification.Token)

	// Preparar datos para el template
	data := struct {
		Name            string
		VerificationURL string
	}{
		Name:            name,
		VerificationURL: verificationURL,
	}

	// Renderizar template
	tmpl, err := template.New("verification").Parse(emailVerificationTemplate)
	if err != nil {
		return err
	}

	var body strings.Builder
	if err := tmpl.Execute(&body, data); err != nil {
		return err
	}

	// Configurar autenticación SMTP
	auth := smtp.PlainAuth("", config.SMTPUser, config.SMTPPassword, config.SMTPHost)

	// Preparar headers del email
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", config.FromName, config.FromEmail)
	headers["To"] = email
	headers["Subject"] = "Verifica tu email - POSOQO"
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	// Construir mensaje
	var message strings.Builder
	for key, value := range headers {
		message.WriteString(fmt.Sprintf("%s: %s\r\n", key, value))
	}
	message.WriteString("\r\n")
	message.WriteString(body.String())

	// Enviar email
	addr := fmt.Sprintf("%s:%s", config.SMTPHost, config.SMTPPort)
	return smtp.SendMail(addr, auth, config.FromEmail, []string{email}, []byte(message.String()))
}

// VerificarEmail godoc
// @Summary Verificar email
// @Description Verifica el email del usuario usando un token
// @Tags auth
// @Accept json
// @Produce json
// @Param token query string true "Token de verificación"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /api/verify-email [get]
func VerifyEmail(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Token de verificación requerido",
		})
	}

	// Buscar token en la base de datos
	var userID int64
	var email string
	var expiresAt time.Time
	err := db.DB.QueryRow(context.Background(),
		"SELECT user_id, email, expires_at FROM email_verifications WHERE token = $1 AND used = false",
		token,
	).Scan(&userID, &email, &expiresAt)

	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Token de verificación inválido o expirado",
		})
	}

	// Verificar si el token ha expirado
	if time.Now().After(expiresAt) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Token de verificación expirado",
		})
	}

	// Marcar email como verificado
	_, err = db.DB.Exec(context.Background(),
		"UPDATE users SET email_verified = true WHERE id = $1",
		userID,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al verificar email",
		})
	}

	// Marcar token como usado
	_, err = db.DB.Exec(context.Background(),
		"UPDATE email_verifications SET used = true WHERE token = $1",
		token,
	)
	if err != nil {
		// Log error pero no fallar la verificación
		fmt.Printf("Error marcando token como usado: %v\n", err)
	}

	return c.JSON(fiber.Map{
		"message": "Email verificado exitosamente",
		"email":   email,
	})
}

// ReenviarEmailVerificacion godoc
// @Summary Reenviar email de verificación
// @Description Reenvía el email de verificación a un usuario
// @Tags auth
// @Accept json
// @Produce json
// @Param email body string true "Email del usuario"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/resend-verification [post]
func ResendVerificationEmail(c *fiber.Ctx) error {
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

	// Buscar usuario
	var userID int64
	var name string
	var emailVerified bool
	err := db.DB.QueryRow(context.Background(),
		"SELECT id, name, email_verified FROM users WHERE email = $1",
		req.Email,
	).Scan(&userID, &name, &emailVerified)

	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Usuario no encontrado",
		})
	}

	if emailVerified {
		return c.Status(400).JSON(fiber.Map{
			"error": "El email ya está verificado",
		})
	}

	// Verificar si SMTP está configurado
	config := getEmailConfig()
	smtpConfigured := config.SMTPHost != "" && config.SMTPUser != "" && config.SMTPPassword != ""

	// Enviar email de verificación
	err = sendVerificationEmail(userID, req.Email, name)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al enviar email de verificación",
		})
	}

	response := fiber.Map{
		"message": "Email de verificación reenviado exitosamente",
	}

	// Si SMTP no está configurado, incluir el token en la respuesta (solo desarrollo)
	if !smtpConfigured {
		// Buscar token activo más reciente
		var token string
		var expiresAt time.Time
		err = db.DB.QueryRow(context.Background(),
			"SELECT token, expires_at FROM email_verifications WHERE user_id = $1 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
			userID,
		).Scan(&token, &expiresAt)

		if err == nil {
			// Usar la misma lógica que en sendVerificationEmail para obtener la URL del backend
			backendURL := os.Getenv("BACKEND_URL")
			if backendURL == "" {
				renderURL := os.Getenv("RENDER_EXTERNAL_URL")
				if renderURL != "" {
					backendURL = renderURL
				} else {
					baseURL := os.Getenv("BASE_URL")
					if strings.Contains(baseURL, "onrender.com") {
						backendURL = baseURL
					} else {
						backendURL = "http://localhost:4000"
					}
				}
			}
			verificationURL := fmt.Sprintf("%s/api/verify-email?token=%s", backendURL, token)

			response["token"] = token
			response["verification_url"] = verificationURL
			response["development_mode"] = true
			response["message"] = "SMTP no configurado. Usa este enlace para verificar: " + verificationURL
		}
	}

	return c.JSON(response)
}
