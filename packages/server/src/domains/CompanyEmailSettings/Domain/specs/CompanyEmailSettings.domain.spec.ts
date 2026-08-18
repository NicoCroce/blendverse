import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { CompanyEmailSettings } from '../CompanyEmailSettings.entity';
import {
  EMAIL_CATALOG_CODES,
  EMAIL_CATALOG_METADATA,
  REPORT_SECTION_CODES,
  type CompanyEmailSettingsSnapshot,
} from '../CompanyEmailSettings.types';
import {
  validateDeliveryDraft,
  validateReportDraft,
} from '../value-objects/EmailCatalog.value';
import { EmailAddress } from '../value-objects/EmailAddress.value';
import {
  contentHash,
  sanitizeTermsContent,
  sanitizeWelcomeMessage,
} from '../value-objects/EmailContent.value';

const snapshot = (ownerId = 41): CompanyEmailSettingsSnapshot => ({
  id: 7,
  ownerId,
  version: 3,
  welcomeMessage: '<p>Bienvenidos</p>',
  deliveries: EMAIL_CATALOG_CODES.map((code) => ({
    code,
    audience: EMAIL_CATALOG_METADATA[code].audience,
    trigger: EMAIL_CATALOG_METADATA[code].trigger,
    enabled: true,
  })),
  recipients: [
    {
      email: 'admin@acme.test',
      normalizedEmail: 'admin@acme.test',
      source: 'manual',
    },
  ],
  reportSections: REPORT_SECTION_CODES.map((code) => ({ code, enabled: true })),
  currentTerms: null,
  diagnostics: [],
  updatedAt: new Date('2026-08-17T09:00:00.000Z'),
});

describe('CompanyEmailSettings domain rules', () => {
  it('keeps the exhaustive catalog of nine deliveries and seven report sections', () => {
    expect(EMAIL_CATALOG_CODES).toHaveLength(9);
    expect(new Set(EMAIL_CATALOG_CODES).size).toBe(9);
    expect(REPORT_SECTION_CODES).toHaveLength(7);
    expect(new Set(REPORT_SECTION_CODES).size).toBe(7);
    expect(EMAIL_CATALOG_METADATA.requester_document_manual.audience).toBe(
      'requester',
    );
    expect(EMAIL_CATALOG_METADATA.admin_daily_report.trigger).toBe(
      'daily_report',
    );
  });

  it('rejects incomplete or duplicated delivery and section drafts', () => {
    const deliveries = EMAIL_CATALOG_CODES.map((code) => ({
      code,
      enabled: true,
    }));
    const sections = REPORT_SECTION_CODES.map((code) => ({
      code,
      enabled: true,
    }));

    expect(() => validateDeliveryDraft(deliveries)).not.toThrow();
    expect(() => validateReportDraft(sections)).not.toThrow();
    expect(() => validateDeliveryDraft(deliveries.slice(0, 8))).toThrow(
      'incompleto o tiene duplicados',
    );
    expect(() =>
      validateDeliveryDraft([
        ...deliveries.slice(0, 8),
        { code: 'admin_license_created', enabled: false },
      ]),
    ).toThrow('incompleto o tiene duplicados');
    expect(() => validateReportDraft(sections.slice(0, 6))).toThrow(
      'incompleto o tiene duplicados',
    );
  });

  it('normalizes valid email addresses and rejects invalid or oversized values', () => {
    const address = EmailAddress.create('  Admin@Acme.Test  ');
    expect(address.value).toBe('Admin@Acme.Test');
    expect(address.normalized).toBe('admin@acme.test');
    expect(() => EmailAddress.create('not-an-email')).toThrow('no es válida');
    expect(() => EmailAddress.create('a'.repeat(321) + '@acme.test')).toThrow(
      'no es válida',
    );
  });

  it('sanitizes editable content, preserves allowed formatting, and hashes the result', () => {
    const welcome = sanitizeWelcomeMessage(
      '<p>Hola <strong>equipo</strong></p><script>alert(1)</script>',
    );
    expect(welcome).toContain('<strong>equipo</strong>');
    expect(welcome).not.toContain('<script>');
    expect(
      sanitizeTermsContent(
        '<p>Legal</p><a href="javascript:alert(1)">link</a>',
      ),
    ).toContain('Legal');
    expect(contentHash('contenido')).toBe(
      createHash('sha256').update('contenido').digest('hex'),
    );
    expect(() => sanitizeWelcomeMessage('   ')).toThrow('formato o límite');
    expect(sanitizeTermsContent('   ')).toBe('');
  });

  it('validates settings owner/version and returns defensive snapshots', () => {
    const value = snapshot();
    const entity = CompanyEmailSettings.create(value);
    const first = entity.values;
    first.deliveries.pop();

    expect(entity.values.deliveries).toHaveLength(9);
    expect(entity.values.recipients).toHaveLength(1);
    expect(entity.toJSON()).toEqual(entity.values);
    expect(() => CompanyEmailSettings.create({ ...value, ownerId: 0 })).toThrow(
      'Configuración de email inválida',
    );
    expect(() => CompanyEmailSettings.create({ ...value, version: 0 })).toThrow(
      'Configuración de email inválida',
    );
  });

  it('builds a normalized draft and replaces terms without changing the tenant', () => {
    const value = snapshot(88);
    const draft = CompanyEmailSettings.draftFrom(value, {
      delivery: [{ code: 'admin_license_created', enabled: false }],
      adminRecipients: [{ email: ' Admin@Acme.Test ' }],
      reportSections: [{ code: 'pending_licenses', enabled: true }],
      welcomeMessage: 'Hola',
    });
    const terms = {
      id: 4,
      version: 2,
      publishedAt: new Date('2026-08-17T10:00:00.000Z'),
      publishedBy: 12,
      content: '<p>Nuevo</p>',
      contentHash: 'hash',
    };

    expect(draft.ownerId).toBe(88);
    expect(draft.recipients[0]).toMatchObject({
      email: ' Admin@Acme.Test ',
      normalizedEmail: 'admin@acme.test',
      source: 'manual',
    });
    expect(CompanyEmailSettings.withTerms(value, terms).currentTerms).toEqual(
      terms,
    );
  });
});
