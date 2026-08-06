/**
 * DTOs de salida del reporte diario (no persistentes).
 * Definidos según `specs/003-daily-admin-report/data-model.md`.
 */

// ── Sección 1: Empleados de licencia hoy ────────────────────────────────────

export interface EmployeeOnLeaveItem {
  employeeId: number;
  employeeName: string;
  licenseType: string;
  startDate: string; // ISO 8601 (YYYY-MM-DD)
  endDate: string; // ISO 8601 (YYYY-MM-DD)
  returnDate: string; // ISO 8601 (YYYY-MM-DD)
}

export interface EmployeesOnLeaveTodaySection {
  items: EmployeeOnLeaveItem[];
  totalCount: number;
}

// ── Sección 2: Licencias pendientes de aprobación ───────────────────────────

export interface PendingLicenseItem {
  employeeId: number;
  employeeName: string;
  licenseType: string;
  startDate: string; // ISO 8601 (YYYY-MM-DD)
  endDate: string; // ISO 8601 (YYYY-MM-DD)
  daysSinceRequest: number;
}

export interface PendingLicensesSection {
  items: PendingLicenseItem[];
  totalCount: number;
}

// ── Sección 3: Documentos sin firmar ────────────────────────────────────────

export interface UnsignedDocumentItem {
  documentId: number;
  documentTitle: string;
  employeeId: number;
  employeeName: string;
  viewStatus: 'Visto' | 'No visto';
}

export interface UnsignedDocumentsSection {
  items: UnsignedDocumentItem[];
  totalCount: number;
}

// ── Sección 4: Términos y condiciones sin aceptar ───────────────────────────

export interface PendingDisclaimerAcceptanceItem {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
}

export interface PendingDisclaimerAcceptancesSection {
  items: PendingDisclaimerAcceptanceItem[];
  totalCount: number;
}

// ── Sección 5: Vacaciones próximas (próximos 15 días) ───────────────────────

export interface UpcomingVacationItem {
  employeeId: number;
  employeeName: string;
  segmentName: string | null;
  startDate: string; // ISO 8601 (YYYY-MM-DD)
  endDate: string; // ISO 8601 (YYYY-MM-DD)
}

export interface UpcomingVacationsSection {
  items: UpcomingVacationItem[];
  totalCount: number;
}

// ── Sección 6: Licencias que vencen esta semana ─────────────────────────────

export interface ExpiringLicenseItem {
  employeeId: number;
  employeeName: string;
  licenseType: string;
  endDate: string; // ISO 8601 (YYYY-MM-DD)
}

export interface ExpiringLicensesSection {
  items: ExpiringLicenseItem[];
  totalCount: number;
}

// ── Sección 7: Resumen estadístico ──────────────────────────────────────────

export interface StatisticalSummarySection {
  activeEmployees: number;
  licensesInProgress: number;
  pendingLicenses: number;
  unsignedDocuments: number;
  pendingDisclaimerAcceptances: number;
}

// ── Raíz ────────────────────────────────────────────────────────────────────

export interface IDailyReportSections {
  employeesOnLeaveToday: EmployeesOnLeaveTodaySection;
  pendingLicenses: PendingLicensesSection;
  unsignedDocuments: UnsignedDocumentsSection;
  pendingDisclaimerAcceptances: PendingDisclaimerAcceptancesSection;
  upcomingVacations: UpcomingVacationsSection;
  expiringLicenses: ExpiringLicensesSection;
  statisticalSummary: StatisticalSummarySection;
}

export interface IDailyReport {
  ownerId: number;
  companyName: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  sections: IDailyReportSections;
}
