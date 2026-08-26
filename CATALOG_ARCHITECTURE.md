# Arquitectura del Catálogo (Películas y Series)

Este documento detalla la arquitectura, el flujo de datos y las decisiones de diseño del sistema de catálogo de Gemflix (Películas y Series). Describe cómo la información fluye desde que un administrador busca una película en The Movie Database (TMDB) hasta que se persiste en la base de datos de PostgreSQL y se expone a los usuarios finales.

---

## 1. Flujo de Sincronización con TMDB (Creación)

El sistema utiliza la API de TMDB como fuente de verdad para poblar el catálogo. Cuando un administrador hace clic en "Agregar a la base de datos":

1. **Búsqueda (Search):** El frontend llama al endpoint `/api/admin/tmdb/search`. El backend hace proxy de esta solicitud a la API de TMDB y devuelve resultados paginados y tipados (Peliculas o Series).
2. **Importación Inicial (Creación):** Se invoca `POST /api/admin/movies` o `POST /api/admin/series` enviando el `tmdb_id`.
   - **Mapeo Principal:** Se solicita la data completa de TMDB (`language=es-MX&append_to_response=credits,watch/providers`).
   - Se procesa el JSON mapeando los campos principales (`title`, `overview`, `release_date`, etc.) a los parámetros de SQLc (`CreateMovieParams` o `CreateSerieParams`).
   - El estado de la película se guarda según lo definido (por defecto `Publicado`).
3. **Sincronización en Segundo Plano (Goroutines):**
   Para no bloquear la interfaz, el procesamiento de las **relaciones** y las **imágenes** se lanza de manera asíncrona mediante goroutines:
   - `SyncMovieRelations`: Inserta iterativamente Géneros, Reparto (Casts), Plataformas (Networks) y Colecciones en tablas pivote (`movie_genres`, `movie_casts`, etc.).
   - `SyncMediaImages`: Consulta la API de Fanart.tv para descargar "backdrops" libres de texto e inserta el póster principal en la tabla `media_images`.

---

## 2. Gestión de Relaciones y Lógica de Filtros

Las relaciones complejas tienen lógica de negocio incrustada en Go (`tmdb_service.go`):

### Reparto (Casts)
- Se importan los **primeros 15 actores** del campo `credits.cast`.
- Se importan los **primeros 5 miembros del equipo técnico (Crew)** filtrados estrictamente a directores, productores ejecutivos, productores y guionistas.
- Los miembros del Crew reciben un `SortOrder` superior a 100 para garantizar que siempre aparezcan después de los actores principales en las interfaces de usuario.

### Plataformas de Streaming (Watch Providers / Networks)
Dado que TMDB lista agregadores y canales menores, existe un filtro estricto implementado en Go (`shouldSkipProvider` y `normalizeProviderName`) portado desde la lógica en Laravel:
- **Normalización:** Plataformas como `Amazon Prime Video` se renombran a `Prime Video`. `Disney Plus` a `Disney+`.
- **Bloqueo de Ruido:** Se omiten redes que contienen las palabras "amazon channel", "apple tv channel", "with ads", etc., para mantener el catálogo limpio.
- **Preferencia Regional:** Se solicitan los resultados primariamente para la región "MX" (México). Si no existen, hace "fallback" a la región "US" (Estados Unidos).

### Colecciones (Sagas)
- Si una película pertenece a una colección (ej. "Harry Potter Collection"), se extrae automáticamente, se guarda la colección en la tabla `collections` y se asocia la película a dicha saga.

---

## 3. Modelo de Datos y PostgreSQL

La persistencia se realiza íntegramente con consultas generadas por `sqlc` que aseguran tipado fuerte.

### Tablas Principales
- `movies`: Entidad base para largometrajes.
- `series`: Entidad base para programas de TV.
- `seasons` y `episodes`: Estructura jerárquica para las series.

### Tablas Catálogo (Compartidas)
- `genres`, `casts`, `networks`, `collections`: Datos maestros que pueden ser compartidos entre películas y series.
- **Tablas Pivote:** `movie_genres`, `serie_networks`, `movie_casts`, etc.
  - *Desvinculación:* La interfaz de edición permite desvincular estas relaciones eliminando la fila directamente en la tabla pivote mediante llamadas `DELETE /{mediaType}/{mediaId}/{relationType}/{relationId}`.

### Gestión de Imágenes Avanzada (`media_images`)
Se rediseñó la arquitectura de imágenes eliminando las columnas estáticas `poster_path` y `backdrop_path` de las tablas `movies` y `series`.
- En su lugar, todas las imágenes se agrupan en una tabla polimórfica: `media_images`.
- **Beneficio:** Permite tener múltiples pósters, múltiples backdrops (ej. uno para español, otro para inglés), logos transparentes (fanart), y "tvthumbs".
- **Selección de la Principal:** Se utiliza una columna `is_main` booleana.
- **Retorno Eficiente:** Al devolver los detalles al Frontend (ej. `GetMovieFullDetails`), SQL utiliza consultas sub-select para hacer un `COALESCE` y devolver el `main_poster` y el `main_backdrop` directamente precalculado, en vez de obligar al frontend a buscarlos en una lista.

---

## 4. Edición de Metadatos y Optimización

- **Formulario de Edición (UI):** Una interfaz centralizada tipo "pestañas" (Detalles, Media, Galería) que evita abrumar al usuario.
- Los interruptores booleanos (Switches) permiten habilitar opciones como `premium`, `enable_download`, y `premiere` sin requerir guardar manualmente (se auto-guardan al hacer click enviando un request al backend, o bien se guardan mediante el botón general según la lógica).
- **Asistencia AI:** El campo de Sinopsis (Overview) incluye un botón `Mejorar IA` que llama a Gemini para autocorregir ortografía, traducción o acortar la longitud, estandarizando el tono del catálogo.

---

## 5. Próximos Pasos (Arquitectura Futura)

1. **Búsqueda Manual de Relaciones:** Incorporar la adición manual de actores o redes a través de un modal de búsqueda de la BD local que los asigne.
2. **Workers Queue:** Migrar las Goroutines asíncronas de creación de catálogo (`SyncMediaImages`) a un sistema de colas real (como RabbitMQ, o algo basado en PostgreSQL/Redis) para reintentos garantizados si la API de Fanart.tv se satura.
