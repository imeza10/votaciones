-- Sistema Electoral Colombia - Database Schema
-- Ejecutar este script para crear la base de datos y tablas

CREATE DATABASE IF NOT EXISTS electoral_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE electoral_db;

-- 1. Tenants (Multi-tenant)
CREATE TABLE tenants (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    configuracion JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Departamentos
CREATE TABLE departamentos (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Municipios
CREATE TABLE municipios (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    departamento_id INT UNSIGNED NOT NULL,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    INDEX idx_departamento (departamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Barrios
CREATE TABLE barrios (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    municipio_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    comuna VARCHAR(100),
    zona ENUM('urbana', 'rural') DEFAULT 'urbana',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (municipio_id) REFERENCES municipios(id) ON DELETE CASCADE,
    INDEX idx_municipio (municipio_id),
    INDEX idx_comuna (comuna)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Candidatos
CREATE TABLE candidatos (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL,
    tipo_candidatura ENUM('senado', 'camara', 'alcalde', 'gobernador', 'concejal', 'otro') NOT NULL,
    partido_politico VARCHAR(255),
    departamento_id INT UNSIGNED NOT NULL,
    municipio_id INT UNSIGNED NOT NULL,
    foto VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id),
    FOREIGN KEY (municipio_id) REFERENCES municipios(id),
    INDEX idx_tenant_activo (tenant_id, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Usuarios
CREATE TABLE usuarios (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT UNSIGNED NOT NULL,
    candidato_id BIGINT UNSIGNED,
    coordinador_id BIGINT UNSIGNED NULL,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    documento VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    rol ENUM('superadmin', 'admin_candidato', 'coordinador', 'lider', 'digitador', 'transportador') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE,
    FOREIGN KEY (coordinador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    UNIQUE KEY unique_documento_tenant (documento, tenant_id),
    INDEX idx_tenant_rol (tenant_id, rol),
    INDEX idx_coordinador (coordinador_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Lugares de Votación
CREATE TABLE lugares_votacion (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    municipio_id INT UNSIGNED NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(500) NOT NULL,
    direccion VARCHAR(500),
    barrio_id INT UNSIGNED,
    zona ENUM('urbana', 'rural') DEFAULT 'urbana',
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    total_mesas INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (municipio_id) REFERENCES municipios(id) ON DELETE CASCADE,
    FOREIGN KEY (barrio_id) REFERENCES barrios(id) ON DELETE SET NULL,
    INDEX idx_municipio (municipio_id),
    FULLTEXT INDEX ft_nombre_direccion (nombre, direccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Votantes
CREATE TABLE votantes (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT UNSIGNED NOT NULL,
    candidato_id BIGINT UNSIGNED NOT NULL,
    lider_id BIGINT UNSIGNED,
    coordinador_id BIGINT UNSIGNED,
    documento VARCHAR(50) NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(500),
    departamento_id INT UNSIGNED NOT NULL,
    municipio_id INT UNSIGNED NOT NULL,
    barrio_id INT UNSIGNED,
    comuna VARCHAR(100),
    lugar_votacion_id BIGINT UNSIGNED,
    mesa VARCHAR(10),
    zona ENUM('urbana', 'rural') DEFAULT 'urbana',
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    es_jurado BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE,
    FOREIGN KEY (lider_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (coordinador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (lugar_votacion_id) REFERENCES lugares_votacion(id) ON DELETE SET NULL,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id),
    FOREIGN KEY (municipio_id) REFERENCES municipios(id),
    FOREIGN KEY (barrio_id) REFERENCES barrios(id) ON DELETE SET NULL,
    UNIQUE KEY unique_documento_tenant (documento, tenant_id),
    INDEX idx_tenant_candidato (tenant_id, candidato_id),
    INDEX idx_lider (lider_id),
    INDEX idx_coordinador (coordinador_id),
    INDEX idx_lugar_votacion (lugar_votacion_id),
    INDEX idx_municipio (municipio_id),
    INDEX idx_barrio (barrio_id),
    FULLTEXT INDEX ft_nombres_apellidos (nombres, apellidos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Confirmación de Votos
CREATE TABLE confirmacion_votos (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    votante_id BIGINT UNSIGNED NOT NULL,
    voto BOOLEAN DEFAULT FALSE,
    hora_confirmacion TIMESTAMP NULL,
    confirmado_por_id BIGINT UNSIGNED,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (votante_id) REFERENCES votantes(id) ON DELETE CASCADE,
    FOREIGN KEY (confirmado_por_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    UNIQUE KEY unique_votante (votante_id),
    INDEX idx_voto (voto),
    INDEX idx_hora (hora_confirmacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Auditoría
CREATE TABLE auditoria (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT UNSIGNED,
    usuario_id BIGINT UNSIGNED,
    accion VARCHAR(100) NOT NULL,
    tabla VARCHAR(100),
    registro_id BIGINT UNSIGNED,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_tenant (tenant_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_accion (accion),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales: Insertar un tenant de ejemplo
INSERT INTO tenants (uuid, nombre, slug, activo) VALUES 
(UUID(), 'Sistema Electoral Demo', 'demo', TRUE);

-- Insertar usuario administrador de ejemplo (password: admin123)
-- Hash generado con: password_hash('admin123', PASSWORD_DEFAULT)
-- Ejecuta este PHP para generar un nuevo hash: echo password_hash('admin123', PASSWORD_DEFAULT);
INSERT INTO usuarios (tenant_id, nombre, apellidos, documento, email, password, rol, activo) VALUES 
(1, 'Admin', 'Sistema', '1102840654', 'admin@electoral.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin', TRUE);

-- Algunos departamentos principales de Colombia
INSERT INTO departamentos (codigo, nombre, region) VALUES
('05', 'Antioquia', 'Andina'),
('08', 'Atlántico', 'Caribe'),
('11', 'Bogotá D.C.', 'Andina'),
('13', 'Bolívar', 'Caribe'),
('19', 'Cauca', 'Pacífica'),
('25', 'Cundinamarca', 'Andina'),
('52', 'Nariño', 'Pacífica'),
('76', 'Valle del Cauca', 'Pacífica');

-- Algunos municipios principales
INSERT INTO municipios (departamento_id, codigo, nombre) VALUES
(1, '05001', 'Medellín'),
(2, '08001', 'Barranquilla'),
(3, '11001', 'Bogotá'),
(4, '13001', 'Cartagena'),
(8, '76001', 'Cali');
