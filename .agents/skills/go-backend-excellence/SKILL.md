---
name: go-backend-excellence
description: >-
  Aplica principios de arquitectura limpia, seguridad y concurrencia para el backend en Go (Chi, PostgreSQL, pgx).
  Activa este skill cuando estés diseñando APIs, middlewares, base de datos o lógica de negocio.
---

# Go Backend Excellence Skill (Gemflix 2026)

Este skill define el estándar de calidad arquitectónica y de seguridad para el backend de Gemflix escrito en Go. Sigue estas reglas **estrictamente** al crear o refactorizar handlers, repositorios o servicios.

Nuestro Stack: **Go 1.22+, Chi Router, pgx (PostgreSQL), golang-migrate, sqlc.**

## 1. Seguridad por Defecto (Secure by Default)
- **Cero Confianza (Zero Trust):** Nunca confíes en los inputs del cliente. Siempre valida y sanitiza los datos en la capa de handlers antes de pasarlos a los servicios o repositorios.
- **Autorización Robusta:** Los endpoints protegidos SIEMPRE deben estar envueltos en middlewares JWT (`s.AuthMiddleware`) y, si son del panel admin, usar RBAC (`s.RequirePermissionChi("permiso_aqui")`).
- **Protección contra Inyecciones:** Usa exclusivamente `sqlc` para generar consultas preparadas y tipadas (Prepared Statements) que previenen SQL Injection. NUNCA concatenes strings para formar queries SQL.
- **Manejo de Secretos:** Nunca escribas "hardcodeado" (harcode) ninguna API Key, contraseña o JWT Secret en el código. Lee todo desde variables de entorno (`os.Getenv`).

## 2. Arquitectura Limpia (Handlers -> Service -> Repo)
Mantén la lógica separada para facilitar el testeo y mantenimiento:
- **Handlers (`api/`):** Solo deben parsear JSON/Params, llamar al servicio o repositorio, y retornar JSON. No deben contener lógica de negocio compleja ni consultas SQL directas.
- **SQLC Queries (`db/query/`):** Todo el SQL reside aquí. Cada consulta debe tener nombre explícito y tipo (ej. `-- name: GetUser :one`).
- **Controladores de Errores (Error Handling):** En Go, los errores son valores. Maneja cada error explícitamente (`if err != nil`). Usa respuestas estándar de JSON para los errores (ej. `http.Error` o helpers propios `respondWithError(w, code, message)`). NO ocultes el error original en los logs (usa `log.Printf("error: %v", err)` pero envía un mensaje genérico al cliente en producción).

## 3. Concurrencia y Rendimiento (Goroutines)
- **Scraping y Tareas Lentas:** Cualquier tarea que dependa de red externa (ej. extraer metadata de TMDB) o procesamiento pesado debe manejarse de forma asíncrona usando Goroutines (`go func() { ... }()`), o mejor aún, mediante colas de tareas si la operación es crítica.
- **Timeouts:** Siempre respeta el contexto (`context.Context`) pasado desde la request HTTP (`r.Context()`) hasta la base de datos (`q.GetItem(r.Context(), id)`). Esto asegura que si el cliente cancela la request, las consultas a la DB también se cancelen, ahorrando recursos.

## 4. Anti-Patrones a Evitar (Lecciones de Frameworks Antiguos)
- **No uses ORMs pesados (GORM):** Usamos `sqlc` para máximo rendimiento y control directo de SQL puro.
- **No uses Relaciones Polimórficas (Laravel-style):** Las Foreign Keys en PostgreSQL deben ser reales y fuertes. No diseñes tablas con `model_type` y `model_id`.
- **Archivos Monolíticos:** Un archivo `handler.go` no debe tener 3000 líneas. Separa por dominios lógicos (ej. `admin_users_handlers.go`, `admin_catalog_handlers.go`).

## 5. Workflow al Recibir una Tarea de Backend
1. **Modelado SQL:** Define primero las tablas en `db/migrations/` y las consultas en `db/query/`. Ejecuta `sqlc generate`.
2. **Registro de Rutas:** Define la ruta y sus middlewares de protección en `server.go`.
3. **Implementación:** Escribe el handler en un archivo enfocado, capturando errores adecuadamente y respondiendo JSON estructurado.
