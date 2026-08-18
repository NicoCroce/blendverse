export const EMAIL_CATALOG = {
  adminLicenseCreated: 'admin_license_created',
  employeeLicenseStatusChanged: 'employee_license_status_changed',
  employeeDocumentSigned: 'employee_document_signed',
  adminDocumentSigned: 'admin_document_signed',
  employeeTermsReminder: 'employee_terms_reminder',
  adminDailyReport: 'admin_daily_report',
  employeeDailyReminder: 'employee_daily_reminder',
  employeeDocumentAssigned: 'employee_document_assigned',
  requesterDocumentManual: 'requester_document_manual',
} as const;

export type EmailCatalogCode =
  (typeof EMAIL_CATALOG)[keyof typeof EMAIL_CATALOG];

export const EMAIL_CATALOG_CODES = [
  'admin_license_created',
  'employee_license_status_changed',
  'employee_document_signed',
  'admin_document_signed',
  'employee_terms_reminder',
  'admin_daily_report',
  'employee_daily_reminder',
  'employee_document_assigned',
  'requester_document_manual',
] as const;

export const EMAIL_CATALOG_METADATA: Record<
  EmailCatalogCode,
  { audience: 'admin' | 'employee' | 'requester'; trigger: string }
> = {
  admin_license_created: { audience: 'admin', trigger: 'license_created' },
  employee_license_status_changed: {
    audience: 'employee',
    trigger: 'license_status_changed',
  },
  employee_document_signed: {
    audience: 'employee',
    trigger: 'document_signed',
  },
  admin_document_signed: { audience: 'admin', trigger: 'document_signed' },
  employee_terms_reminder: { audience: 'employee', trigger: 'terms_reminder' },
  admin_daily_report: { audience: 'admin', trigger: 'daily_report' },
  employee_daily_reminder: { audience: 'employee', trigger: 'daily_reminder' },
  employee_document_assigned: {
    audience: 'employee',
    trigger: 'document_assigned',
  },
  requester_document_manual: {
    audience: 'requester',
    trigger: 'document_manual',
  },
};

export const REPORT_SECTION_CODES = [
  'statistical_summary',
  'employees_on_leave_today',
  'pending_licenses',
  'unsigned_documents',
  'pending_terms_acceptance',
  'upcoming_vacations',
  'expiring_licenses',
] as const;

export type ReportSectionCode = (typeof REPORT_SECTION_CODES)[number];

export interface DeliverySetting {
  code: EmailCatalogCode;
  audience: 'admin' | 'employee' | 'requester';
  trigger: string;
  enabled: boolean;
}

export interface RecipientSetting {
  id?: number;
  email: string;
  normalizedEmail: string;
  source: 'backfill' | 'lazy_provision' | 'manual';
}

export interface ReportSectionSetting {
  code: ReportSectionCode;
  enabled: boolean;
}

export interface TermsVersion {
  id: number;
  version: number;
  publishedAt: Date;
  publishedBy: number | null;
  content: string;
  contentHash: string;
}

export interface CompanyEmailSettingsSnapshot {
  id: number;
  ownerId: number;
  version: number;
  welcomeMessage: string | null;
  deliveries: DeliverySetting[];
  recipients: RecipientSetting[];
  reportSections: ReportSectionSetting[];
  currentTerms: TermsVersion | null;
  diagnostics: string[];
  updatedAt: Date;
}

export interface CompanyEmailSettingsDraft {
  delivery: Array<{ code: EmailCatalogCode; enabled: boolean }>;
  adminRecipients: Array<{ email: string }>;
  reportSections: Array<{ code: ReportSectionCode; enabled: boolean }>;
  welcomeMessage: string | null;
}

export interface DeliveryPolicy {
  code: EmailCatalogCode;
  enabled: boolean;
  recipients: string[];
  selectedSections: ReportSectionCode[];
  welcomeMessage: string | null;
  diagnostics: string[];
}

export interface CompanyEmailRequestContext {
  readonly values: {
    readonly ownerId: number;
    readonly userId: number;
  };
}

export interface CompanyEmailSettingsRequest {
  requestContext: CompanyEmailRequestContext;
}
