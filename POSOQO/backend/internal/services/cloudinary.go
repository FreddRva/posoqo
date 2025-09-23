package services

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

// InitCloudinary inicializa el cliente de Cloudinary
func InitCloudinary() error {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		fmt.Println("⚠️ Variables de entorno de Cloudinary no configuradas, usando almacenamiento local")
		return nil
	}

	var err error
	cld, err = cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		fmt.Printf("⚠️ Error inicializando Cloudinary: %v, usando almacenamiento local\n", err)
		return nil
	}

	fmt.Println("✅ Cloudinary inicializado correctamente")
	return nil
}

// UploadImage sube una imagen a Cloudinary
func UploadImage(ctx context.Context, file io.Reader, filename string) (*uploader.UploadResult, error) {
	if cld == nil {
		return nil, fmt.Errorf("Cloudinary no inicializado")
	}

	// Subir imagen a Cloudinary
	result, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID:       filename,
		Folder:         "posoqo/products",
		ResourceType:   "image",
		Transformation: "f_auto,q_auto,w_800,h_600,c_fill",
	})

	if err != nil {
		return nil, fmt.Errorf("error subiendo imagen a Cloudinary: %w", err)
	}

	fmt.Printf("✅ [CLOUDINARY] Imagen subida: %s\n", result.SecureURL)
	return result, nil
}

// DeleteImage elimina una imagen de Cloudinary
func DeleteImage(ctx context.Context, publicID string) error {
	if cld == nil {
		return fmt.Errorf("Cloudinary no inicializado")
	}

	_, err := cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})

	if err != nil {
		return fmt.Errorf("error eliminando imagen de Cloudinary: %w", err)
	}

	fmt.Printf("✅ [CLOUDINARY] Imagen eliminada: %s\n", publicID)
	return nil
}

// GetImageURL obtiene la URL de una imagen
func GetImageURL(publicID string) string {
	if cld == nil {
		return ""
	}

	url, _ := cld.Url.SignUrl(publicID, map[string]string{
		"secure":         "true",
		"transformation": "f_auto,q_auto",
	})

	return url
}
