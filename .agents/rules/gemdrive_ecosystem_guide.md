# GemDrive Ecosystem Guide (Legacy Laravel Port)

This rule defines the architecture and mandatory behavior for implementing the "GemDrive" (Drive IT Infrastructure) ecosystem in the Next.js/Go stack, ported directly from the legacy Laravel (JMPLAY) Filament project. 

**MANDATORY:** Any agent working on the `drive` module (either in `backend` or `frontend/src/app/admin`) MUST strictly follow this structure. No patches, no shortcuts.

## 1. Drive Service Accounts (Identidades Google)
- **Purpose:** Manages authentication identities used to connect to Google Drive.
- **Fields & Forms:**
  - `name`: Administrative name.
  - `email`: Personal/Workspace account or `client_email` of a Service Account.
  - `account_type`: Enum (Personal OAuth, Workspace OAuth, Google Service Account/Bot).
  - `credential_source`: DB Encrypted (Recommended) or ENV (Bootstrap).
  - `refresh_token` / `service_account_json`: Write-only credential fields.
  - `quota_limit_gib`: Internal quota limit to reserve space and rotate identities (default 600 GiB).
  - `warning_percent`: Warning threshold (default 80%).
- **State Tracking:** `daily_bytes_used`, `reserved_bytes`, `cooldown_until`, `last_error_code`.

## 2. Drive Sources (Fuentes de Catálogo)
- **Purpose:** Root Google Drive folders treated as read-only. The system indexes metadata from these folders. It NEVER modifies original files.
- **Fields & Forms:**
  - `name`: Administrative name (e.g. "Team Drive Películas Premium").
  - `virtual_folder`: Virtual mapped folder (e.g. "Películas").
  - `drive_type`: External Shared Folder (1), External Shared Drive (2), Managed Shared Drive (3).
  - `folder_id`: 191-char alphanumeric ID of the root folder.
  - `shared_drive_id`: Required for types 2 and 3 (supports `corpora=drive` searches).
  - `sync_mode`:
    - `FULL`: Authoritative complete rebuild.
    - `DELTA`: Uses Google Drive Changes API.
    - `APPEND`: Adds/updates without deactivating missing items.

## 3. Drive Replica Targets (GemReplicas)
- **Purpose:** Controlled Shared Drives where the system creates temporary copies (Replicas) for streaming and downloading. It is NOT a source.
- **Fields & Forms:**
  - `name`: Default "GemReplicas".
  - `shared_drive_id`.
  - `streaming_folder_id`: For Premium Streaming temporary copies.
  - `gemdrive_folder_id`: For GemDrive playback/downloads.
  - `recovery_folder_id`: Copies for incidents.
  - `priority`: Higher number = higher priority.
  - `health_status`: Operational status (unknown, healthy, warning, failed).

## 4. Drive Sync Monitor
- **Purpose:** Admin Dashboard to monitor the background Go Worker.
- **Metrics Required:**
  - Active Sources (`active_sources`).
  - Running Syncs (`running_syncs`).
  - Completed Syncs (`completed_syncs`).
  - Failed Syncs (`failed_syncs`).
  - Last Files Found (`last_files`).

## 5. Cloudflare Edge Worker Integration (`drive.gemflix.org`)
- **Purpose:** `drive.gemflix.org` is a Cloudflare Worker handling video streaming and downloads. It is NOT a user-facing Next.js web app.
- **Go Backend Requirements:** The backend must expose the following API endpoints authenticated by a shared secret (`X-Worker-Secret`) for the Worker to consume:
  1. `POST /api/drive/worker/validate-ticket`: Replaces the legacy `STORAGE_VALIDATE_URL`. Validates access tickets (JWT/tokens) and returns access instructions.
  2. `POST /api/drive/worker/origin-credentials`: Replaces `STORAGE_ORIGIN_URL`. Resolves and returns temporary Google Drive OAuth credentials based on the ticket.
  3. `POST /api/drive/worker/security-event`: Replaces `LARAVEL_SECURITY_URL`. Logs security anomalies (e.g., unauthorized IPs, invalid ranges).

## Implementation Constraints
- **Workers:** Background syncs and replica operations are handled by the Go worker daemon. The Next.js frontend is purely an interface to interact with the Postgres Database and Go API.
- **No Test Files:** Do NOT create `*.test.tsx`, `*.spec.ts`, or `*_test.go` files in the repository. Do not leave compiled binaries or download traces. Keep the repository 100% clean.
- **Database:** Do not create manual SQL patches for tables that already exist. Use the established `sqlc` pipeline.

## 6. Environment Variables and Secrets (Rules)
- **Go Backend (`compose.yaml` or Komodo):**
  - Needs `DRIVE_WORKER_SECRET` to authenticate incoming requests from the Cloudflare Worker.
  - Needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to perform OAuth Refresh Token exchanges for the Personal/Workspace identities stored in the database.
  - Optional: `GOOGLE_DRIVE_BOOTSTRAP_EMAIL` and `GOOGLE_DRIVE_BOOTSTRAP_REFRESH_TOKEN` for initial bootstrapping without DB records.
  - *Note:* It does NOT need Cloudflare API Tokens (`CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`) unless explicitly building a cache-purge feature.

- **Cloudflare Edge Worker (Cloudflare Dashboard):**
  - `DRIVE_WORKER_SECRET`: The shared secret matching the backend.
  - `STORAGE_VALIDATE_URL`: Points to `https://api.gemflix.org/api/drive/worker/validate-ticket`.
  - `STORAGE_ORIGIN_URL`: Points to `https://api.gemflix.org/api/drive/worker/origin-credentials`.
  - `SECURITY_EVENT_URL` (optional): Points to `https://api.gemflix.org/api/drive/worker/security-event`.
