-- Revertir Migración Fase 7: Ecosistema Jellyfin

DROP TABLE IF EXISTS jellyfin.plan_rules CASCADE;
DROP TABLE IF EXISTS jellyfin.users CASCADE;
DROP TABLE IF EXISTS jellyfin.servers CASCADE;
