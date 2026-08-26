# Gemflix Architecture 🏗️

## Overview
Gemflix es una plataforma de streaming y ecosistema de aplicaciones (Gemflix, GemDrive, Jellyfin) diseñada para ser **óptima, modular y segura**. Está inspirada en arquitecturas modernas, separando el backend (Go) del frontend (Next.js).

## Stack Tecnológico
*   **Backend:** Golang con Chi Router.
*   **Base de Datos:** PostgreSQL (usando `sqlc` para generación de queries y `pgx` como driver).
*   **Frontend / Panel Admin:** Next.js (App Router) con React y TailwindCSS.
*   **Autenticación:** JWT + RBAC (Role-Based Access Control).

## Estructura del Ecosistema

### 1. Backend (Go) - `c:\Proyectos\Gemflix\backend`
El backend actúa como un proxy inverso y servidor de API. Todo es estáticamente tipado y autogenerado cuando es posible para asegurar el máximo rendimiento.
*   **`api/`**: Contiene los manejadores (handlers) HTTP y el enrutador (`server.go`). 
    *   `admin_media_handlers.go`: Lógica administrativa para contenido (Integración TMDB).
    *   `admin_handlers.go`: Lógica administrativa general (Usuarios, Dispositivos).
    *   `auth_handlers.go`: JWT y sesiones de usuario.
*   **`db/`**: Lógica de persistencia.
    *   `migrations/`: Archivos `.sql` de `golang-migrate` (Ej: `000001_init.up.sql`, `000002_catalog.up.sql`).
    *   `query/`: Consultas puras en SQL (Ej: `admin.sql`, `catalog.sql`).
    *   `sqlc/`: Código Go autogenerado por SQLC a partir de las queries. (⚠️ **No editar manualmente**).

### 2. Frontend (Next.js) - `c:\Proyectos\Gemflix\frontend`
El frontend consume la API de Go. No interactúa directamente con la base de datos.
*   **`src/app/`**: Rutas de Next.js App Router.
    *   `admin/(dashboard)/`: El panel unificado de administración.
        *   `gemflix/`: Sub-panel para administrar contenido de video (Películas, Series).
        *   `gemdrive/`: Sub-panel para administrar almacenamiento en la nube (Futuro).
        *   `users/`, `devices/`: Secciones globales para gestionar permisos y accesos.
*   **`src/components/`**: Componentes reutilizables (Sidebar con Dropdown de Apps, Modales).

## Flujos de Datos Destacados

### Creación de Catálogo (TMDB Import)
Para evitar que el usuario deba escribir manualmente decenas de metadatos, implementamos un flujo de "Una sola dirección" (One-Way Scraping):
1.  **Frontend (Búsqueda):** El administrador busca "Inception" en el modal de Next.js (`GET /api/admin/tmdb/search`).
2.  **Selección:** Al hacer clic en "Importar", Next.js envía **únicamente** el `tmdb_id` al Backend (`POST /api/admin/movies`).
3.  **Backend (Extracción):** Go recibe el ID, consulta la API de TMDB (`api.themoviedb.org/3/movie/{id}`), extrae todos los metadatos (Runtime, Vote Average, Overview, Pósters) y los inserta de golpe en Postgres.

### Seguridad y RBAC (Role-Based Access Control)
*   **Roles:** Se definen en la tabla `roles` (Admin, Customer, Editor).
*   **Permisos:** Se asignan a roles en `role_permissions` (Ej: `manage_movies`, `manage_users`).
*   **Middleware:** En Go, `s.RequirePermissionChi("manage_...")` verifica el JWT del usuario, busca sus roles y valida si posee el permiso antes de ejecutar cualquier Handler de Admin. (Excepción de desarrollo: UserID=1 actúa como SuperAdmin y salta estas validaciones).

## Decisiones de Diseño Mantenibles
1.  **Sin Plugins Complejos:** A diferencia de sistemas heredados en Laravel (JMPLAY), Gemflix evita Livewire y múltiples plugins interconectados en el Frontend, priorizando un enfoque de REST API pura consumida asíncronamente por React.
2.  **TSVECTOR Nativo:** Para la búsqueda en la aplicación cliente, utilizamos Full-Text Search de PostgreSQL (`search_vector` generado automáticamente en las tablas) en lugar de depender de motores externos como Elasticsearch o Meilisearch, ahorrando RAM en el servidor.
3.  **Dropdown de Apps:** El Sidebar administrativo utiliza un `select` para alternar entre aplicaciones (Global, Gemflix, Gemdrive). Dependiendo de la app seleccionada, el menú lateral carga rutas específicas para no saturar al administrador con cientos de enlaces.
