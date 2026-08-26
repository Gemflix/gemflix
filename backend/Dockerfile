# ----------------------------------
# Etapa 1: Constructor (Builder)
# ----------------------------------
FROM golang:1.26-alpine AS builder

# Habilitar CGO_ENABLED=0 para asegurar que el binario sea completamente estático
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# Crear directorio de trabajo
WORKDIR /app

# Copiar go.mod y go.sum primero para aprovechar la caché de capas de Docker
COPY go.mod go.sum ./
RUN go mod download

# Copiar el resto del código fuente
COPY . .

# Construir el binario (omitiendo información de depuración para reducir el tamaño)
RUN go build -ldflags="-w -s" -o gemflix-api main.go

# ----------------------------------
# Etapa 2: Imagen Final (Scratch)
# ----------------------------------
# Scratch es una imagen vacía (0 MB), lo que hace que tu contenedor sea ultra seguro y ligero
FROM alpine:latest

# Instalar certificados CA (necesario si tu backend hace peticiones HTTPS, ej. a TMDB)
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copiar el binario compilado desde la etapa 1
COPY --from=builder /app/gemflix-api .

# (Opcional) Copiar migraciones si planeas correrlas desde el binario
# COPY --from=builder /app/db/migrations ./db/migrations

# Exponer el puerto
EXPOSE 8080

# Ejecutar
CMD ["./gemflix-api"]
