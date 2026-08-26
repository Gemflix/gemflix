package api

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func (s *Server) handleUploadLogo(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		http.Error(w, "File too large", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Invalid file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate extension
	ext := strings.ToLower(filepath.Ext(handler.Filename))
	if ext != ".png" && ext != ".jpeg" && ext != ".jpg" && ext != ".svg" {
		http.Error(w, "Invalid file type. Only PNG, JPEG, and SVG are allowed.", http.StatusBadRequest)
		return
	}

	// Create uploads directory if it doesn't exist inside frontend/public
	// Since backend runs from /backend, we go up and into frontend/public
	uploadDir := "../frontend/public/uploads"
	os.MkdirAll(uploadDir, os.ModePerm)

	// Add timestamp to avoid caching issues when replacing logo
	fileName := "logo" + ext
	dstPath := filepath.Join(uploadDir, fileName)
	dst, err := os.Create(dstPath)
	if err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Error copying file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"url": "/uploads/" + fileName,
	})
}
