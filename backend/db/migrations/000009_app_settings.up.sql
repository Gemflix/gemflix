CREATE TABLE app_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configuración por defecto
INSERT INTO app_settings (key, value, description) VALUES
('login_background', 'https://image.tmdb.org/t/p/original/rweIrveL43TaxUN0akQEaAXL6x0.jpg', 'Fondo de pantalla del Login'),
('logo_main', '', 'Ruta del logo principal'),
('logo_secondary', '', 'Ruta del logo secundario (icono)'),
('favicon', '', 'Ruta del Favicon'),
('drive_worker_url', '', 'URL del Worker Edge de Cloudflare');
