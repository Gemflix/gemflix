# Reglas Maestras de Gemflix (Memoria Permanente)

> Este archivo (`GEMINI.md`) se carga de forma obligatoria en la memoria de la IA al inicio de CADA conversación y en CADA tarea. Nunca asumas nada que contradiga este documento.

## 1. Referencia del Proyecto Legacy (JMPLAY)
- **Ruta Absoluta:** `C:\LAPTOP\JMPLAY`
- **Regla:** Si tienes dudas sobre cómo estructurar una UI, un menú, un endpoint o la base de datos, DEBES consultar primero el código fuente en `C:\LAPTOP\JMPLAY`. Nunca inventes estructuras si ya existen en el proyecto Laravel original.

## 2. Stack Tecnológico Actual (Gemflix 2026)
- **Frontend:** Next.js 16 (App Router), React, TypeScript, TailwindCSS v4, Framer Motion.
- **Backend:** Go 1.22+, Chi Router, PostgreSQL, pgx, sqlc.
- **Prohibido:** No uses Laravel, PHP, Prisma, ni ORMs pesados en el código nuevo.

## 3. Arquitectura de Subdominios (Multi-tenant)
Gemflix es una suite de servicios operada por un `middleware.ts` en el root del frontend:
- `admin.*` -> `src/app/(admin)`
- `play.*` -> `src/app/play`
- `drive.*` -> `src/app/drive`
Nunca uses sub-rutas (ej. `/admin` o `/play`) para navegar entre apps, usa siempre URLs absolutas con los subdominios correspondientes.

## 4. UI Humanizada y Experiencia (2026)
Todos los componentes del frontend deben tener:
- **Skeletons de Carga** (nunca spinners gigantes).
- **Empty States Empáticos** (siempre con íconos de lucide-react y botones de acción).
- **Micro-interacciones** (Framer Motion o Tailwind `group-hover`, scale, opacidades fluidas).
- Autenticación manejada exclusivamente vía `useApi` (JWT en cookies).

## 5. Reglas de Enrutamiento y Cookies (Subdominios)
- **Cookies Compartidas:** Las cookies de sesión (`access_token`, `refresh_token`, `gemflix_staff_role`) DEBEN usar `domain: ".gemflix.org"` en producción y `domain: "localhost"` en desarrollo para que viajen entre todos los subdominios.
- **Doble /play:** Al usar subdominios, el enrutador de Next.js (`router.push`) y los `<Link>` en el frontend público NUNCA deben llevar prefijo (ej: usa `/media/[id]`, NO `/play/media/[id]`). El `middleware.ts` se encarga de reescribirlo silenciosamente.
- **Roles:** Un administrador (Staff) tiene estrictamente prohibido navegar en los subdominios públicos (`play.`, `drive.`). El middleware siempre los expulsará de vuelta al panel `admin.`.
- **Forzar Login Global:** El acceso a los catálogos públicos está dictado por `public_catalog` en el backend. El `middleware.ts` DEBE consultar esto con `cache: 'no-store'` para evitar bloqueos por caché.

## 6. Arquitectura Anti-DMCA (Bunker Mode)
- El backend entrega de forma dinámica las rutas (`hero.slug`, `item.slug`).
- Dependiendo de la configuración `use_slugs`, el Backend devuelve URLs hermosas SEO-friendly (ej: `deadpool-y-lobezno`) o en "Modo Bunker" devuelve puros UUIDs irastreables.
- El Frontend asume que TODO es dinámico y ciego, nunca hardcodea IDs o Slugs.

## 7. Arquitectura del Reproductor de Video (One-Player)
- Usamos **Video.js** (v8.x LTS Oficial) como estándar corporativo para monetización VAST a largo plazo.
- ¡Prohibido usar dos reproductores distintos! Hay un solo Wrapper maestro en React (`VideoPlayer.tsx`).
- El Reproductor recibe un prop `isVip`. Si eres VIP, el componente omite inyectar la carga publicitaria de VAST. Un solo código, dos experiencias.
