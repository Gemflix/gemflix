DROP TABLE IF EXISTS oauth_providers;

-- Restaurar el requerimiento de contraseña (fallará si hay usuarios sin contraseña, lo cual es esperado en un down completo)
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
