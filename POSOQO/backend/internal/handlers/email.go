package handlers

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/tls"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"net"
	"net/http"
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

	// Intentar primero con API REST de Resend (más confiable en Render)
	if config.SMTPHost == "smtp.resend.com" && config.SMTPPassword != "" {
		fmt.Printf("[EMAIL] Detectado Resend - intentando API REST...\n")
		apiErr := sendEmailViaResendAPI(config.SMTPPassword, config.FromEmail, email, name, verificationURL)
		if apiErr == nil {
			fmt.Printf("[EMAIL] ✅ Email enviado exitosamente vía API REST de Resend\n")
			return nil
		}
		fmt.Printf("[EMAIL] ⚠️ Error con API REST de Resend: %v - intentando SMTP...\n", apiErr)
	}

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

// sendEmailViaResendAPI envía email usando la API REST de Resend
func sendEmailViaResendAPI(apiKey, fromEmail, toEmail, name, verificationURL string) error {
	fmt.Printf("[RESEND API] Iniciando envío vía API REST...\n")

	// Si el FROM_EMAIL es onboarding@resend.dev (modo prueba), usar el email registrado en Resend
	// En modo prueba, Resend solo permite enviar a tu propio email registrado
	// Para producción, necesitas verificar un dominio
	effectiveFromEmail := fromEmail
	if fromEmail == "onboarding@resend.dev" {
		// Intentar usar el email registrado en Resend (si está configurado)
		registeredEmail := os.Getenv("RESEND_REGISTERED_EMAIL")
		if registeredEmail == "" {
			// Por defecto, si no hay RESEND_REGISTERED_EMAIL configurado, usar el mismo email del destinatario
			// Esto funciona si estás enviando a tu propio email en modo prueba
			effectiveFromEmail = toEmail
			fmt.Printf("[RESEND API] ⚠️ Usando email de destino como remitente (modo prueba de Resend)\n")
		} else {
			effectiveFromEmail = registeredEmail
			fmt.Printf("[RESEND API] Usando email registrado en Resend: %s\n", registeredEmail)
		}
	}

	fmt.Printf("[RESEND API] From: %s\n", effectiveFromEmail)
	fmt.Printf("[RESEND API] To: %s\n", toEmail)

	// Preparar el cuerpo HTML del email
	emailBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu email - POSOQO</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 24px; font-weight: bold; color: #FFD700; margin-bottom: 10px;">POSOQO</div>
            <div style="color: #333; font-size: 20px; margin-bottom: 20px;">Verifica tu dirección de email</div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <p>Hola %s,</p>
            
            <p>Gracias por registrarte en POSOQO. Para completar tu registro, necesitamos verificar tu dirección de email.</p>
            
            <p>Haz clic en el botón de abajo para verificar tu email:</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #FFD700, #D4AF37); color: #000; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Verificar Email</a>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; border-radius: 5px; margin: 20px 0;">
                <strong>Importante:</strong> Este enlace expirará en 24 horas por seguridad.
            </div>
            
            <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>Este es un email automático, no respondas a este mensaje.</p>
            <p>&copy; 2024 POSOQO. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`, name, verificationURL)

	// Estructura de la petición a Resend API
	payload := map[string]interface{}{
		"from":    fmt.Sprintf("%s <%s>", "POSOQO", effectiveFromEmail),
		"to":      []string{toEmail},
		"subject": "Verifica tu email - POSOQO",
		"html":    emailBody,
	}

	jsonData, jsonErr := json.Marshal(payload)
	if jsonErr != nil {
		return fmt.Errorf("error creando JSON: %w", jsonErr)
	}

	// Crear petición HTTP
	req, reqErr := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if reqErr != nil {
		return fmt.Errorf("error creando petición: %w", reqErr)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	// Cliente HTTP con timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	fmt.Printf("[RESEND API] Enviando petición a Resend API...\n")
	resp, httpErr := client.Do(req)
	if httpErr != nil {
		return fmt.Errorf("error en petición HTTP: %w", httpErr)
	}
	defer resp.Body.Close()

	body, readErr := io.ReadAll(resp.Body)
	if readErr != nil {
		return fmt.Errorf("error leyendo respuesta: %w", readErr)
	}

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("[RESEND API] ❌ Error: Status %d, Body: %s\n", resp.StatusCode, string(body))
		return fmt.Errorf("error de API: status %d, respuesta: %s", resp.StatusCode, string(body))
	}

	fmt.Printf("[RESEND API] ✅ Respuesta exitosa: %s\n", string(body))
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

// Estructura para códigos de recuperación de contraseña
type PasswordResetCode struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	Code      string    `json:"code"`
	Email     string    `json:"email"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

// Generar código de 6 dígitos para recuperación de contraseña
func generatePasswordResetCode() string {
	// Generar número aleatorio de 6 dígitos (100000 a 999999)
	min := 100000
	max := 999999
	// Generar número aleatorio
	bytes := make([]byte, 4)
	rand.Read(bytes)
	// Convertir a entero y ajustar al rango
	num := int(bytes[0])<<24 | int(bytes[1])<<16 | int(bytes[2])<<8 | int(bytes[3])
	if num < 0 {
		num = -num
	}
	codeNum := min + (num % (max - min + 1))
	return fmt.Sprintf("%06d", codeNum)
}

// Crear código de recuperación en la base de datos
func createPasswordResetCode(userID int64, email string) (*PasswordResetCode, error) {
	code := generatePasswordResetCode()

	// Código expira en 15 minutos
	expiresAt := time.Now().Add(15 * time.Minute)

	// Invalidar códigos anteriores no usados para el mismo usuario
	_, err := db.DB.Exec(context.Background(),
		"UPDATE password_reset_codes SET used = true WHERE user_id = $1 AND used = false",
		userID,
	)
	if err != nil {
		fmt.Printf("[PASSWORD RESET] Error invalidando códigos anteriores: %v\n", err)
	}

	// Insertar nuevo código en la base de datos
	var id int64
	err = db.DB.QueryRow(context.Background(),
		"INSERT INTO password_reset_codes (user_id, code, email, expires_at) VALUES ($1, $2, $3, $4) RETURNING id",
		userID, code, email, expiresAt,
	).Scan(&id)

	if err != nil {
		return nil, err
	}

	return &PasswordResetCode{
		ID:        id,
		UserID:    userID,
		Code:      code,
		Email:     email,
		ExpiresAt: expiresAt,
		CreatedAt: time.Now(),
	}, nil
}

// Template HTML para email de recuperación de contraseña
const passwordResetTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - POSOQO</title>
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
        .code-container {
            background: linear-gradient(135deg, #FFD700, #D4AF37);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
        }
        .code {
            font-size: 36px;
            font-weight: bold;
            color: #000;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
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
            <div class="title">Recuperar Contraseña</div>
        </div>
        
        <div class="content">
            <p>Hola {{.Name}},</p>
            
            <p>Recibimos una solicitud para recuperar la contraseña de tu cuenta en POSOQO.</p>
            
            <p>Utiliza el siguiente código para restablecer tu contraseña:</p>
            
            <div class="code-container">
                <div class="code">{{.Code}}</div>
            </div>
            
            <div class="warning">
                <strong>Importante:</strong> 
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Este código expirará en 15 minutos</li>
                    <li>No compartas este código con nadie</li>
                    <li>Si no solicitaste este código, ignora este email</li>
                </ul>
            </div>
            
            <p>Si no solicitaste recuperar tu contraseña, puedes ignorar este email de forma segura.</p>
        </div>
        
        <div class="footer">
            <p>Este es un email automático, no respondas a este mensaje.</p>
            <p>&copy; 2024 POSOQO. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`

// Enviar email con código de recuperación de contraseña
func sendPasswordResetCode(userID int64, email, name, code string) error {
	fmt.Printf("[PASSWORD RESET] Iniciando envío de código a: %s (userID: %d)\n", email, userID)

	// Obtener configuración de email
	config := getEmailConfig()

	// Verificar que la configuración esté completa
	if config.SMTPHost == "" || config.SMTPUser == "" || config.SMTPPassword == "" {
		fmt.Printf("[PASSWORD RESET] ⚠️ Configuración SMTP incompleta - no se enviará email\n")
		return fmt.Errorf("configuración SMTP incompleta")
	}

	// Preparar datos para el template
	data := struct {
		Name string
		Code string
	}{
		Name: name,
		Code: code,
	}

	// Renderizar template
	tmpl, err := template.New("passwordReset").Parse(passwordResetTemplate)
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
	headers["Subject"] = "Código de recuperación de contraseña - POSOQO"
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	// Construir mensaje
	var message strings.Builder
	for key, value := range headers {
		message.WriteString(fmt.Sprintf("%s: %s\r\n", key, value))
	}
	message.WriteString("\r\n")
	message.WriteString(body.String())

	// Intentar primero con API REST de Resend (más confiable)
	if config.SMTPHost == "smtp.resend.com" && config.SMTPPassword != "" {
		fmt.Printf("[PASSWORD RESET] Detectado Resend - intentando API REST...\n")
		apiErr := sendPasswordResetCodeViaResendAPI(config.SMTPPassword, config.FromEmail, email, name, code)
		if apiErr == nil {
			fmt.Printf("[PASSWORD RESET] ✅ Email enviado exitosamente vía API REST de Resend\n")
			return nil
		}
		fmt.Printf("[PASSWORD RESET] ⚠️ Error con API REST de Resend: %v - intentando SMTP...\n", apiErr)
	}

	// Enviar email vía SMTP
	addr := fmt.Sprintf("%s:%s", config.SMTPHost, config.SMTPPort)
	fmt.Printf("[PASSWORD RESET] Intentando enviar email a través de: %s\n", addr)

	err = smtp.SendMail(addr, auth, config.FromEmail, []string{email}, []byte(message.String()))
	if err != nil {
		fmt.Printf("[PASSWORD RESET] ❌ Error con smtp.SendMail: %v\n", err)

		// Método alternativo: conexión manual con STARTTLS
		dialer := &net.Dialer{
			Timeout: 10 * time.Second,
		}

		conn, dialErr := dialer.Dial("tcp", addr)
		if dialErr != nil {
			return fmt.Errorf("error conectando a servidor SMTP: %w", dialErr)
		}
		defer conn.Close()

		client, clientErr := smtp.NewClient(conn, config.SMTPHost)
		if clientErr != nil {
			return fmt.Errorf("error creando cliente SMTP: %w", clientErr)
		}
		defer client.Quit()

		deadline := time.Now().Add(20 * time.Second)
		conn.SetDeadline(deadline)

		if config.SMTPPort == "587" {
			tlsConfig := &tls.Config{
				ServerName:         config.SMTPHost,
				InsecureSkipVerify: false,
			}
			if starttlsErr := client.StartTLS(tlsConfig); starttlsErr != nil {
				fmt.Printf("[PASSWORD RESET] ⚠️ Error en STARTTLS: %v\n", starttlsErr)
			}
		}

		if authErr := client.Auth(auth); authErr != nil {
			return fmt.Errorf("error en autenticación SMTP: %w", authErr)
		}

		if mailErr := client.Mail(config.FromEmail); mailErr != nil {
			return fmt.Errorf("error configurando remitente: %w", mailErr)
		}

		if rcptErr := client.Rcpt(email); rcptErr != nil {
			return fmt.Errorf("error configurando destinatario: %w", rcptErr)
		}

		writer, dataErr := client.Data()
		if dataErr != nil {
			return fmt.Errorf("error iniciando envío de datos: %w", dataErr)
		}

		messageBytes := []byte(message.String())
		if _, writeErr := writer.Write(messageBytes); writeErr != nil {
			writer.Close()
			return fmt.Errorf("error escribiendo datos: %w", writeErr)
		}

		if closeErr := writer.Close(); closeErr != nil {
			return fmt.Errorf("error cerrando escritor: %w", closeErr)
		}
	}

	fmt.Printf("[PASSWORD RESET] ✅ Email con código enviado exitosamente a %s\n", email)
	return nil
}

// sendPasswordResetCodeViaResendAPI envía código de recuperación usando la API REST de Resend
func sendPasswordResetCodeViaResendAPI(apiKey, fromEmail, toEmail, name, code string) error {
	fmt.Printf("[RESEND API] Iniciando envío de código de recuperación vía API REST...\n")

	effectiveFromEmail := fromEmail
	if fromEmail == "onboarding@resend.dev" {
		registeredEmail := os.Getenv("RESEND_REGISTERED_EMAIL")
		if registeredEmail == "" {
			effectiveFromEmail = toEmail
		} else {
			effectiveFromEmail = registeredEmail
		}
	}

	emailBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - POSOQO</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 24px; font-weight: bold; color: #FFD700; margin-bottom: 10px;">POSOQO</div>
            <div style="color: #333; font-size: 20px; margin-bottom: 20px;">Recuperar Contraseña</div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <p>Hola %s,</p>
            
            <p>Recibimos una solicitud para recuperar la contraseña de tu cuenta en POSOQO.</p>
            
            <p>Utiliza el siguiente código para restablecer tu contraseña:</p>
            
            <div style="background: linear-gradient(135deg, #FFD700, #D4AF37); padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #000; letter-spacing: 8px; font-family: 'Courier New', monospace;">%s</div>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; border-radius: 5px; margin: 20px 0;">
                <strong>Importante:</strong> Este código expirará en 15 minutos. No compartas este código con nadie.
            </div>
            
            <p>Si no solicitaste recuperar tu contraseña, puedes ignorar este email de forma segura.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>Este es un email automático, no respondas a este mensaje.</p>
            <p>&copy; 2024 POSOQO. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`, name, code)

	payload := map[string]interface{}{
		"from":    fmt.Sprintf("%s <%s>", "POSOQO", effectiveFromEmail),
		"to":      []string{toEmail},
		"subject": "Código de recuperación de contraseña - POSOQO",
		"html":    emailBody,
	}

	jsonData, jsonErr := json.Marshal(payload)
	if jsonErr != nil {
		return fmt.Errorf("error creando JSON: %w", jsonErr)
	}

	req, reqErr := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if reqErr != nil {
		return fmt.Errorf("error creando petición: %w", reqErr)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, httpErr := client.Do(req)
	if httpErr != nil {
		return fmt.Errorf("error en petición HTTP: %w", httpErr)
	}
	defer resp.Body.Close()

	body, readErr := io.ReadAll(resp.Body)
	if readErr != nil {
		return fmt.Errorf("error leyendo respuesta: %w", readErr)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("error de API: status %d, respuesta: %s", resp.StatusCode, string(body))
	}

	fmt.Printf("[RESEND API] ✅ Respuesta exitosa: %s\n", string(body))
	return nil
}
