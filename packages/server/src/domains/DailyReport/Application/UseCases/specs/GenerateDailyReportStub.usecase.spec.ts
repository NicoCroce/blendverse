import { describe, expect, it } from 'vitest';
import { RequestContext } from '@server/Application';
import { GenerateDailyReportStub } from '../GenerateDailyReportStub.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('GenerateDailyReportStub (US1/MVP — reporte con secciones vacías)', () => {
  it('builds a report with the 7 sections empty and statistical summary in zeros', async () => {
    const useCase = new GenerateDailyReportStub();

    const result = await useCase.execute({
      input: { companyName: 'Acme S.A.' },
      requestContext,
    });

    expect(result.report.values.ownerId).toBe(42);
    expect(result.report.values.companyName).toBe('Acme S.A.');
    expect(result.report.values.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const sections = result.report.values.sections;
    expect(sections.employeesOnLeaveToday).toEqual({
      items: [],
      totalCount: 0,
    });
    expect(sections.pendingLicenses).toEqual({ items: [], totalCount: 0 });
    expect(sections.unsignedDocuments).toEqual({ items: [], totalCount: 0 });
    expect(sections.pendingDisclaimerAcceptances).toEqual({
      items: [],
      totalCount: 0,
    });
    expect(sections.upcomingVacations).toEqual({ items: [], totalCount: 0 });
    expect(sections.expiringLicenses).toEqual({ items: [], totalCount: 0 });
    expect(sections.statisticalSummary).toEqual({
      activeEmployees: 0,
      licensesInProgress: 0,
      pendingLicenses: 0,
      unsignedDocuments: 0,
      pendingDisclaimerAcceptances: 0,
    });
  });

  it('propagates the ownerId from the requestContext', async () => {
    const useCase = new GenerateDailyReportStub();

    // Sin `input`: el stub usa el fallback defensivo `input?.companyName ?? ''`
    const result = await useCase.execute({ requestContext } as never);

    expect(result.report.values.ownerId).toBe(42);
    expect(result.report.values.companyName).toBe('');
  });
});
