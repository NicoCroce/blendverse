import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const runtimeMigration = readFileSync(
  resolve(process.cwd(), 'src/migrations/002_company_email_settings.sql'),
  'utf8',
);
const operatorMigration = readFileSync(
  resolve(process.cwd(), '../../specs/company-email-settings/pendiente.sql'),
  'utf8',
);

describe('company email settings staged migration', () => {
  it('is resumable and does not mark completion before zero validation failures', () => {
    expect(runtimeMigration).toContain("stage IN ('pending', 'schema_ready')");
    expect(runtimeMigration).toContain("stage = 'owners_backfilled'");
    expect(runtimeMigration).toContain("stage = 'acceptances_linked'");
    expect(runtimeMigration).toContain("stage = 'constraints_hardened'");
    expect(runtimeMigration).toContain("stage = 'completed'");
    expect(runtimeMigration).toContain('last_owner_id');
    expect(runtimeMigration).toContain(
      'AND @migration_validation_failures = 0',
    );
  });

  it('backfills the exhaustive catalog, sections, version-one terms and normalized recipients', () => {
    const codes = [
      'admin_license_created',
      'employee_license_status_changed',
      'employee_document_signed',
      'admin_document_signed',
      'employee_terms_reminder',
      'admin_daily_report',
      'employee_daily_reminder',
      'employee_document_assigned',
      'requester_document_manual',
    ];
    const sections = [
      'statistical_summary',
      'employees_on_leave_today',
      'pending_licenses',
      'unsigned_documents',
      'pending_terms_acceptance',
      'upcoming_vacations',
      'expiring_licenses',
    ];
    for (const code of codes) expect(runtimeMigration).toContain(`'${code}'`);
    for (const section of sections)
      expect(runtimeMigration).toContain(`'${section}'`);
    expect(runtimeMigration).toContain('LOWER(TRIM(u.email))');
    expect(runtimeMigration).toContain('terms_version_id');
    expect(runtimeMigration).toContain('migration_backfill');
  });

  it('keeps the manual operator artifact aligned with the runtime migration contract', () => {
    expect(operatorMigration).toContain('company_email_migration_state');
    expect(operatorMigration).toContain('company_email_settings_audit_events');
    expect(operatorMigration).toContain('DROP PROCEDURE IF EXISTS');
    expect(operatorMigration).toContain('uq_usuario_empresa_version');
    expect(operatorMigration).toContain(
      'AND @migration_validation_failures = 0',
    );
    expect(operatorMigration).toContain('requester_document_manual');
  });
});
