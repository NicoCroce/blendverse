import { IRequestContext } from '@server/Application';
import { DailyReport } from '../Domain/DailyReport.entity';
import {
  EmployeesOnLeaveTodaySection,
  ExpiringLicensesSection,
  PendingDisclaimerAcceptancesSection,
  PendingLicensesSection,
  StatisticalSummarySection,
  UnsignedDocumentsSection,
  UpcomingVacationsSection,
} from '../Domain/DailyReport.types';

// ── GetAllActiveOwners ──────────────────────────────────────────────────────

export interface IActiveOwner {
  id: number;
  denominacion: string;
}

export interface IGetAllActiveOwnersOutput {
  owners: IActiveOwner[];
}

// ── Secciones (use cases individuales) ──────────────────────────────────────

export interface IGetEmployeesOnLeaveTodayOutput {
  section: EmployeesOnLeaveTodaySection;
}

export interface IGetPendingLicensesOutput {
  section: PendingLicensesSection;
}

export interface IGetUnsignedDocumentsOutput {
  section: UnsignedDocumentsSection;
}

export interface IGetPendingDisclaimerAcceptancesOutput {
  section: PendingDisclaimerAcceptancesSection;
}

export interface IGetUpcomingVacationsOutput {
  section: UpcomingVacationsSection;
}

export interface IGetExpiringLicensesOutput {
  section: ExpiringLicensesSection;
}

export interface IGetStatisticalSummaryOutput {
  section: StatisticalSummarySection;
}

// ── GenerateDailyReport (orquestador) ───────────────────────────────────────

export interface IGenerateDailyReportInput {
  companyName: string;
}

export interface IGenerateDailyReport extends IRequestContext {
  input: IGenerateDailyReportInput;
}

export interface IGenerateDailyReportOutput {
  report: DailyReport;
}

// ── SendReportEmail ─────────────────────────────────────────────────────────

export interface ISendReportEmailInput {
  report: DailyReport;
}

export interface ISendReportEmail extends IRequestContext {
  input: ISendReportEmailInput;
}

export interface ISendReportEmailOutput {
  success: boolean;
}

// ── DailyReportService ──────────────────────────────────────────────────────

export interface ISendDailyReportOutput {
  sent: number;
  failed: number;
  total: number;
}
