---
description: Reglas de arquitectura y navegación para el Frontend (Admin Panel en Next.js), basadas en la migración desde Laravel Filament.
---

# Frontend Architecture Guidelines (Next.js Admin Panel)

Cuando interactúes o construyas el Panel de Administración Frontend (ubicado en `frontend/src/app/admin/`), debes adherirte estrictamente a los siguientes principios, acordados tras la migración desde Laravel Filament.

## 1. Filosofía Anti-Bloat (Next.js puro)
- **No imitar a Laravel Filament:** Aunque estamos portando los 32 Recursos de Filament, NO intentaremos replicar la lógica interna de Filament (PHP/Livewire). Construiremos interfaces nativas de React usando Server Components, Server Actions (en `/actions`) y Tailwind CSS.
- **Consolidación visual:** No cada tabla de la base de datos merece un botón en el menú principal. Elementos como `DriveReplicaTargets` o `ScraperRunFailures` deben ser vistas secundarias o modales dentro de sus pantallas padre (`DriveReplicas` y `ScraperSources` respectivamente) para mantener una excelente UX.

## 2. Los 5 Ecosistemas Maestros
La navegación no es plana. Se divide en 5 grandes "Apps" o ecosistemas controlados por el menú desplegable superior izquierdo del `Sidebar.tsx`. Toda ruta nueva DEBE pertenecer a uno de estos 5:
1. **Global (`/admin/` y módulos genéricos):** Administra Usuarios, Staff, Dispositivos, Métricas Demográficas, y todo lo que afecte a la plataforma transversalmente.
2. **Gemflix (`/admin/gemflix`):** Exclusivo para el Catálogo (Películas, Series, Categorías, Reparto, IPTV, TV en Vivo, Redes).
3. **GemDrive (`/admin/gemdrive`):** Exclusivo para la Infraestructura TI (Cuentas, Cuotas, Fuentes, Replicas, Archivos Sincronizados y Sitios SharePoint).
4. **GemAutomator (`/admin/gemautomator`):** Exclusivo para automatizaciones (Scrapers Internos para Gemflix, API de Scrapers para terceros y Logs).
5. **Jellyfin (`/admin/jellyfin`):** Exclusivo para el control del servidor local (Sincronización, Nodos, Usuarios de Jellyfin, Sesiones Activas).

## 3. Sub-ecosistemas Transversales (Dentro de Global)
Para no saturar el selector de Ecosistemas con decenas de opciones, ciertas lógicas de negocio masivas se anidan dentro del **Panel Global** usando menús desplegables:
- **Monetización y Tienda:** Planes VIP, Transacciones, Rotador de Ads (Links/Banners), Códigos Promo y Tienda de Avatares. (Nota: Se usan pasarelas de pago Crypto/alternativas al ser un proyecto Warez, NO Stripe/PayPal oficiales que causen baneos).
- **Gamificación:** Minijuegos Arcade, Ruleta de Premios y Recompensas (Wallets).

## 4. Componentes Globales Dinámicos
- Las opciones de **Tutoriales** y **Gestor de Descargas** pertenecen al panel Global porque su contenido se inyectará dinámicamente en múltiples productos frontend, evitando duplicación de código o mantenimiento.

## 5. Fetching y Networking (useApi)
- **NUNCA uses `fetch()` crudo** para consultar la API del backend desde un Client Component.
- **SIEMPRE utiliza el hook `useApi()`** ubicado en `@/hooks/useApi` (para peticiones GET) o la función `apiFetch()` desde `@/lib/api` (para POST/PUT/DELETE).
- Estas utilidades inyectan automáticamente el token de autorización (Bearer JWT) requerido por los middlewares de Go. Un `fetch` nativo fallará con errores de 401/404 por falta de credenciales.

## 6. Arquitectura de Subdominios (Multi-tenant Routing)
- Gemflix no es una sola aplicación, es una **Suite de Servicios**. Por lo tanto, el enrutamiento más profesional y escalable es a través de **Subdominios** (ej. `play.gemflix.com`, `admin.gemflix.com`, `drive.gemflix.com`), no mediante subrutas (`/play`, `/admin`).
- **¿Por qué es superior?** Permite tener cookies compartidas bajo el dominio wildcard (`.gemflix.com`), previene colisiones de rutas (Play y Admin pueden tener un `/settings` sin conflictos), y permite en el futuro separar la infraestructura si Gemdrive consume mucho ancho de banda.
- **Implementación actual:** El archivo `src/middleware.ts` actúa como un orquestador o *Reverse Proxy* interno. Intercepta el `host` de la petición y hace un `rewrite` silencioso hacia las carpetas base dentro de `src/app`.
  - `admin.*` -> `src/app/(admin)` (Omitido de la URL mediante Route Group)
  - `play.*` -> `src/app/play`
  - `drive.*` -> `src/app/drive`
  - `jellyfin.*` -> `src/app/jellyfin`
- **Regla Estricta:** Nunca uses `window.location.href = "/admin"` para saltar entre ecosistemas en el frontend. Si estás en `play.` y quieres ir al admin, debes construir la URL absoluta (ej. `https://admin.gemflix.com`) o confiar en que el `middleware.ts` redirija al detectar el rol de Staff.
