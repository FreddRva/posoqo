package handlers

import (
	"context"
	"crypto/rand"
	"crypto/tls"
	"encoding/hex"
	"fmt"
	"html/template"
	"net"
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
	fmt.Printf("[EMAIL] Iniciando envío de email a: %s (userID: %d)\n", email, userID)

	// Crear token de verificación
	verification, err := createVerificationToken(userID, email)
	if err != nil {
		fmt.Printf("[EMAIL] Error creando token: %v\n", err)
		return err
	}
	fmt.Printf("[EMAIL] Token creado exitosamente: %s\n", verification.Token[:16]+"...")

	// Obtener configuración de email
	config := getEmailConfig()

	// Log de configuración (sin mostrar password completo)
	passwordMasked := ""
	if config.SMTPPassword != "" {
		if len(config.SMTPPassword) > 8 {
			passwordMasked = config.SMTPPassword[:4] + "****" + config.SMTPPassword[len(config.SMTPPassword)-4:]
		} else {
			passwordMasked = "****"
		}
	}

	fmt.Printf("[EMAIL] Configuración SMTP:\n")
	fmt.Printf("  - SMTP_HOST: %s\n", config.SMTPHost)
	fmt.Printf("  - SMTP_PORT: %s\n", config.SMTPPort)
	fmt.Printf("  - SMTP_USER: %s\n", config.SMTPUser)
	fmt.Printf("  - SMTP_PASSWORD: %s\n", passwordMasked)
	fmt.Printf("  - FROM_EMAIL: %s\n", config.FromEmail)
	fmt.Printf("  - FROM_NAME: %s\n", config.FromName)

	// Verificar que la configuración esté completa
	if config.SMTPHost == "" || config.SMTPUser == "" || config.SMTPPassword == "" {
		fmt.Printf("[EMAIL] ⚠️ Configuración SMTP incompleta - no se enviará email\n")
		return fmt.Errorf("configuración SMTP incompleta")
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

	// Enviar email - Intentar método simple primero (más confiable)
	addr := fmt.Sprintf("%s:%s", config.SMTPHost, config.SMTPPort)
	fmt.Printf("[EMAIL] Intentando enviar email a través de: %s\n", addr)
	fmt.Printf("[EMAIL] From: %s <%s>\n", config.FromName, config.FromEmail)
	fmt.Printf("[EMAIL] To: %s\n", email)
	fmt.Printf("[EMAIL] Tamaño del mensaje: %d bytes\n", len(message.String()))
	
	// Intentar método simple primero (funciona mejor con la mayoría de servidores SMTP)
	fmt.Printf("[EMAIL] Intentando envío directo con smtp.SendMail...\n")
	err = smtp.SendMail(addr, auth, config.FromEmail, []string{email}, []byte(message.String()))
	if err != nil {
		fmt.Printf("[EMAIL] ❌ Error con smtp.SendMail: %v\n", err)
		fmt.Printf("[EMAIL] Intentando método alternativo con conexión manual...\n")
		
		// Método alternativo: conexión manual con STARTTLS
		dialer := &net.Dialer{
			Timeout: 10 * time.Second,
		}
		
		fmt.Printf("[EMAIL] Estableciendo conexión SMTP...\n")
		conn, dialErr := dialer.Dial("tcp", addr)
		if dialErr != nil {
			fmt.Printf("[EMAIL] ❌ Error conectando a SMTP: %v\n", dialErr)
			return fmt.Errorf("error conectando a servidor SMTP: %w (método directo: %v)", dialErr, err)
		}
		defer conn.Close()
		
		fmt.Printf("[EMAIL] Conexión establecida\n")
		client, clientErr := smtp.NewClient(conn, config.SMTPHost)
		if clientErr != nil {
			fmt.Printf("[EMAIL] ❌ Error creando cliente SMTP: %v\n", clientErr)
			return fmt.Errorf("error creando cliente SMTP: %w", clientErr)
		}
		defer client.Quit()
		
		// Configurar timeout
		deadline := time.Now().Add(20 * time.Second)
		conn.SetDeadline(deadline)
		
		// STARTTLS si es necesario (puerto 587)
		if config.SMTPPort == "587" {
			fmt.Printf("[EMAIL] Iniciando STARTTLS...\n")
			tlsConfig := &tls.Config{
				ServerName:         config.SMTPHost,
				InsecureSkipVerify: false,
			}
			if starttlsErr := client.StartTLS(tlsConfig); starttlsErr != nil {
				fmt.Printf("[EMAIL] ⚠️ Error en STARTTLS (continuando): %v\n", starttlsErr)
			} else {
				fmt.Printf("[EMAIL] STARTTLS exitoso\n")
			}
		}
		
		// Autenticar
		fmt.Printf("[EMAIL] Autenticando...\n")
		if authErr := client.Auth(auth); authErr != nil {
			fmt.Printf("[EMAIL] ❌ Error en autenticación: %v\n", authErr)
			return fmt.Errorf("error en autenticación SMTP: %w", authErr)
		}
		fmt.Printf("[EMAIL] Autenticación exitosa\n")
		
		// Configurar remitente
		if mailErr := client.Mail(config.FromEmail); mailErr != nil {
			fmt.Printf("[EMAIL] ❌ Error configurando remitente: %v\n", mailErr)
			return fmt.Errorf("error configurando remitente: %w", mailErr)
		}
		
		// Configurar destinatario
		if rcptErr := client.Rcpt(email); rcptErr != nil {
			fmt.Printf("[EMAIL] ❌ Error configurando destinatario: %v\n", rcptErr)
			return fmt.Errorf("error configurando destinatario: %w", rcptErr)
		}
		
		// Enviar datos
		writer, dataErr := client.Data()
		if dataErr != nil {
			fmt.Printf("[EMAIL] ❌ Error iniciando envío de datos: %v\n", dataErr)
			return fmt.Errorf("error iniciando envío de datos: %w", dataErr)
		}
		
		messageBytes := []byte(message.String())
		if _, writeErr := writer.Write(messageBytes); writeErr != nil {
			writer.Close()
			fmt.Printf("[EMAIL] ❌ Error escribiendo datos: %v\n", writeErr)
			return fmt.Errorf("error escribiendo datos: %w", writeErr)
		}
		
		if closeErr := writer.Close(); closeErr != nil {
			fmt.Printf("[EMAIL] ❌ Error cerrando escritor: %v\n", closeErr)
			return fmt.Errorf("error cerrando escritor: %w", closeErr)
		}
	}
	
	fmt.Printf("[EMAIL] ✅ Email enviado exitosamente a %s\n", email)
	return nil
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

	// Crear nuevo token inmediatamente (sin esperar)
	verification, createErr := createVerificationToken(userID, req.Email)
	if createErr != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error al crear token de verificación",
		})
	}

	// Construir URL de verificación inmediatamente
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
	verificationURL := fmt.Sprintf("%s/api/verify-email?token=%s", backendURL, verification.Token)

	// Responder inmediatamente con el token
	response := fiber.Map{
		"message":          "Token de verificación generado",
		"token":            verification.Token,
		"verification_url": verificationURL,
		"development_mode": true,
	}

	// Enviar email en background (no bloquear la respuesta)
	go func() {
		fmt.Printf("[RESEND] Iniciando proceso de envío de email en background para: %s\n", req.Email)
		config := getEmailConfig()
		smtpConfigured := config.SMTPHost != "" && config.SMTPUser != "" && config.SMTPPassword != ""

		fmt.Printf("[RESEND] SMTP configurado: %v\n", smtpConfigured)
		fmt.Printf("[RESEND] SMTP_HOST: %s\n", config.SMTPHost)
		fmt.Printf("[RESEND] SMTP_USER: %s\n", config.SMTPUser)
		fmt.Printf("[RESEND] SMTP_PASSWORD presente: %v\n", config.SMTPPassword != "")
		fmt.Printf("[RESEND] FROM_EMAIL: %s\n", config.FromEmail)

		if smtpConfigured {
			fmt.Printf("[RESEND] Intentando enviar email...\n")
			sendErr := sendVerificationEmail(userID, req.Email, name)
			if sendErr != nil {
				fmt.Printf("[RESEND] ❌ Error enviando email en background: %v\n", sendErr)
			} else {
				fmt.Printf("[RESEND] ✅ Email enviado exitosamente a %s\n", req.Email)
			}
		} else {
			fmt.Printf("[RESEND] ⚠️ SMTP no configurado - email no se enviará\n")
		}
	}()

	return c.JSON(response)
}
