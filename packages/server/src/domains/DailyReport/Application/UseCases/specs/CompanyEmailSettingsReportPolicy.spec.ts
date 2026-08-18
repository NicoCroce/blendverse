import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { GenerateDailyReport } from '../GenerateDailyReport.usecase';

const context = new RequestContext(0, 'daily-report-owner-41', 41);

const sectionMocks = () => ({
  employeesOnLeave: { execute: vi.fn().mockResolvedValue([{ employeeId: 1 }]) },
  pendingLicenses: { execute: vi.fn().mockResolvedValue([{ employeeId: 2 }]) },
  unsignedDocuments: {
    execute: vi.fn().mockResolvedValue([{ documentId: 3 }]),
  },
  pendingDisclaimers: {
    execute: vi.fn().mockResolvedValue([{ employeeId: 4 }]),
  },
  upcomingVacations: {
    execute: vi.fn().mockResolvedValue([{ employeeId: 5 }]),
  },
  expiringLicenses: { execute: vi.fn().mockResolvedValue([{ employeeId: 6 }]) },
  statisticalSummary: {
    execute: vi.fn().mockResolvedValue({ section: { activeEmployees: 9 } }),
  },
});

describe('GenerateDailyReport with CompanyEmailSettings policy', () => {
  it('queries and renders only the sections selected for the tenant', async () => {
    const mocks = sectionMocks();
    const policy = {
      execute: vi
        .fn()
        .mockResolvedValue({
          enabled: true,
          selectedSections: ['statistical_summary', 'pending_licenses'],
        }),
    };
    const useCase = new GenerateDailyReport(
      mocks.employeesOnLeave as never,
      mocks.pendingLicenses as never,
      mocks.unsignedDocuments as never,
      mocks.pendingDisclaimers as never,
      mocks.upcomingVacations as never,
      mocks.expiringLicenses as never,
      mocks.statisticalSummary as never,
      policy as never,
    );

    const result = await useCase.execute({
      input: { companyName: 'Acme' },
      requestContext: context,
    });
    expect(policy.execute).toHaveBeenCalledWith({
      input: { code: 'admin_daily_report' },
      requestContext: context,
    });
    expect(mocks.pendingLicenses.execute).toHaveBeenCalledWith({
      requestContext: context,
    });
    expect(mocks.statisticalSummary.execute).toHaveBeenCalledWith({
      requestContext: context,
    });
    expect(mocks.employeesOnLeave.execute).not.toHaveBeenCalled();
    expect(mocks.unsignedDocuments.execute).not.toHaveBeenCalled();
    expect(mocks.pendingDisclaimers.execute).not.toHaveBeenCalled();
    expect(mocks.upcomingVacations.execute).not.toHaveBeenCalled();
    expect(mocks.expiringLicenses.execute).not.toHaveBeenCalled();
    expect(result.report!.values.sections.pendingLicenses.totalCount).toBe(1);
    expect(result.report!.values.sections.unsignedDocuments.totalCount).toBe(0);
  });
});
