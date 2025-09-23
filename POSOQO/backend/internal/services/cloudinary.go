package services

import (
	"context"
	"fmt"
	"io"

	// Comentado temporalmente para evitar errores de compilación en producción
	// "github.com/cloudinary/cloudinary-go/v2"
	// "github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// Comentado temporalmente - Cloudinary se usa solo desde el frontend
// var cld *cloudinary.Cloudinary

// InitCloudinary inicializa el cliente de Cloudinary
func InitCloudinary() error {
	// Cloudinary se maneja desde el frontend, no desde el backend
	fmt.Println("ℹ️ Cloudinary se maneja desde el frontend")
	return nil
}

// UploadImage sube una imagen a Cloudinary (deshabilitado - se usa frontend)
func UploadImage(ctx context.Context, file io.Reader, filename string) (interface{}, error) {
	return nil, fmt.Errorf("Cloudinary se maneja desde el frontend")
}

// DeleteImage elimina una imagen de Cloudinary (deshabilitado - se usa frontend)
func DeleteImage(ctx context.Context, publicID string) error {
	return fmt.Errorf("Cloudinary se maneja desde el frontend")
}

// GetImageURL obtiene la URL de una imagen (deshabilitado - se usa frontend)
func GetImageURL(publicID string) string {
	return ""
}
