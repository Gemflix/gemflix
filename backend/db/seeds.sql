-- Inyección de Datos Iniciales (Seeders)

-- 1. Insertar Usuario Super Admin
INSERT INTO users (id, name, email, password_hash)
VALUES (
    1, 'Joseph (Super Admin)', 'admin@gemflix.com', 
    '$2a$12$DUMMYHASHDUMMYHASHDUMMYHASHDUMMYHASHDUMMYHASHDUMMYH'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, name, email, password_hash)
VALUES (
    2, 'Cliente Premium', 'cliente@gemflix.com', 
    '$2a$12$DUMMYHASHDUMMYHASHDUMMYHASHDUMMYHASHDUMMYHASHDUMMYH'
) ON CONFLICT (email) DO NOTHING;


-- 2. Insertar Películas de Prueba
INSERT INTO movies (id, slug, original_name, title_lat, release_date, runtime, views, active)
VALUES (
    1, 'the-matrix', 'The Matrix', 'The Matrix (PostgreSQL)', '1999-03-31', 136, 1500000, true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO movies (id, slug, original_name, title_lat, release_date, runtime, views, active)
VALUES (
    2, 'inception', 'Inception', 'Inception (Golang Edition)', '2010-07-16', 148, 950000, true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO movies (id, slug, original_name, title_lat, release_date, runtime, views, active)
VALUES (
    3, 'interstellar', 'Interstellar', 'Interstellar', '2014-11-05', 169, 2500000, false
) ON CONFLICT (slug) DO NOTHING;

-- Resetear secuencias para evitar errores en futuras inserciones
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('movies_id_seq', (SELECT MAX(id) FROM movies));
