-- Company Email Settings — read-only reconciliation diagnostics.
--
-- This file is intentionally diagnostic only. It is not a migration and must
-- not be executed by the application. Every statement is SHOW, DESCRIBE, or
-- SELECT/CTE and reports schema/data discrepancies without changing state.

SHOW TABLES LIKE 'company_email%';
SHOW INDEX FROM company_email_settings;
SHOW INDEX FROM company_email_recipients;
SHOW INDEX FROM disclaimer_firmas;

DESCRIBE company_email_migration_state;
DESCRIBE company_terms_versions;
DESCRIBE company_email_settings;
DESCRIBE company_email_delivery_settings;
DESCRIBE company_email_recipients;
DESCRIBE company_email_report_sections;
DESCRIBE company_email_settings_audit_events;
DESCRIBE disclaimer_firmas;

SELECT migration_key, stage, last_owner_id, completed_at, error_message
FROM company_email_migration_state
WHERE migration_key = 'company-email-settings-v1';

SELECT
  c.TABLE_NAME,
  c.COLUMN_NAME,
  c.IS_NULLABLE,
  c.DATA_TYPE,
  c.COLUMN_TYPE
FROM information_schema.COLUMNS AS c
WHERE c.TABLE_SCHEMA = DATABASE()
  AND (
    (c.TABLE_NAME = 'disclaimer_firmas' AND c.COLUMN_NAME = 'terms_version_id')
    OR (c.TABLE_NAME = 'company_email_settings' AND c.COLUMN_NAME IN ('owner_id', 'version', 'current_terms_version_id'))
  )
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;

SELECT
  o.id AS owner_id,
  CASE WHEN s.id IS NULL THEN 'missing_settings' END AS issue,
  s.version AS settings_version,
  s.current_terms_version_id,
  t.id AS current_terms_id,
  t.version_number AS current_terms_version,
  t.content_hash,
  SHA2(t.content_html, 256) AS calculated_content_hash
FROM sis_propietarios AS o
LEFT JOIN company_email_settings AS s ON s.owner_id = o.id
LEFT JOIN company_terms_versions AS t ON t.id = s.current_terms_version_id
WHERE s.id IS NULL
   OR s.current_terms_version_id IS NULL
   OR t.id IS NULL
   OR t.owner_id <> o.id
   OR t.content_hash <> SHA2(t.content_html, 256)
ORDER BY o.id;

SELECT owner_id, version_number, COUNT(*) AS duplicate_count
FROM company_terms_versions
GROUP BY owner_id, version_number
HAVING COUNT(*) > 1;

SELECT owner_id, content_hash, COUNT(*) AS duplicate_hash_count
FROM company_terms_versions
GROUP BY owner_id, content_hash
HAVING COUNT(*) > 1;

SELECT t.id, t.owner_id, t.version_number, 'orphan_terms_version' AS issue
FROM company_terms_versions AS t
LEFT JOIN sis_propietarios AS o ON o.id = t.owner_id
WHERE o.id IS NULL
   OR t.content_hash <> SHA2(t.content_html, 256)
ORDER BY t.owner_id, t.version_number;

WITH expected_codes AS (
  SELECT 'admin_license_created' AS code
  UNION ALL SELECT 'employee_license_status_changed'
  UNION ALL SELECT 'employee_document_signed'
  UNION ALL SELECT 'admin_document_signed'
  UNION ALL SELECT 'employee_terms_reminder'
  UNION ALL SELECT 'admin_daily_report'
  UNION ALL SELECT 'employee_daily_reminder'
  UNION ALL SELECT 'employee_document_assigned'
  UNION ALL SELECT 'requester_document_manual'
), owner_code_gaps AS (
  SELECT o.id AS owner_id, e.code
  FROM sis_propietarios AS o
  CROSS JOIN expected_codes AS e
  LEFT JOIN company_email_delivery_settings AS d
    ON d.owner_id = o.id AND d.code = e.code
  WHERE d.id IS NULL
)
SELECT owner_id, COUNT(*) AS missing_delivery_count,
       GROUP_CONCAT(code ORDER BY code) AS missing_codes
FROM owner_code_gaps
GROUP BY owner_id
ORDER BY owner_id;

SELECT d.owner_id, d.code, d.audience, d.`trigger`, d.enabled,
       'orphan_or_unknown_delivery' AS issue
FROM company_email_delivery_settings AS d
LEFT JOIN sis_propietarios AS o ON o.id = d.owner_id
WHERE o.id IS NULL
   OR d.code NOT IN (
     'admin_license_created', 'employee_license_status_changed',
     'employee_document_signed', 'admin_document_signed',
     'employee_terms_reminder', 'admin_daily_report',
     'employee_daily_reminder', 'employee_document_assigned',
     'requester_document_manual'
   )
