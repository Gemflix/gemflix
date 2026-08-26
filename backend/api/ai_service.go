package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// Tipos compartidos para llamadas a Groq
type GroqRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GroqResponse struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}

// CallGroqAPI es la función modular central para invocar a Groq.
func CallGroqAPI(ctx context.Context, systemPrompt, userPrompt, model string) (string, error) {
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GROQ_API_KEY no configurada")
	}

	if model == "" {
		model = "llama3-8b-8192" // Modelo por defecto
	}

	reqBody := GroqRequest{
		Model: model,
		Messages: []Message{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("error de Groq API (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	var groqResp GroqResponse
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return "", err
	}

	if len(groqResp.Choices) > 0 {
		return groqResp.Choices[0].Message.Content, nil
	}

	return "", fmt.Errorf("respuesta vacía de Groq")
}

// GenerateMissingTextWithAI usa la función modular para generar textos faltantes.
func GenerateMissingTextWithAI(ctx context.Context, prompt string) (string, error) {
	systemPrompt := "Eres un redactor experto de cine y televisión. Tu tarea es generar sinopsis o biografías en español neutro de forma concisa (máximo 100 palabras). Devuelve ÚNICAMENTE el texto generado, sin introducciones ni comentarios adicionales."
	return CallGroqAPI(ctx, systemPrompt, prompt, "llama3-8b-8192")
}

// TranslateNameWithAI traduce un nombre corto (como un género o plataforma) al idioma objetivo.
func TranslateNameWithAI(ctx context.Context, text, targetLang string) string {
	if text == "" {
		return ""
	}
	systemPrompt := fmt.Sprintf("Translate the following short name to %s. Return ONLY the translated word or phrase, with NO punctuation at the end, NO quotes, and NO additional text.", targetLang)
	translated, err := CallGroqAPI(ctx, systemPrompt, text, "llama3-8b-8192")
	if err != nil || translated == "" {
		return text // Fallback to original
	}
	return translated
}
