---
description: Reglas estrictas para el modelado de bases de datos en Golang + PostgreSQL, eliminando anti-patrones de Laravel.
---

# Database Architecture Guidelines (Go + PostgreSQL)

Cuando interactúes con la base de datos de Gemflix, debes obedecer estrictamente los siguientes principios arquitectónicos, diseñados para un backend de alto rendimiento en Go, **alejándose por completo de las convenciones de frameworks dinámicos como Laravel**.

## 1. Prohibición Absoluta de Relaciones Polimórficas
En Laravel es común ver columnas como `model_type` y `model_id` (o `causer_type`/`causer_id`). **ESTO ESTÁ ESTRICTAMENTE PROHIBIDO EN ESTE PROYECTO.**
- **Por qué:** Destruye la integridad referencial (no puedes crear Foreign Keys reales), mata el rendimiento de los índices, y el tipado fuerte de Go hace que analizar `model_type` sea un desastre de *type assertions*.
- **La Solución en Go:** 
  - Si una tabla pertenece a un Usuario, usa `user_id BIGINT REFERENCES users(id)`.
  - Si necesitas registrar actividad genérica sobre tablas variables, usa columnas explícitas o guarda el contexto en un campo `JSONB`.

## 2. Tipado Fuerte e Integridad Referencial
- **Siempre usa Foreign Keys (`REFERENCES table(id)`)** combinadas con reglas de borrado lógicas (`ON DELETE CASCADE` o `ON DELETE SET NULL`).
- Si una columna guarda cantidades monetarias, usa `BIGINT` (representando centavos) en lugar de `DECIMAL` para evitar errores de precisión en Go, a menos que el módulo financiero exija `DECIMAL`.

## 3. Eliminación de Basura de Plugins de Laravel
Al refactorizar o crear tablas basadas en antiguos plugins de Laravel (Spatie, Filament, Bavix), debes auditar y **ELIMINAR** columnas que son exclusivas del framework PHP:
- **Spatie Activity Log:** Eliminar `batch_uuid`.
- **Filament Curator:** Eliminar `disk`, `visibility`, `curations`, `exif`. En un entorno Go Cloud-Native, los archivos se asumen en S3/GemDrive por defecto y no necesitan metadata de drivers de Laravel.
- **Bavix Wallet:** Eliminar `holder_type`/`holder_id`, cambiar por `user_id`.

## 4. Búsquedas Full-Text Nativas
No dependas de Scout, Algolia o Meilisearch para búsquedas básicas. Utiliza el motor nativo de PostgreSQL:
- **`TSVECTOR`:** Crea una columna generada `search_vector TSVECTOR GENERATED ALWAYS AS (...) STORED` y añade un índice `GIN(search_vector)`.

## 5. Migraciones y SQLC
- Cada vez que modifiques un esquema (archivo `.up.sql`), debes modificar su contraparte `.down.sql`.
- Inmediatamente después de modificar cualquier esquema, **siempre ejecuta `sqlc generate`** para asegurar que los modelos de Go se mantengan sincronizados con la base de datos.
- **Consolidación de Migraciones (Cero Parches):** Mantenemos una estructura de base de datos modular (Ej. `000001_core_auth`, `000004_billing_and_store`). Si necesitas agregar una columna a una tabla existente que fue creada en una de estas migraciones fundacionales, **no crees una nueva migración de "parche"** (e.g. `000010_add_priority_to_ads.up.sql`). En su lugar, edita directamente la migración fundacional original. Como el proyecto está en desarrollo (MVP), podemos reiniciar la DB (`migrate drop`) e insertar Data Seed nuevamente.

## 6. Sincronización Automática de Permisos
- El sistema de permisos en Gemflix (RBAC) está automatizado en el backend. Go escanea los middlewares en el archivo `server.go` (ej. `RequirePermissionChi("manage_users")`) y auto-sincroniza estos permisos en la base de datos al arrancar el servidor. No insertes permisos manuales en scripts de seeding.
