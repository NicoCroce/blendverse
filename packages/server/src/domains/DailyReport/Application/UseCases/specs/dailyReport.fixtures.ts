import { DailyReport } from '../../../Domain/DailyReport.entity';
import { IDailyReportSections } from '../../../Domain/DailyReport.types';

/**
 * Fixtures compartidos para los specs del dominio DailyReport.
 */

export const emptySections = (): IDailyReportSections => ({
  employeesOnLeaveToday: { items: [], totalCount: 0 },
  pendingLicenses: { items: [], totalCount: 0 },
  unsignedDocuments: { items: [], totalCount: 0 },
  pendingDisclaimerAcceptances: { items: [], totalCount: 0 },
  upcomingVacations: { items: [], totalCount: 0 },
  expiringLicenses: { items: [], totalCount: 0 },
  statisticalSummary: {
    activeEmployees: 0,
    licensesInProgress: 0,
    pendingLicenses: 0,
    unsignedDocuments: 0,
    pendingDisclaimerAcceptances: 0,
  },
});

export const buildDailyReport = (
  overrides: Partial<{
    ownerId: number;
    companyName: string;
    date: string;
  }> = {},
): DailyReport =>
  DailyReport.create({
    ownerId: 42,
    companyName: 'Acme S.A.',
    date: '2026-08-06',
    sections: emptySections(),
    ...overrides,
  });
