-- Migración Fase 10: Sistema Dinámico de Roles y Permisos (RBAC)

-- ==============================================
-- 1. ROLES
-- ==============================================
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL, -- ej: 'Super Admin', 'Editor Nivel 1'
    description TEXT,
    
    is_system BOOLEAN NOT NULL DEFAULT FALSE, -- Si es TRUE, no se puede borrar desde el panel
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 2. PERMISOS
-- ==============================================
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL, -- ej: 'create_movies', 'delete_users'
    group_name VARCHAR(255) NOT NULL,  -- ej: 'catalog', 'users', 'billing', 'drive'
    description TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 3. ROL_PERMISOS (Pivot)
-- ==============================================
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (role_id, permission_id)
);

-- ==============================================
-- 4. USUARIO_ROLES (Pivot para el Staff)
-- ==============================================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (user_id, role_id)
);


-- Inyectar Roles Base y Permisos Base para no empezar en blanco
INSERT INTO roles (id, name, description, is_system) VALUES 
(1, 'Super Admin', 'Acceso absoluto a todo el ecosistema.', true),
(2, 'Staff Básico', 'Acceso de lectura a las tablas principales.', false);

INSERT INTO permissions (name, group_name, description) VALUES
('manage_users', 'users', 'Crear, editar o borrar clientes.'),
('manage_staff', 'system', 'Asignar roles y permisos a empleados.'),
('manage_movies', 'catalog', 'Crear, editar o borrar películas.'),
('manage_series', 'catalog', 'Crear, editar o borrar series.'),
('manage_drive', 'ecosystems', 'Administrar sincronización de GemDrive.'),
('manage_jellyfin', 'ecosystems', 'Administrar servidores de Jellyfin.');

-- Asignar el Rol Super Admin se hará dinámicamente mediante el comando reset_admin


-- Ajustar la secuencia de roles
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
