-- Company Email Settings — operator migration
--
-- This file is intentionally kept under specs/ and is NOT auto-executed by the
-- application. The repository has no migration runner. Execute it manually
-- against a backup/copy first, then against the target database.
--
-- Recommended invocation:
--   mysql --defaults-extra-file=/secure/mysql.cnf --database=GESTDOC < pendiente.sql
--
-- The script is staged because MySQL DDL may commit implicitly. It is safe to
-- stop after a completed stage and resume from the next stage. Do not run the
-- final constraint stage until the validation queries report zero failures.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @migration_key = 'company-email-settings-v1';

-- ============================================================
-- 0. Preflight (read-only)
-- ============================================================

SELECT DATABASE() AS database_name;

SELECT TABLE_NAME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN (
    'sis_propietarios',
    'usuarios',
    'usuarios_roles',
    'disclaimer_firmas'
  )
ORDER BY TABLE_NAME;

SELECT COUNT(*) AS active_companies
FROM sis_propietarios;

SELECT COUNT(*) AS legacy_admin_emails
FROM usuarios AS u
JOIN usuarios_roles AS ur ON ur.id_usuario = u.id
WHERE ur.id_rol = 1
  AND u.id_propietario IS NOT NULL
  AND NULLIF(TRIM(u.email), '') IS NOT NULL;

-- Stop if the expected legacy tables are not present.
-- The statements below intentionally fail fast in that case.
SELECT id FROM sis_propietarios LIMIT 1;
SELECT id, id_propietario, email FROM usuarios LIMIT 1;
SELECT id_usuario, id_empresa FROM disclaimer_firmas LIMIT 1;

-- ============================================================
-- 1. Migration state and schema
-- ============================================================

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
  CONSTRAINT fk_company_terms_owner
    FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id)
    ON DELETE CASCADE
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
  CONSTRAINT fk_company_email_settings_owner
    FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id)
    ON DELETE CASCADE
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
  CONSTRAINT fk_company_email_delivery_owner
    FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id)
    ON DELETE CASCADE
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
  KEY idx_company_email_recipient_owner (owner_id),
  CONSTRAINT fk_company_email_recipient_owner
    FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id)
    ON DELETE CASCADE
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
  KEY idx_company_email_report_section_owner (owner_id),
  CONSTRAINT fk_company_email_report_section_owner
    FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id)
    ON DELETE CASCADE
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
  CONSTRAINT fk_company_email_audit_owner
    FOREIGN KEY (owner_id) REFERENCES sis_propietarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @add_terms_version_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE disclaimer_firmas ADD COLUMN terms_version_id BIGINT NULL AFTER id_empresa',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'disclaimer_firmas'
    AND COLUMN_NAME = 'terms_version_id'
);
PREPARE add_terms_version_stmt FROM @add_terms_version_sql;
EXECUTE add_terms_version_stmt;
DEALLOCATE PREPARE add_terms_version_stmt;

UPDATE company_email_migration_state
SET stage = 'schema_ready', error_message = NULL, updated_at = CURRENT_TIMESTAMP
WHERE migration_key = @migration_key
  AND stage IN ('pending', 'schema_ready');

-- ============================================================
-- 2. Backfill terms, settings, deliveries, sections and recipients
-- ============================================================

