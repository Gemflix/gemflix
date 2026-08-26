-- Revertir Migración Inicial: Core Auth

DROP TABLE IF EXISTS login_codes CASCADE;
DROP TABLE IF EXISTS personal_access_tokens CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS profile_parental_controls CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
