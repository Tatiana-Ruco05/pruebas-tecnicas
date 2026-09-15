-- ============================================
-- APP PRUEBA - BASE DE DATOS
-- ============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'USER',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT usuarios_rol_check
        CHECK (rol IN ('ADMIN', 'USER'))
);

-- Tabla de notas
CREATE TABLE IF NOT EXISTS notas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL DEFAULT '',
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    posicion_x INTEGER NOT NULL DEFAULT 100,
    posicion_y INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT notas_estado_check
        CHECK (estado IN ('PENDIENTE', 'EN_CURSO', 'HECHO'))
);

