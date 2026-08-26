-- Revertir Migración Fase 5: Esquemas del Ecosistema y Facturación

DROP TABLE IF EXISTS billing.subscriptions CASCADE;
DROP TABLE IF EXISTS billing.plan_prices CASCADE;
DROP TABLE IF EXISTS billing.plans CASCADE;

-- Eliminación opcional de esquemas (solo si están vacíos)
DROP SCHEMA IF EXISTS billing CASCADE;
DROP SCHEMA IF EXISTS drive CASCADE;
DROP SCHEMA IF EXISTS jellyfin CASCADE;
