package handlers

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posoqo/backend/internal/services"
)

// UploadImageHandler maneja la subida de imágenes
func UploadImageHandler(c *fiber.Ctx) error {
	// Obtener el archivo de la request
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "No se encontró ningún archivo",
		})
	}

	// Validar tamaño del archivo (máximo 5MB)
	if file.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{
			"error": "El archivo es demasiado grande. Máximo 5MB",
		})
	}

	// Validar tipo de archivo
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}

	if !allowedTypes[file.Header.Get("Content-Type")] {
		return c.Status(400).JSON(fiber.Map{
			"error": "Tipo de archivo no permitido. Solo JPG, PNG, GIF y WebP",
		})
	}

	// Generar nombre único para el archivo
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		// Inferir extensión del Content-Type
		contentType := file.Header.Get("Content-Type")
		switch contentType {
		case "image/jpeg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/gif":
			ext = ".gif"
		case "image/webp":
			ext = ".webp"
		default:
			ext = ".jpg"
		}
	}

	// Generar nombre único
	uniqueID := uuid.New().String()
	timestamp := time.Now().Format("20060102-150405")
	filename := fmt.Sprintf("posoqo-%s-%s%s", timestamp, uniqueID[:8], strings.ToLower(ext))

	// Abrir el archivo subido
	src, err := file.Open()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Error abriendo archivo",
		})
	}
	defer src.Close()

	// Intentar subir a Cloudinary primero
	ctx := context.Background()
	result, err := services.UploadImage(ctx, src, filename)
	if err != nil {
		// Si Cloudinary falla, usar almacenamiento local como fallback
		fmt.Printf("⚠️ [UPLOAD] Cloudinary falló, usando almacenamiento local: %v\n", err)

		// Crear directorio uploads si no existe
		uploadsDir := "./uploads"
		if err := os.MkdirAll(uploadsDir, 0755); err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "Error creando directorio de uploads",
			})
		}

		// Resetear el reader
		src.Seek(0, 0)

		// Crear el archivo de destino local
		localFilepath := filepath.Join(uploadsDir, filename)
		dst, err := os.Create(localFilepath)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "Error creando archivo de destino",
			})
		}
		defer dst.Close()

		// Copiar el contenido
		if _, err = io.Copy(dst, src); err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "Error guardando archivo",
			})
		}

		// URL pública del archivo local
		fileURL := fmt.Sprintf("/uploads/%s", filename)

		fmt.Printf("✅ [UPLOAD] Imagen subida localmente: %s\n", fileURL)

		return c.JSON(fiber.Map{
			"success":   true,
			"message":   "Imagen subida exitosamente (almacenamiento local)",
			"url":       fileURL,
			"image_url": fileURL,
			"filename":  filename,
			"storage":   "local",
		})
	}

	// Éxito con Cloudinary
	fmt.Printf("✅ [UPLOAD] Imagen subida a Cloudinary: %s\n", result.SecureURL)

	return c.JSON(fiber.Map{
		"success":   true,
		"message":   "Imagen subida exitosamente",
		"url":       result.SecureURL,
		"image_url": result.SecureURL,
		"filename":  filename,
		"public_id": result.PublicID,
		"storage":   "cloudinary",
	})
}
