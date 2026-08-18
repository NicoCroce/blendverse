import {
  EMAIL_CATALOG_CODES,
  EMAIL_CATALOG_METADATA,
  REPORT_SECTION_CODES,
  type EmailCatalogCode,
  type ReportSectionCode,
} from '../CompanyEmailSettings.types';
import { CompanyEmailSettingsDomainError } from '../CompanyEmailSettings.errors';

const assertExhaustive = <T extends string>(
  values: readonly T[],
  received: readonly { code: T }[],
  label: string,
): void => {
  if (
    received.length !== values.length ||
    new Set(received.map((item) => item.code)).size !== values.length ||
    values.some((value) => !received.some((item) => item.code === value))
  ) {
    throw new CompanyEmailSettingsDomainError(
      `El catálogo de ${label} es incompleto o tiene duplicados`,
      400,
      'VALIDATION_ERROR',
    );
  }
};

export const validateDeliveryDraft = (
  delivery: readonly { code: EmailCatalogCode; enabled: boolean }[],
): void => {
  assertExhaustive(EMAIL_CATALOG_CODES, delivery, 'emails');
  for (const item of delivery) {
    if (!EMAIL_CATALOG_METADATA[item.code]) {
      throw new CompanyEmailSettingsDomainError(
        'Tipo de email no reconocido',
        400,
        'VALIDATION_ERROR',
      );
    }
  }
};

export const validateReportDraft = (
  sections: readonly { code: ReportSectionCode; enabled: boolean }[],
): void => assertExhaustive(REPORT_SECTION_CODES, sections, 'secciones');
