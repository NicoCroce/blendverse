import type { EmailCatalogCode } from '@server/domains/CompanyEmailSettings/Domain';

const WELCOME_CODES: ReadonlySet<EmailCatalogCode> = new Set([
  'admin_license_created',
  'employee_license_status_changed',
  'employee_document_signed',
  'admin_document_signed',
  'employee_terms_reminder',
  'admin_daily_report',
  'employee_daily_reminder',
  'employee_document_assigned',
]);

export const applyInstitutionalWelcome = (
  body: string,
  code: EmailCatalogCode,
  welcomeMessage: string | null,
): string => {
  if (!welcomeMessage || !WELCOME_CODES.has(code)) return body;
  return `${welcomeMessage}<hr>${body}`;
};
