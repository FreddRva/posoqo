package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// GeminiService maneja las interacciones con Google Gemini AI
type GeminiService struct {
	APIKey     string
	BaseURL    string
	Model      string
	HTTPClient *http.Client
}

// GeminiRequest representa una solicitud a Gemini
type GeminiRequest struct {
	Contents         []GeminiContent   `json:"contents"`
	GenerationConfig *GenerationConfig `json:"generationConfig,omitempty"`
	SafetySettings   []SafetySetting   `json:"safetySettings,omitempty"`
}

// GeminiContent representa el contenido de un mensaje
type GeminiContent struct {
	Role  string       `json:"role"`
	Parts []GeminiPart `json:"parts"`
}

// GeminiPart representa una parte del contenido
type GeminiPart struct {
	Text string `json:"text"`
}

// GenerationConfig configura la generación de respuestas
type GenerationConfig struct {
	Temperature     float64  `json:"temperature,omitempty"`
	TopK            int      `json:"topK,omitempty"`
	TopP            float64  `json:"topP,omitempty"`
	MaxOutputTokens int      `json:"maxOutputTokens,omitempty"`
	StopSequences   []string `json:"stopSequences,omitempty"`
}

// SafetySetting configura los filtros de seguridad
type SafetySetting struct {
	Category  string `json:"category"`
	Threshold string `json:"threshold"`
}

// GeminiResponse representa la respuesta de Gemini
type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
			Role string `json:"role"`
		} `json:"content"`
		FinishReason  string `json:"finishReason"`
		Index         int    `json:"index"`
		SafetyRatings []struct {
			Category    string `json:"category"`
			Probability string `json:"probability"`
		} `json:"safetyRatings"`
	} `json:"candidates"`
	PromptFeedback struct {
		SafetyRatings []struct {
			Category    string `json:"category"`
			Probability string `json:"probability"`
		} `json:"safetyRatings"`
	} `json:"promptFeedback"`
}

// NewGeminiService crea una nueva instancia del servicio Gemini
func NewGeminiService() *GeminiService {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		fmt.Println("⚠️  GEMINI_API_KEY no configurada")
	}

	return &GeminiService{
		APIKey:  apiKey,
		BaseURL: "https://generativelanguage.googleapis.com/v1beta/models",
		Model:   "gemini-1.5-flash", // Modelo estable en v1beta
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GenerateContent genera contenido usando Gemini
func (s *GeminiService) GenerateContent(prompt string, config *GenerationConfig) (string, error) {
	if s.APIKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY no configurada")
	}
	
	fmt.Printf("[Gemini] Generando contenido con modelo: %s\n", s.Model)
	fmt.Printf("[Gemini] BaseURL: %s\n", s.BaseURL)

	// Configuración por defecto
	if config == nil {
		config = &GenerationConfig{
			Temperature:     0.7,
			TopK:            40,
			TopP:            0.95,
			MaxOutputTokens: 2048,
		}
	}

	// Construir request
	request := GeminiRequest{
		Contents: []GeminiContent{
			{
				Role: "user",
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
		GenerationConfig: config,
		SafetySettings: []SafetySetting{
			{Category: "HARM_CATEGORY_HARASSMENT", Threshold: "BLOCK_MEDIUM_AND_ABOVE"},
			{Category: "HARM_CATEGORY_HATE_SPEECH", Threshold: "BLOCK_MEDIUM_AND_ABOVE"},
			{Category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", Threshold: "BLOCK_MEDIUM_AND_ABOVE"},
			{Category: "HARM_CATEGORY_DANGEROUS_CONTENT", Threshold: "BLOCK_MEDIUM_AND_ABOVE"},
		},
	}

	// Serializar request
	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", fmt.Errorf("error al serializar request: %w", err)
	}

	// Construir URL
	url := fmt.Sprintf("%s/%s:generateContent?key=%s", s.BaseURL, s.Model, s.APIKey)

	// Crear HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error al crear request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Ejecutar request
	resp, err := s.HTTPClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("error al ejecutar request: %w", err)
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error al leer respuesta: %w", err)
	}

	// Verificar status code
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("error de API (status %d): %s", resp.StatusCode, string(body))
	}

	// Parsear respuesta
	var geminiResp GeminiResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		return "", fmt.Errorf("error al parsear respuesta: %w", err)
	}

	// Extraer texto de la respuesta
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("respuesta vacía de Gemini")
	}

	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}

// GenerateChat genera una respuesta en un contexto de chat
func (s *GeminiService) GenerateChat(messages []GeminiContent, config *GenerationConfig) (string, error) {
	if s.APIKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY no configurada")
	}

	// Configuración por defecto
	if config == nil {
		config = &GenerationConfig{
			Temperature:     0.8,
			TopK:            40,
			TopP:            0.95,
			MaxOutputTokens: 2048,
		}
	}

	// Construir request
	request := GeminiRequest{
		Contents:         messages,
		GenerationConfig: config,
		SafetySettings: []SafetySetting{
			{Category: "HARM_CATEGORY_HARASSMENT", Threshold: "BLOCK_MEDIUM_AND_ABOVE"},
			{Category: "HARM_CATEGORY_HATE_SPEECH", Threshold: "BLOCK_MEDIUM_AND_ABOVE"},
			{Category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", Threshold: "BLOCK_MEDIUM_AND_ABOVE"},
			{Category: "HARM_CATEGORY_DANGEROUS_CONTENT", Threshold: "BLOCK_MEDIUM_AND_ABOVE"},
		},
	}

	// Serializar request
	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", fmt.Errorf("error al serializar request: %w", err)
	}

	// Construir URL
	url := fmt.Sprintf("%s/%s:generateContent?key=%s", s.BaseURL, s.Model, s.APIKey)

	// Crear HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error al crear request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Ejecutar request
	resp, err := s.HTTPClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("error al ejecutar request: %w", err)
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error al leer respuesta: %w", err)
	}

	// Verificar status code
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("error de API (status %d): %s", resp.StatusCode, string(body))
	}

	// Parsear respuesta
	var geminiResp GeminiResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		return "", fmt.Errorf("error al parsear respuesta: %w", err)
	}

	// Extraer texto de la respuesta
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("respuesta vacía de Gemini")
	}

	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}

// GenerateEmbedding genera embeddings para búsqueda semántica
func (s *GeminiService) GenerateEmbedding(text string) ([]float64, error) {
	if s.APIKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY no configurada")
	}

	// Construir request para embeddings
	request := map[string]interface{}{
		"model": "models/embedding-001",
		"content": map[string]interface{}{
			"parts": []map[string]string{
				{"text": text},
			},
		},
	}

	// Serializar request
	jsonData, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("error al serializar request: %w", err)
	}

	// Construir URL
	url := fmt.Sprintf("%s/embedding-001:embedContent?key=%s", s.BaseURL, s.APIKey)

	// Crear HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("error al crear request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Ejecutar request
	resp, err := s.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error al ejecutar request: %w", err)
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error al leer respuesta: %w", err)
	}

	// Verificar status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error de API (status %d): %s", resp.StatusCode, string(body))
	}

	// Parsear respuesta
	var embeddingResp struct {
		Embedding struct {
			Values []float64 `json:"values"`
		} `json:"embedding"`
	}
	if err := json.Unmarshal(body, &embeddingResp); err != nil {
		return nil, fmt.Errorf("error al parsear respuesta: %w", err)
	}

	return embeddingResp.Embedding.Values, nil
}