-- The procedure commits one owner at a time and advances last_owner_id only
-- after that owner's transaction succeeds. Legacy text is escaped so it cannot
-- execute as HTML during the transition; new content uses the application
-- sanitizer/allowlist.
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_company_email_backfill_owner_batches$$
CREATE PROCEDURE sp_company_email_backfill_owner_batches()
BEGIN
  DECLARE v_done BOOLEAN DEFAULT FALSE;
  DECLARE v_owner_id BIGINT;
  DECLARE v_terms_id BIGINT;
  DECLARE v_terms_content LONGTEXT;

  DECLARE owner_cursor CURSOR FOR
    SELECT id
    FROM sis_propietarios
    WHERE id > COALESCE(
      (
        SELECT last_owner_id
        FROM company_email_migration_state
        WHERE migration_key = @migration_key
      ),
      0
    )
    ORDER BY id ASC;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    UPDATE company_email_migration_state
    SET error_message = 'owner backfill failed; inspect the failing owner and rerun pendiente.sql',
        updated_at = CURRENT_TIMESTAMP
    WHERE migration_key = @migration_key;
    RESIGNAL;
  END;

  OPEN owner_cursor;

  owner_loop: LOOP
    FETCH owner_cursor INTO v_owner_id;
    IF v_done THEN
      LEAVE owner_loop;
    END IF;

    START TRANSACTION;

    SET v_terms_content = REPLACE(
      REPLACE(
        REPLACE(
          COALESCE(
            (SELECT texto_disclaimer FROM sis_propietarios WHERE id = v_owner_id),
            ''
          ),
          '&', '&amp;'
        ),
        '<', '&lt;'
      ),
      '>', '&gt;'
    );

    INSERT INTO company_terms_versions (
      owner_id, version_number, content_html, content_hash, published_at, published_by
    )
    VALUES (
      v_owner_id, 1, v_terms_content, SHA2(v_terms_content, 256), CURRENT_TIMESTAMP, NULL
    )
    ON DUPLICATE KEY UPDATE owner_id = VALUES(owner_id);

    SELECT id INTO v_terms_id
    FROM company_terms_versions
    WHERE owner_id = v_owner_id
      AND version_number = 1;

    INSERT INTO company_email_settings (
      owner_id, version, welcome_message, current_terms_version_id
    )
    VALUES (v_owner_id, 1, NULL, v_terms_id)
    ON DUPLICATE KEY UPDATE
      current_terms_version_id = COALESCE(
        company_email_settings.current_terms_version_id,
        VALUES(current_terms_version_id)
      );

    INSERT INTO company_email_delivery_settings
      (owner_id, code, audience, `trigger`, enabled)
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
    ON DUPLICATE KEY UPDATE
      audience = VALUES(audience),
      `trigger` = VALUES(`trigger`);

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

    INSERT INTO company_email_recipients
      (owner_id, email, normalized_email, source)
    SELECT DISTINCT
      u.id_propietario,
      TRIM(u.email),
      LOWER(TRIM(u.email)),
      'backfill'
    FROM usuarios AS u
    JOIN usuarios_roles AS ur ON ur.id_usuario = u.id
    WHERE ur.id_rol = 1
      AND u.id_propietario = v_owner_id
      AND NULLIF(TRIM(u.email), '') IS NOT NULL
      AND LOWER(TRIM(u.email)) REGEXP '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    ON DUPLICATE KEY UPDATE owner_id = VALUES(owner_id);

    INSERT INTO company_email_settings_audit_events
      (owner_id, actor_user_id, action, outcome, reason_code, metadata)
    SELECT v_owner_id, NULL, 'migration_backfill', 'accepted', NULL,
           JSON_OBJECT('source', 'pendiente.sql', 'terms_version', 1)
    WHERE NOT EXISTS (
      SELECT 1
      FROM company_email_settings_audit_events
      WHERE owner_id = v_owner_id
        AND action = 'migration_backfill'
    );

    COMMIT;

    UPDATE company_email_migration_state
    SET last_owner_id = v_owner_id,
        error_message = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE migration_key = @migration_key;
  END LOOP;

  CLOSE owner_cursor;

  UPDATE company_email_migration_state
  SET stage = 'owners_backfilled',
      error_message = NULL,
      updated_at = CURRENT_TIMESTAMP
  WHERE migration_key = @migration_key
    AND stage IN ('schema_ready', 'owners_backfilled');
END$$
DELIMITER ;

CALL sp_company_email_backfill_owner_batches();
DROP PROCEDURE sp_company_email_backfill_owner_batches;

-- ============================================================
-- 3. Link existing acceptances to imported terms version
-- ============================================================

UPDATE disclaimer_firmas AS f
JOIN company_terms_versions AS t
  ON t.owner_id = f.id_empresa
 AND t.version_number = 1
SET f.terms_version_id = t.id
WHERE f.terms_version_id IS NULL;

SELECT COUNT(*) AS acceptances_without_terms_version
FROM disclaimer_firmas
WHERE terms_version_id IS NULL;

UPDATE company_email_migration_state
SET stage = 'acceptances_linked',
    error_message = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE migration_key = @migration_key
  AND stage IN ('owners_backfilled', 'acceptances_linked');

-- ============================================================
-- 4. Harden acceptance constraints and foreign keys
-- ============================================================

SET @drop_legacy_unique_sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE disclaimer_firmas DROP INDEX uq_usuario_empresa',
    'SELECT 1'
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'disclaimer_firmas'
    AND INDEX_NAME = 'uq_usuario_empresa'
);
PREPARE drop_legacy_unique_stmt FROM @drop_legacy_unique_sql;
EXECUTE drop_legacy_unique_stmt;
DEALLOCATE PREPARE drop_legacy_unique_stmt;

SET @add_version_unique_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE disclaimer_firmas ADD UNIQUE KEY uq_usuario_empresa_version (id_usuario, id_empresa, terms_version_id)',
    'SELECT 1'
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'disclaimer_firmas'
    AND INDEX_NAME = 'uq_usuario_empresa_version'
);
PREPARE add_version_unique_stmt FROM @add_version_unique_sql;
EXECUTE add_version_unique_stmt;
DEALLOCATE PREPARE add_version_unique_stmt;

