-- ============================================================
-- Migration: Disclaimer / Aceptación de Términos
-- ============================================================

-- 1. Agregar columna de texto del disclaimer a la tabla de empresas
ALTER TABLE sis_propietarios
ADD COLUMN texto_disclaimer TEXT NULL
AFTER tema;

-- 2. Crear tabla de firmas del disclaimer
CREATE TABLE disclaimer_firmas (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  id_usuario  BIGINT       NOT NULL,
  id_empresa  BIGINT       NOT NULL,
  hash_prueba VARCHAR(128) NOT NULL COMMENT 'HMAC-SHA256(userId:timestamp, SECRET_KEY_BACK)',
  ip          VARCHAR(45)  NOT NULL,
  user_agent  VARCHAR(512) NULL,
  timestamp   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt  DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_empresa (id_usuario, id_empresa),
  INDEX idx_empresa (id_empresa),
  INDEX idx_usuario (id_usuario),
  CONSTRAINT fk_disclaimer_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_disclaimer_empresa
    FOREIGN KEY (id_empresa) REFERENCES sis_propietarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
