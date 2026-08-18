-- Company Email Settings runtime migration.
-- This file is intentionally staged and resumable. MySQL DDL may commit
-- implicitly; execute each stage through the deployment's SQL mechanism and
-- use company_email_migration_state to resume. The operator mirror is
-- specs/company-email-settings/pendiente.sql.

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET @migration_key = 'company-email-settings-v1';

CREATE TABLE IF NOT EXISTS company_email_migration_state (
  migration_key VARCHAR(100) NOT NULL,
  stage VARCHAR(40) NOT NULL DEFAULT 'pending',
  last_owner_id BIGINT NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  error_message TEXT NULL,
  PRIMARY KEY (migration_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO company_email_migration_state (migration_key, stage)
VALUES (@migration_key, 'pending')
ON DUPLICATE KEY UPDATE migration_key = VALUES(migration_key);

CREATE TABLE IF NOT EXISTS company_terms_versions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  owner_id BIGINT NOT NULL,
  version_number BIGINT NOT NULL,
  content_html LONGTEXT NOT NULL,
  content_hash CHAR(64) NOT NULL,
  published_at DATETIME NOT NULL,
  published_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_terms_version (owner_id, version_number),
  UNIQUE KEY uq_company_terms_hash (owner_id, content_hash),
  KEY idx_company_terms_owner (owner_id),
  CONSTRAINT fk_company_terms_owner FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_email_settings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  owner_id BIGINT NOT NULL,
  version BIGINT NOT NULL DEFAULT 1,
  welcome_message TEXT NULL,
  current_terms_version_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_email_settings_owner (owner_id),
  KEY idx_company_email_settings_terms (current_terms_version_id),
  CONSTRAINT fk_company_email_settings_owner FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_email_delivery_settings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  owner_id BIGINT NOT NULL,
  code VARCHAR(80) NOT NULL,
  audience VARCHAR(20) NOT NULL,
  `trigger` VARCHAR(80) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_email_delivery_code (owner_id, code),
  KEY idx_company_email_delivery_owner (owner_id),
  CONSTRAINT fk_company_email_delivery_owner FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_email_recipients (
  id BIGINT NOT NULL AUTO_INCREMENT,
  owner_id BIGINT NOT NULL,
  email VARCHAR(320) NOT NULL,
  normalized_email VARCHAR(320) NOT NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'manual',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_email_recipient (owner_id, normalized_email),
  CONSTRAINT fk_company_email_recipient_owner FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_email_report_sections (
  id BIGINT NOT NULL AUTO_INCREMENT,
  owner_id BIGINT NOT NULL,
  code VARCHAR(80) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_email_report_section (owner_id, code),
  CONSTRAINT fk_company_email_report_section_owner FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_email_settings_audit_events (
  id BIGINT NOT NULL AUTO_INCREMENT,
  owner_id BIGINT NOT NULL,
  actor_user_id BIGINT NULL,
  action VARCHAR(80) NOT NULL,
  outcome VARCHAR(20) NOT NULL,
  reason_code VARCHAR(80) NULL,
  settings_version_before BIGINT NULL,
  settings_version_after BIGINT NULL,
  terms_version_before BIGINT NULL,
  terms_version_after BIGINT NULL,
  changed_codes JSON NULL,
  content_hash_before CHAR(64) NULL,
  content_hash_after CHAR(64) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_company_email_audit_owner (owner_id, created_at),
  CONSTRAINT fk_company_email_audit_owner FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @add_terms_version_sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE disclaimer_firmas ADD COLUMN terms_version_id BIGINT NULL AFTER id_empresa',
    'SELECT 1')
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'disclaimer_firmas' AND COLUMN_NAME = 'terms_version_id'
);
PREPARE add_terms_version_stmt FROM @add_terms_version_sql;
EXECUTE add_terms_version_stmt;
DEALLOCATE PREPARE add_terms_version_stmt;

UPDATE company_email_migration_state
SET stage = 'schema_ready', error_message = NULL, updated_at = CURRENT_TIMESTAMP
WHERE migration_key = @migration_key AND stage IN ('pending', 'schema_ready');

-- Owner stage: one transaction per owner, with progress advanced only after
-- commit. Every statement is idempotent so an interrupted owner can be safely
-- retried from its owner key.
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_company_email_runtime_backfill$$
CREATE PROCEDURE sp_company_email_runtime_backfill()
BEGIN
  DECLARE v_done BOOLEAN DEFAULT FALSE;
  DECLARE v_owner_id BIGINT;
  DECLARE v_terms_id BIGINT;
  DECLARE v_terms_content LONGTEXT;
  DECLARE owner_cursor CURSOR FOR
    SELECT id FROM sis_propietarios
    WHERE id > COALESCE((SELECT last_owner_id FROM company_email_migration_state WHERE migration_key = @migration_key), 0)
    ORDER BY id ASC;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    UPDATE company_email_migration_state
    SET error_message = 'runtime owner backfill failed; rerun the current stage', updated_at = CURRENT_TIMESTAMP
    WHERE migration_key = @migration_key;
    RESIGNAL;
  END;

  OPEN owner_cursor;
  owner_loop: LOOP
    FETCH owner_cursor INTO v_owner_id;
    IF v_done THEN LEAVE owner_loop; END IF;
    START TRANSACTION;

    SET v_terms_content = REPLACE(REPLACE(REPLACE(
      COALESCE((SELECT texto_disclaimer FROM sis_propietarios WHERE id = v_owner_id), ''),
      '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
    INSERT INTO company_terms_versions (owner_id, version_number, content_html, content_hash, published_at, published_by)
    VALUES (v_owner_id, 1, v_terms_content, SHA2(v_terms_content, 256), CURRENT_TIMESTAMP, NULL)
    ON DUPLICATE KEY UPDATE owner_id = VALUES(owner_id);
    SELECT id INTO v_terms_id FROM company_terms_versions WHERE owner_id = v_owner_id AND version_number = 1;

    INSERT INTO company_email_settings (owner_id, version, welcome_message, current_terms_version_id)
    VALUES (v_owner_id, 1, NULL, v_terms_id)
    ON DUPLICATE KEY UPDATE current_terms_version_id = COALESCE(company_email_settings.current_terms_version_id, VALUES(current_terms_version_id));

    INSERT INTO company_email_delivery_settings (owner_id, code, audience, `trigger`, enabled)
    VALUES
      (v_owner_id, 'admin_license_created', 'admin', 'license_created', TRUE),
      (v_owner_id, 'employee_license_status_changed', 'employee', 'license_status_changed', TRUE),
      (v_owner_id, 'employee_document_signed', 'employee', 'document_signed', TRUE),
      (v_owner_id, 'admin_document_signed', 'admin', 'document_signed', TRUE),
      (v_owner_id, 'employee_terms_reminder', 'employee', 'terms_reminder', TRUE),
      (v_owner_id, 'admin_daily_report', 'admin', 'daily_report', TRUE),
      (v_owner_id, 'employee_daily_reminder', 'employee', 'daily_reminder', TRUE),
      (v_owner_id, 'employee_document_assigned', 'employee', 'document_assigned', TRUE),
      (v_owner_id, 'requester_document_manual', 'requester', 'document_manual', TRUE)
    ON DUPLICATE KEY UPDATE audience = VALUES(audience), `trigger` = VALUES(`trigger`);

    INSERT INTO company_email_report_sections (owner_id, code, enabled)
    VALUES
      (v_owner_id, 'statistical_summary', TRUE),
      (v_owner_id, 'employees_on_leave_today', TRUE),
      (v_owner_id, 'pending_licenses', TRUE),
      (v_owner_id, 'unsigned_documents', TRUE),
      (v_owner_id, 'pending_terms_acceptance', TRUE),
      (v_owner_id, 'upcoming_vacations', TRUE),
      (v_owner_id, 'expiring_licenses', TRUE)
    ON DUPLICATE KEY UPDATE code = VALUES(code);

    INSERT INTO company_email_recipients (owner_id, email, normalized_email, source)
    SELECT DISTINCT u.id_propietario, TRIM(u.email), LOWER(TRIM(u.email)), 'backfill'
    FROM usuarios u JOIN usuarios_roles ur ON ur.id_usuario = u.id
    WHERE ur.id_rol = 1 AND u.id_propietario = v_owner_id
      AND NULLIF(TRIM(u.email), '') IS NOT NULL
      AND LOWER(TRIM(u.email)) REGEXP '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    ON DUPLICATE KEY UPDATE owner_id = VALUES(owner_id);

    INSERT INTO company_email_settings_audit_events (owner_id, actor_user_id, action, outcome, metadata)
    SELECT v_owner_id, NULL, 'migration_backfill', 'accepted', JSON_OBJECT('source', 'runtime', 'terms_version', 1)
    WHERE NOT EXISTS (
      SELECT 1 FROM company_email_settings_audit_events
      WHERE owner_id = v_owner_id AND action = 'migration_backfill'
    );
    COMMIT;
    UPDATE company_email_migration_state SET last_owner_id = v_owner_id, error_message = NULL, updated_at = CURRENT_TIMESTAMP WHERE migration_key = @migration_key;
  END LOOP;
  CLOSE owner_cursor;
  UPDATE company_email_migration_state SET stage = 'owners_backfilled', updated_at = CURRENT_TIMESTAMP WHERE migration_key = @migration_key AND stage IN ('schema_ready', 'owners_backfilled');
END$$
DELIMITER ;
CALL sp_company_email_runtime_backfill();
DROP PROCEDURE sp_company_email_runtime_backfill;

UPDATE disclaimer_firmas f
JOIN company_terms_versions t ON t.owner_id = f.id_empresa AND t.version_number = 1
SET f.terms_version_id = t.id
WHERE f.terms_version_id IS NULL;

-- Run only after the acceptance linkage validation returns zero rows.
SELECT COUNT(*) AS acceptances_without_terms_version
FROM disclaimer_firmas
WHERE terms_version_id IS NULL;

UPDATE company_email_migration_state
SET stage = 'acceptances_linked', updated_at = CURRENT_TIMESTAMP
WHERE migration_key = @migration_key AND stage IN ('owners_backfilled', 'acceptances_linked');

-- Enter the resumable constraints stage before running any DDL. If a
-- constraint operation or a later validation fails, the state remains here
-- and the script can be rerun after the data is repaired.
UPDATE company_email_migration_state
SET stage = 'constraints_hardened', error_message = NULL, updated_at = CURRENT_TIMESTAMP
WHERE migration_key = @migration_key AND stage IN ('acceptances_linked', 'constraints_hardened');

SET @drop_legacy_unique_sql = (
  SELECT IF(COUNT(*) > 0, 'ALTER TABLE disclaimer_firmas DROP INDEX uq_usuario_empresa', 'SELECT 1')
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'disclaimer_firmas' AND INDEX_NAME = 'uq_usuario_empresa'
);
PREPARE drop_legacy_unique_stmt FROM @drop_legacy_unique_sql;
EXECUTE drop_legacy_unique_stmt;
DEALLOCATE PREPARE drop_legacy_unique_stmt;

SET @add_version_unique_sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE disclaimer_firmas ADD UNIQUE KEY uq_usuario_empresa_version (id_usuario, id_empresa, terms_version_id)',
    'SELECT 1')
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'disclaimer_firmas' AND INDEX_NAME = 'uq_usuario_empresa_version'
);
PREPARE add_version_unique_stmt FROM @add_version_unique_sql;
EXECUTE add_version_unique_stmt;
DEALLOCATE PREPARE add_version_unique_stmt;

SET @acceptance_constraint_failures = (
  SELECT COUNT(*)
  FROM disclaimer_firmas f
  LEFT JOIN company_terms_versions t
    ON t.id = f.terms_version_id
   AND t.owner_id = f.id_empresa
   AND t.version_number = 1
  WHERE t.id IS NULL
);

SET @add_terms_fk_sql = (
  SELECT IF(
    COUNT(*) = 0 AND @acceptance_constraint_failures = 0,
    'ALTER TABLE disclaimer_firmas ADD CONSTRAINT fk_disclaimer_terms_version FOREIGN KEY (terms_version_id) REFERENCES company_terms_versions(id)',
    'SELECT 1'
  )
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'disclaimer_firmas'
    AND CONSTRAINT_NAME = 'fk_disclaimer_terms_version'
);
PREPARE add_terms_fk_stmt FROM @add_terms_fk_sql;
EXECUTE add_terms_fk_stmt;
DEALLOCATE PREPARE add_terms_fk_stmt;

-- Do not harden the column until every acceptance is linked to its owner'
-- imported version 1. A failed precondition is reported by final validation
-- and leaves the migration in constraints_hardened for a later retry.
SET @harden_terms_version_sql = IF(
  @acceptance_constraint_failures = 0,
  'ALTER TABLE disclaimer_firmas MODIFY COLUMN terms_version_id BIGINT NOT NULL',
  'SELECT 1'
);
PREPARE harden_terms_version_stmt FROM @harden_terms_version_sql;
EXECUTE harden_terms_version_stmt;
DEALLOCATE PREPARE harden_terms_version_stmt;

SET @add_settings_terms_fk_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE company_email_settings ADD CONSTRAINT fk_company_email_settings_terms FOREIGN KEY (current_terms_version_id) REFERENCES company_terms_versions(id)',
    'SELECT 1'
  )
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'company_email_settings'
    AND CONSTRAINT_NAME = 'fk_company_email_settings_terms'
);
PREPARE add_settings_terms_fk_stmt FROM @add_settings_terms_fk_sql;
EXECUTE add_settings_terms_fk_stmt;
DEALLOCATE PREPARE add_settings_terms_fk_stmt;

-- Final validation is intentionally performed before completion. It covers
-- the hardened constraints, ownership, hashes, expected catalog/section
-- codes, counts, recipient normalization and acceptance linkage.
DROP TEMPORARY TABLE IF EXISTS tmp_expected_company_email_codes;
CREATE TEMPORARY TABLE tmp_expected_company_email_codes (
  code VARCHAR(80) NOT NULL PRIMARY KEY
) ENGINE=Memory;

INSERT INTO tmp_expected_company_email_codes (code)
VALUES
  ('admin_license_created'),
  ('employee_license_status_changed'),
  ('employee_document_signed'),
  ('admin_document_signed'),
  ('employee_terms_reminder'),
  ('admin_daily_report'),
  ('employee_daily_reminder'),
  ('employee_document_assigned'),
  ('requester_document_manual');

DROP TEMPORARY TABLE IF EXISTS tmp_expected_company_email_sections;
CREATE TEMPORARY TABLE tmp_expected_company_email_sections (
  code VARCHAR(80) NOT NULL PRIMARY KEY
) ENGINE=Memory;

INSERT INTO tmp_expected_company_email_sections (code)
VALUES
  ('statistical_summary'),
  ('employees_on_leave_today'),
  ('pending_licenses'),
  ('unsigned_documents'),
  ('pending_terms_acceptance'),
  ('upcoming_vacations'),
  ('expiring_licenses');

DROP TEMPORARY TABLE IF EXISTS tmp_company_email_migration_validation;
CREATE TEMPORARY TABLE tmp_company_email_migration_validation (
  failure_count BIGINT NOT NULL
) ENGINE=Memory;

INSERT INTO tmp_company_email_migration_validation (failure_count)
SELECT
    (
      SELECT COUNT(*) = 0
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'disclaimer_firmas'
        AND CONSTRAINT_NAME = 'fk_disclaimer_terms_version'
        AND COLUMN_NAME = 'terms_version_id'
        AND REFERENCED_TABLE_NAME = 'company_terms_versions'
        AND REFERENCED_COLUMN_NAME = 'id'
    )
  + (
      SELECT COUNT(*)
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'disclaimer_firmas'
        AND COLUMN_NAME = 'terms_version_id'
        AND IS_NULLABLE <> 'NO'
    )
  + (
      SELECT COUNT(*) = 0
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'company_email_settings'
        AND CONSTRAINT_NAME = 'fk_company_email_settings_terms'
        AND COLUMN_NAME = 'current_terms_version_id'
        AND REFERENCED_TABLE_NAME = 'company_terms_versions'
        AND REFERENCED_COLUMN_NAME = 'id'
    )
  + (
      SELECT COUNT(*)
      FROM company_email_delivery_settings d
      LEFT JOIN sis_propietarios o ON o.id = d.owner_id
      WHERE o.id IS NULL
    )
  + (
      SELECT COUNT(*)
      FROM company_email_report_sections s
      LEFT JOIN sis_propietarios o ON o.id = s.owner_id
      WHERE o.id IS NULL
    )
  + (
      SELECT COUNT(*)
      FROM company_email_recipients r
      LEFT JOIN sis_propietarios o ON o.id = r.owner_id
      WHERE o.id IS NULL
    )
  + (
      SELECT COUNT(*)
      FROM company_email_settings s
      LEFT JOIN sis_propietarios o ON o.id = s.owner_id
      WHERE o.id IS NULL
    )
  + (
      SELECT COUNT(*)
      FROM company_terms_versions t
      LEFT JOIN sis_propietarios o ON o.id = t.owner_id
      WHERE o.id IS NULL
    )
  + (
      SELECT COUNT(*)
      FROM (
        SELECT o.id
        FROM sis_propietarios o
        WHERE (
          SELECT COUNT(*)
          FROM company_email_delivery_settings d
          WHERE d.owner_id = o.id
        ) <> 9
        OR (
          SELECT COUNT(*)
          FROM tmp_expected_company_email_codes e
          JOIN company_email_delivery_settings d
            ON d.owner_id = o.id
           AND d.code = e.code
        ) <> 9
      ) delivery_failures
    )
  + (
      SELECT COUNT(*)
      FROM (
        SELECT o.id
        FROM sis_propietarios o
        WHERE (
          SELECT COUNT(*)
          FROM company_email_report_sections s
          WHERE s.owner_id = o.id
        ) <> 7
        OR (
          SELECT COUNT(*)
          FROM tmp_expected_company_email_sections e
          JOIN company_email_report_sections s
            ON s.owner_id = o.id
           AND s.code = e.code
        ) <> 7
      ) section_failures
    )
  + (
      SELECT COUNT(*)
      FROM (
        SELECT owner_id, normalized_email
        FROM company_email_recipients
        GROUP BY owner_id, normalized_email
        HAVING COUNT(*) > 1
      ) recipient_failures
    )
  + (
      SELECT COUNT(*)
      FROM disclaimer_firmas f
      LEFT JOIN company_terms_versions t
        ON t.id = f.terms_version_id
       AND t.owner_id = f.id_empresa
       AND t.version_number = 1
      WHERE t.id IS NULL
    )
  + (
      SELECT COUNT(*)
      FROM company_email_recipients
      WHERE email <> TRIM(email)
         OR normalized_email <> LOWER(TRIM(email))
         OR normalized_email NOT REGEXP '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$'
    )
  + (
      SELECT COUNT(*)
      FROM sis_propietarios o
      LEFT JOIN company_terms_versions t
        ON t.owner_id = o.id
       AND t.version_number = 1
      LEFT JOIN company_email_settings s ON s.owner_id = o.id
      WHERE t.id IS NULL
         OR t.content_hash <> SHA2(t.content_html, 256)
         OR s.current_terms_version_id IS NULL
         OR s.current_terms_version_id <> t.id
    )
  + (
      SELECT COUNT(*)
      FROM sis_propietarios o
      LEFT JOIN company_email_settings s ON s.owner_id = o.id
      WHERE s.id IS NULL
    );

SELECT @migration_validation_failures := failure_count
FROM tmp_company_email_migration_validation;

UPDATE company_email_migration_state
SET error_message = IF(
  @migration_validation_failures = 0,
  NULL,
  CONCAT('migration validation failed: ', @migration_validation_failures, ' failure(s); rerun after repair')
), updated_at = CURRENT_TIMESTAMP
WHERE migration_key = @migration_key AND stage = 'constraints_hardened';

UPDATE company_email_migration_state
SET stage = 'completed', completed_at = CURRENT_TIMESTAMP, error_message = NULL, updated_at = CURRENT_TIMESTAMP
WHERE migration_key = @migration_key
  AND stage = 'constraints_hardened'
  AND @migration_validation_failures = 0;

DROP TEMPORARY TABLE tmp_company_email_migration_validation;
DROP TEMPORARY TABLE tmp_expected_company_email_sections;
DROP TEMPORARY TABLE tmp_expected_company_email_codes;

SELECT *
FROM company_email_migration_state
WHERE migration_key = @migration_key;