ORDER BY d.owner_id, d.code;

WITH expected_sections AS (
  SELECT 'statistical_summary' AS code
  UNION ALL SELECT 'employees_on_leave_today'
  UNION ALL SELECT 'pending_licenses'
  UNION ALL SELECT 'unsigned_documents'
  UNION ALL SELECT 'pending_terms_acceptance'
  UNION ALL SELECT 'upcoming_vacations'
  UNION ALL SELECT 'expiring_licenses'
), owner_section_gaps AS (
  SELECT o.id AS owner_id, s.code
  FROM sis_propietarios AS o
  CROSS JOIN expected_sections AS s
  LEFT JOIN company_email_report_sections AS r
    ON r.owner_id = o.id AND r.code = s.code
  WHERE r.id IS NULL
)
SELECT owner_id, COUNT(*) AS missing_section_count,
       GROUP_CONCAT(code ORDER BY code) AS missing_codes
FROM owner_section_gaps
GROUP BY owner_id
ORDER BY owner_id;

SELECT r.owner_id, r.code, r.enabled, 'orphan_or_unknown_section' AS issue
FROM company_email_report_sections AS r
LEFT JOIN sis_propietarios AS o ON o.id = r.owner_id
WHERE o.id IS NULL
   OR r.code NOT IN (
     'statistical_summary', 'employees_on_leave_today', 'pending_licenses',
     'unsigned_documents', 'pending_terms_acceptance', 'upcoming_vacations',
     'expiring_licenses'
   )
ORDER BY r.owner_id, r.code;

SELECT owner_id, normalized_email, COUNT(*) AS duplicate_count,
       GROUP_CONCAT(email ORDER BY email) AS stored_emails
FROM company_email_recipients
GROUP BY owner_id, normalized_email
HAVING COUNT(*) > 1;

SELECT r.id, r.owner_id, r.email, r.normalized_email,
       CASE
         WHEN o.id IS NULL THEN 'orphan_recipient'
         WHEN r.email <> TRIM(r.email) THEN 'email_has_outer_whitespace'
         WHEN r.normalized_email <> LOWER(TRIM(r.email)) THEN 'normalized_email_drift'
         WHEN r.normalized_email NOT REGEXP '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN 'invalid_email'
       END AS issue
FROM company_email_recipients AS r
LEFT JOIN sis_propietarios AS o ON o.id = r.owner_id
WHERE o.id IS NULL
   OR r.email <> TRIM(r.email)
   OR r.normalized_email <> LOWER(TRIM(r.email))
   OR r.normalized_email NOT REGEXP '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
ORDER BY r.owner_id, r.id;

SELECT o.id AS owner_id,
       COUNT(CASE WHEN d.code IN ('admin_license_created', 'admin_document_signed', 'admin_daily_report') AND d.enabled THEN 1 END) AS active_admin_routes,
       COUNT(r.id) AS recipient_count
FROM sis_propietarios AS o
LEFT JOIN company_email_delivery_settings AS d ON d.owner_id = o.id
LEFT JOIN company_email_recipients AS r ON r.owner_id = o.id
GROUP BY o.id
HAVING active_admin_routes > 0 AND recipient_count = 0
ORDER BY o.id;

SELECT f.id_usuario, f.id_empresa, f.terms_version_id,
       t.owner_id AS terms_owner_id, t.version_number,
       CASE
         WHEN t.id IS NULL THEN 'missing_terms_version'
         WHEN t.owner_id <> f.id_empresa THEN 'cross_tenant_terms_version'
         WHEN t.version_number < 1 THEN 'invalid_terms_version'
       END AS issue
FROM disclaimer_firmas AS f
LEFT JOIN company_terms_versions AS t ON t.id = f.terms_version_id
WHERE f.terms_version_id IS NULL
   OR t.id IS NULL
   OR t.owner_id <> f.id_empresa
   OR t.version_number < 1
ORDER BY f.id_empresa, f.id_usuario;

SELECT id_usuario, id_empresa, terms_version_id, COUNT(*) AS duplicate_acceptance_count
FROM disclaimer_firmas
GROUP BY id_usuario, id_empresa, terms_version_id
HAVING COUNT(*) > 1;

SELECT a.id, a.owner_id, a.action, a.outcome, a.actor_user_id,
       'orphan_audit_event' AS issue
FROM company_email_settings_audit_events AS a
LEFT JOIN sis_propietarios AS o ON o.id = a.owner_id
WHERE o.id IS NULL
ORDER BY a.owner_id, a.id;

SELECT owner_id, action, outcome, COUNT(*) AS event_count
FROM company_email_settings_audit_events
GROUP BY owner_id, action, outcome
ORDER BY owner_id, action, outcome;
