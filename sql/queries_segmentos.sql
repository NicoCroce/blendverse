-- ============================================================================
-- Queries para crear tablas de segmentación de usuarios
-- Base de datos: dev_macrogest
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabla: tipos_segmentos
-- Descripción: Almacena los segmentos concretos por propietario (multiempresa)
-- Ejemplos: "Centro de costos 123", "Departamento IT", "Convenio 456/2024"
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dev_macrogest.tipos_segmentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del segmento (ej: "Ventas", "IT", "Centro de costos 123")',
    id_propietario BIGINT NOT NULL COMMENT 'Propietario al que pertenece este segmento',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL,
    
    -- Foreign key a sis_propietarios
    CONSTRAINT fk_tipos_segmentos_propietario 
        FOREIGN KEY (id_propietario) 
        REFERENCES dev_macrogest.sis_propietarios(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Índice para búsqueda rápida por propietario
    INDEX idx_tipos_segmentos_propietario (id_propietario),
    
    -- Índice para búsqueda por nombre dentro de un propietario
    INDEX idx_tipos_segmentos_nombre_propietario (nombre, id_propietario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Segmentos disponibles por propietario para filtrar usuarios';

-- ----------------------------------------------------------------------------
-- Tabla: usuarios_segmentos
-- Descripción: Relación n a n entre usuarios y segmentos
-- Un usuario puede tener múltiples segmentos de diferentes tipos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dev_macrogest.usuarios_segmentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL COMMENT 'Usuario asociado al segmento',
    id_segmento BIGINT NOT NULL COMMENT 'Segmento asignado al usuario',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL,
    
    -- Foreign keys
    CONSTRAINT fk_usuarios_segmentos_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES dev_macrogest.usuarios(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_usuarios_segmentos_segmento 
        FOREIGN KEY (id_segmento) 
        REFERENCES dev_macrogest.tipos_segmentos(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Índices para búsqueda rápida
    INDEX idx_usuarios_segmentos_usuario (id_usuario),
    INDEX idx_usuarios_segmentos_segmento (id_segmento),
    
    -- Constraint único para evitar duplicados (un usuario no puede tener el mismo segmento dos veces)
    UNIQUE KEY uk_usuario_segmento (id_usuario, id_segmento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Relación n a n entre usuarios y segmentos para filtrado';

-- ============================================================================
-- Queries de ejemplo para insertar datos (comentar/descomentar según necesidad)
-- ============================================================================

-- Ejemplo: Crear segmentos para un propietario
-- INSERT INTO dev_macrogest.tipos_segmentos (nombre, id_propietario) VALUES 
--     ('Centro de costos 123', 1),
--     ('Departamento IT', 1),
--     ('Convenio 456/2024', 1),
--     ('Sección Ventas', 1),
--     ('Categoría Senior', 1);

-- Ejemplo: Asignar segmentos a un usuario
-- INSERT INTO dev_macrogest.usuarios_segmentos (id_usuario, id_segmento) VALUES 
--     (1, 1),  -- Usuario 1 tiene segmento "Centro de costos 123"
--     (1, 2),  -- Usuario 1 tiene segmento "Departamento IT"
--     (2, 3);  -- Usuario 2 tiene segmento "Convenio 456/2024"

-- ============================================================================
-- Queries de consulta útiles
-- ============================================================================

-- Consultar todos los segmentos de un propietario
-- SELECT * FROM dev_macrogest.tipos_segmentos 
-- WHERE id_propietario = 1 AND deletedAt IS NULL;

-- Consultar segmentos asignados a un usuario
-- SELECT ts.id, ts.nombre, ts.id_propietario
-- FROM dev_macrogest.tipos_segmentos ts
-- INNER JOIN dev_macrogest.usuarios_segmentos us ON ts.id = us.id_segmento
-- WHERE us.id_usuario = 1 AND us.deletedAt IS NULL AND ts.deletedAt IS NULL;

-- Consultar usuarios que tienen un segmento específico
-- SELECT u.id, u.nombre, u.apellido, u.email
-- FROM dev_macrogest.usuarios u
-- INNER JOIN dev_macrogest.usuarios_segmentos us ON u.id = us.id_usuario
-- WHERE us.id_segmento = 1 AND us.deletedAt IS NULL AND u.deletedAt IS NULL;

-- Consultar usuarios con múltiples segmentos (filtrado combinado)
-- SELECT u.id, u.nombre, u.apellido, u.email, COUNT(DISTINCT us.id_segmento) as total_segmentos
-- FROM dev_macrogest.usuarios u
-- INNER JOIN dev_macrogest.usuarios_segmentos us ON u.id = us.id_usuario
-- WHERE us.id_segmento IN (1, 2, 3) 
--   AND us.deletedAt IS NULL 
--   AND u.deletedAt IS NULL
-- GROUP BY u.id, u.nombre, u.apellido, u.email
-- HAVING total_segmentos = 3;  -- Usuarios que tienen TODOS los segmentos filtrados
