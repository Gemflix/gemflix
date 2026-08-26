# Arquitectura de Películas y Series en Gemflix

Este documento detalla la arquitectura, el flujo de datos y los procesos detrás de la creación, gestión y vinculación de Películas y Series en el panel de administración de Gemflix, uniendo el frontend en Next.js con el backend en Go (Chi + SQLc) y PostgreSQL.

## 1. Modelo de Datos (PostgreSQL)

El núcleo de Gemflix es una base de datos relacional (PostgreSQL). Las entidades principales para el catálogo son:

- **`movies`**: Almacena los metadatos principales de una película (`tmdb_id`, `imdb_id`, `title_lat`, `overview`, `runtime`, `popularity`, `vote_average`, etc.).
- **`series`**: Similar a `movies`, pero específico para series de TV (`first_air_date`, `episode_run_time`, etc.).
- **`media_images`**: Tabla polimórfica que almacena imágenes de Fanart y TMDB (`poster`, `backdrop`, `logo`, `clearart`, `tvthumb`). Se relaciona con películas o series, e incluye un campo booleano `is_main` para designar qué imagen es la portada oficial.

### Tablas de Relaciones (Pivotes)
El catálogo requiere relaciones complejas de muchos a muchos para funcionar correctamente. Para esto existen las siguientes tablas:

- **`genres`**: Catálogo de géneros.
  - `movies_genres` / `series_genres`: Tablas pivote.
- **`networks`**: Proveedores de streaming primarios (ej. Netflix, HBO Max).
  - `movies_networks` / `series_networks`: Tablas pivote.
- **`casts`**: Actores y equipo técnico (Casting).
  - `movies_casts` / `series_casts`: Tablas pivote que incluyen el `character_name`.
- **`collections`**: Franquicias o sagas (ej. Universo Cinematográfico de Marvel).
  - Cada película puede estar opcionalmente asociada a una colección (1 a muchos).

## 2. Flujo de Edición de Metadatos

Cuando el administrador entra a la página de edición (`/admin/gemflix/movies/[id]`), el sistema realiza los siguientes pasos:

1. **Obtención de datos (GET)**: 
   El frontend hace una petición a `GET /api/admin/movies/{id}`.
   El backend ejecuta una consulta extensa (`GetMovieForAdminPanel` en SQLc) que usa múltiples `LEFT JOIN` y agregación JSON (`jsonb_agg`) para retornar la película junto con **todos** sus géneros, actores, redes, colecciones e imágenes en una sola respuesta.
2. **Representación en UI**:
   El estado en React toma estos valores y los muestra en una cuadrícula completa inspirada en Filament, dividida por pestañas: *Detalles, Reparto, Redes & Géneros, y Galería*.
3. **Guardado (PUT)**:
   Al hacer clic en "Guardar Cambios", se envía un `PUT /api/admin/movies/{id}` con un cuerpo JSON de los campos editables (`title_lat`, `overview`, `status`, `premium`, flags, estadisticas, trailer, etc.). El manejador en Go deserializa esto y lo inserta limpiamente a PostgreSQL a través de SQLc, manejando de forma segura los tipos nulos (`pgtype`).

## 3. Buscador y Vinculación de Relaciones en Tiempo Real

El sistema implementa un buscador asíncrono para añadir actores, géneros o plataformas al catálogo.

### Componente Frontend: `RelationSelector`
Un componente de combobox React que:
- Detecta cuando el usuario escribe al menos 2 letras (con "debounce" de 300ms para no saturar el servidor).
- Llama a la API `GET /api/admin/search/:type?q={query}`.
- Muestra una lista desplegable con los resultados obtenidos de la DB local.
- Al seleccionar uno, ejecuta una petición `POST /api/admin/movies/{id}/{relationType}` enviando el ID para vincular.

### Endpoints Backend
- `SearchNetworks`, `SearchGenres`, `SearchCasts`: Consultas SQL con `ILIKE` en PostgreSQL para encontrar nombres coincidentes.
- `handleAddRelation`: Un manejador genérico que dependiendo de los parámetros de ruta, llama a la instrucción SQL de inserción en la tabla pivote correspondiente (ej: `InsertMovieGenre`, `InsertMovieNetwork`).

## 4. Gestión Compleja de la Galería Extendida

Gemflix no guarda un solo póster, sino toda una biblioteca de recursos gráficos obtenidos desde TMDB y Fanart.tv.

1. **Clasificación**: Las imágenes se insertan en `media_images` con un `type` específico (`logo`, `poster`, `backdrop`, `clearart`, `tvthumb`).
2. **Visualización en Cuadrícula**: La pestaña "Galería" agrupa las imágenes por su `type`.
3. **Marcar como Principal**: En lugar de sobreescribir un campo en la tabla de películas, el sistema usa `media_images.is_main`. Al pulsar "Marcar Principal" sobre una imagen, se dispara el endpoint `PUT /api/admin/media-images/set-main`. Este actualiza todas las imágenes del mismo tipo a `false` y luego marca la elegida a `true`. Además, el backend detecta esto y copia la ruta de la imagen en los campos redundantes `main_poster` o `main_backdrop` de la película, para lecturas ultrarrápidas en la app de cara al usuario.
4. **Desvincular**: Las imágenes erróneas pueden eliminarse de la DB a través de `DELETE /api/admin/media-images/{image_id}`.

## Resumen de Rendimiento y UX

- **Single Page Application**: Al usar el App Router de Next.js y el combobox personalizado, la gestión del catálogo se siente instantánea.
- **Evitar Polling Excesivo**: La API solo trae lo necesario y permite búsquedas delegadas a PostgreSQL.
- **Typesafe**: Todo el trayecto de los datos, desde la DB (SQLc), al servidor backend (Structs de Go), a la red (JSON), y al frontend (Typescript) garantiza que el esquema se mantenga sólido, previniendo errores de casteo al editar grandes volúmenes de catálogo.
