import { describe, expect, it } from 'vitest';
import { applyInstitutionalWelcome } from '../InstitutionalWelcome.decorator';
import { EMAIL_CATALOG_CODES } from '@server/domains/CompanyEmailSettings/Domain';

describe('applyInstitutionalWelcome', () => {
  it('inserts the welcome block exactly before the rendered body for all eight automatic codes', () => {
    const automaticCodes = EMAIL_CATALOG_CODES.filter(
      (code) => code !== 'requester_document_manual',
    );
    for (const code of automaticCodes) {
      const result = applyInstitutionalWelcome(
        '<p>Rendered body</p>',
        code,
        '<p>Welcome</p>',
      );
      expect(result).toBe('<p>Welcome</p><hr><p>Rendered body</p>');
      expect(result.indexOf('<p>Welcome</p>')).toBeLessThan(
        result.indexOf('<p>Rendered body</p>'),
      );
    }
  });

  it('does not decorate requester manual documents or null/empty welcome messages', () => {
    expect(
      applyInstitutionalWelcome(
        '<p>Legal body</p>',
        'requester_document_manual',
        '<p>Welcome</p>',
      ),
    ).toBe('<p>Legal body</p>');
    expect(
      applyInstitutionalWelcome('<p>Body</p>', 'admin_daily_report', null),
    ).toBe('<p>Body</p>');
    expect(
      applyInstitutionalWelcome('<p>Body</p>', 'admin_daily_report', ''),
    ).toBe('<p>Body</p>');
  });

  it('preserves the legal terms content after the institutional preamble', () => {
    const legalBody =
      '<section data-terms-version="2"><p>Terms &amp; conditions</p></section>';
    const result = applyInstitutionalWelcome(
      legalBody,
      'employee_terms_reminder',
      '<p>Company notice</p>',
    );
    expect(result).toContain('<p>Company notice</p><hr>');
    expect(result).toContain(legalBody);
    expect(result).not.toContain('data-terms-version="1"');
  });
});
