import { describe, expect, it } from 'vitest';
import {
  EMAIL_CATALOG_CODES,
  EMAIL_ROUTE_PRESENTATION,
  REPORT_SECTION_CODES,
  REPORT_SECTION_PRESENTATION,
  toSafePreviewText,
} from '../CompanyEmailSettings.entity';

describe('CompanyEmailSettings frontend contract', () => {
  it('derives and presents all nine delivery routes and seven report sections', () => {
    expect(EMAIL_CATALOG_CODES).toHaveLength(9);
    expect(REPORT_SECTION_CODES).toHaveLength(7);
    for (const code of EMAIL_CATALOG_CODES) {
      expect(EMAIL_ROUTE_PRESENTATION[code]).toMatchObject({
        label: expect.any(String),
        source: expect.any(String),
        destination: expect.any(String),
      });
    }
    for (const code of REPORT_SECTION_CODES) {
      expect(REPORT_SECTION_PRESENTATION[code]).toMatchObject({
        label: expect.any(String),
        description: expect.any(String),
      });
    }
    expect(
      EMAIL_ROUTE_PRESENTATION.requester_document_manual.audienceLabel,
    ).toBe('Solicitante');
  });

  it('creates safe text previews without executing or returning HTML markup', () => {
    expect(
      toSafePreviewText(
        '<p>Hola <strong>equipo</strong></p><script>alert(1)</script>',
      ),
    ).toBe('Hola equipoalert(1)');
    expect(toSafePreviewText(null)).toBe('');
    expect(toSafePreviewText('')).toBe('');
  });
});