SET @add_terms_fk_sql = (
  SELECT IF(
    COUNT(*) = 0,
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

ALTER TABLE disclaimer_firmas
  MODIFY COLUMN terms_version_id BIGINT NOT NULL;

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

UPDATE company_email_migration_state
SET stage = 'constraints_hardened',
    error_message = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE migration_key = @migration_key
  AND stage IN ('acceptances_linked', 'constraints_hardened');

-- ============================================================
-- 5. Final validation and completion
-- ============================================================

SELECT owner_id, COUNT(*) AS delivery_count
FROM company_email_delivery_settings
GROUP BY owner_id
HAVING COUNT(*) <> 9;

SELECT owner_id, COUNT(*) AS section_count
FROM company_email_report_sections
GROUP BY owner_id
HAVING COUNT(*) <> 7;

SELECT owner_id, normalized_email, COUNT(*) AS duplicate_count
FROM company_email_recipients
GROUP BY owner_id, normalized_email
HAVING COUNT(*) > 1;

SELECT COUNT(*) AS invalid_acceptances
FROM disclaimer_firmas
WHERE terms_version_id IS NULL;

SELECT COUNT(*) AS missing_settings
FROM sis_propietarios AS o
LEFT JOIN company_email_settings AS s ON s.owner_id = o.id
WHERE s.id IS NULL;

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

CREATE TEMPORARY TABLE tmp_company_email_migration_validation (
  failure_count BIGINT NOT NULL
) ENGINE=Memory;

INSERT INTO tmp_company_email_migration_validation (failure_count)
SELECT
    (
      SELECT COUNT(*)
      FROM (
        SELECT o.id
        FROM sis_propietarios AS o
        WHERE (
          SELECT COUNT(*)
          FROM company_email_delivery_settings AS d
          WHERE d.owner_id = o.id
        ) <> 9
        OR (
          SELECT COUNT(*)
          FROM tmp_expected_company_email_codes AS e
          JOIN company_email_delivery_settings AS d
            ON d.owner_id = o.id
           AND d.code = e.code
        ) <> 9
      ) AS delivery_failures
    )
  + (
      SELECT COUNT(*)
      FROM (
        SELECT o.id
        FROM sis_propietarios AS o
        WHERE (
          SELECT COUNT(*)
          FROM company_email_report_sections AS s
          WHERE s.owner_id = o.id
        ) <> 7
        OR (
          SELECT COUNT(*)
          FROM tmp_expected_company_email_sections AS e
          JOIN company_email_report_sections AS s
            ON s.owner_id = o.id
           AND s.code = e.code
        ) <> 7
      ) AS section_failures
    )
  + (
      SELECT COUNT(*)
      FROM (
        SELECT owner_id, normalized_email
        FROM company_email_recipients
        GROUP BY owner_id, normalized_email
        HAVING COUNT(*) > 1
      ) AS recipient_failures
    )
  + (
      SELECT COUNT(*)
      FROM disclaimer_firmas AS f
      LEFT JOIN company_terms_versions AS t
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
         OR normalized_email NOT REGEXP '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    )
  + (
      SELECT COUNT(*)
      FROM sis_propietarios AS o
      LEFT JOIN company_terms_versions AS t
        ON t.owner_id = o.id
       AND t.version_number = 1
      LEFT JOIN company_email_settings AS s ON s.owner_id = o.id
      WHERE t.id IS NULL
         OR t.content_hash <> SHA2(t.content_html, 256)
         OR s.current_terms_version_id IS NULL
         OR s.current_terms_version_id <> t.id
    )
  + (
      SELECT COUNT(*)
      FROM sis_propietarios AS o
      LEFT JOIN company_email_settings AS s ON s.owner_id = o.id
      WHERE s.id IS NULL
    );

SELECT @migration_validation_failures := failure_count
FROM tmp_company_email_migration_validation;

-- This update is guarded: failed validation leaves the stage at
-- constraints_hardened, so a rerun cannot silently report completion.
UPDATE company_email_migration_state
SET stage = 'completed',
    completed_at = CURRENT_TIMESTAMP,
    error_message = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE migration_key = @migration_key
  AND stage = 'constraints_hardened'
  AND @migration_validation_failures = 0;

DROP TEMPORARY TABLE tmp_company_email_migration_validation;
DROP TEMPORARY TABLE tmp_expected_company_email_sections;
DROP TEMPORARY TABLE tmp_expected_company_email_codes;

SELECT *
FROM company_email_migration_state
WHERE migration_key = @migration_key;
