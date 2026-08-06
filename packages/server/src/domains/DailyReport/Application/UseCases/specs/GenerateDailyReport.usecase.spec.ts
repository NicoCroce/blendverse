import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GenerateDailyReport } from '../GenerateDailyReport.usecase';

const requestContext = new RequestContext(1, 'req-1', 42);

const onLeaveRecord = {
  employeeId: 1,
  employeeName: 'Juan Pérez',
  licenseType: 'Enfermedad',
  startDate: '2026-08-05',
  endDate: '2026-08-07',
  returnDate: '2026-08-08',
};

const pendingLicenseRecord = {
  employeeId: 2,
  employeeName: 'María López',
  licenseType: 'Particular',
  startDate: '2026-08-10',
  endDate: '2026-08-12',
  daysSinceRequest: 3,
};

const unsignedDocumentRecord = {
  documentId: 10,
  documentTitle: 'Recibo de sueldo',
  employeeId: 3,
  employeeName: 'Carlos Gómez',
  viewStatus: 'No visto' as const,
};

const pendingDisclaimerRecord = {
  employeeId: 4,
  employeeName: 'Ana Ruiz',
  employeeEmail: 'ana@test.com',
};

const upcomingVacationRecord = {
  employeeId: 5,
  employeeName: 'Pedro Díaz',
  segmentName: 'Operaciones',
  startDate: '2026-08-16',
  endDate: '2026-08-30',
};

const expiringLicenseRecord = {
  employeeId: 6,
  employeeName: 'Laura Fernández',
  licenseType: 'Maternidad',
  endDate: '2026-08-12',
};

const summarySection = {
  activeEmployees: 50,
  licensesInProgress: 3,
  pendingLicenses: 5,
  unsignedDocuments: 10,
  pendingDisclaimerAcceptances: 8,
};

const buildMocks = () => ({
  employeesOnLeave: { execute: vi.fn().mockResolvedValue([onLeaveRecord]) },
  pendingLicenses: {
    execute: vi.fn().mockResolvedValue([pendingLicenseRecord]),
  },
  unsignedDocuments: {
    execute: vi.fn().mockResolvedValue([unsignedDocumentRecord]),
  },
  pendingDisclaimers: {
    execute: vi.fn().mockResolvedValue([pendingDisclaimerRecord]),
  },
  upcomingVacations: {
    execute: vi.fn().mockResolvedValue([upcomingVacationRecord]),
  },
  expiringLicenses: {
    execute: vi.fn().mockResolvedValue([expiringLicenseRecord]),
  },
  statisticalSummary: {
    execute: vi.fn().mockResolvedValue({ section: summarySection }),
  },
});

describe('GenerateDailyReport (US8 — orquestador de las 7 secciones)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('executes the 7 section use cases in parallel and assembles the report', async () => {
    const mocks = buildMocks();

    const useCase = new GenerateDailyReport(
      mocks.employeesOnLeave as never,
      mocks.pendingLicenses as never,
      mocks.unsignedDocuments as never,
      mocks.pendingDisclaimers as never,
      mocks.upcomingVacations as never,
      mocks.expiringLicenses as never,
      mocks.statisticalSummary as never,
    );

    const result = await useCase.execute({
      input: { companyName: 'Acme S.A.' },
      requestContext,
    });

    expect(result.report.values.ownerId).toBe(42);
    expect(result.report.values.companyName).toBe('Acme S.A.');
    expect(result.report.values.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const sections = result.report.values.sections;
    expect(sections.employeesOnLeaveToday).toEqual({
      items: [onLeaveRecord],
      totalCount: 1,
    });
    expect(sections.pendingLicenses).toEqual({
      items: [pendingLicenseRecord],
      totalCount: 1,
    });
    expect(sections.unsignedDocuments).toEqual({
      items: [unsignedDocumentRecord],
      totalCount: 1,
    });
    expect(sections.pendingDisclaimerAcceptances).toEqual({
      items: [pendingDisclaimerRecord],
      totalCount: 1,
    });
    expect(sections.upcomingVacations).toEqual({
      items: [upcomingVacationRecord],
      totalCount: 1,
    });
    expect(sections.expiringLicenses).toEqual({
      items: [expiringLicenseRecord],
      totalCount: 1,
    });
    expect(sections.statisticalSummary).toEqual(summarySection);
  });

  it('propagates the ownerId from the requestContext to every section use case', async () => {
    const mocks = buildMocks();

    const useCase = new GenerateDailyReport(
      mocks.employeesOnLeave as never,
      mocks.pendingLicenses as never,
      mocks.unsignedDocuments as never,
      mocks.pendingDisclaimers as never,
      mocks.upcomingVacations as never,
      mocks.expiringLicenses as never,
      mocks.statisticalSummary as never,
    );

    await useCase.execute({
      input: { companyName: 'Acme S.A.' },
      requestContext,
    });

    for (const mock of Object.values(mocks)) {
      expect(mock.execute).toHaveBeenCalledWith(
        expect.objectContaining({ requestContext }),
      );
    }
  });

  it('uses empty arrays and totalCount 0 when a section returns nothing', async () => {
    const mocks = buildMocks();
    mocks.employeesOnLeave.execute.mockResolvedValue([]);
    mocks.pendingLicenses.execute.mockResolvedValue([]);

    const useCase = new GenerateDailyReport(
      mocks.employeesOnLeave as never,
      mocks.pendingLicenses as never,
      mocks.unsignedDocuments as never,
      mocks.pendingDisclaimers as never,
      mocks.upcomingVacations as never,
      mocks.expiringLicenses as never,
      mocks.statisticalSummary as never,
    );

    const result = await useCase.execute({
      input: { companyName: 'Acme S.A.' },
      requestContext,
    });

    expect(result.report.values.sections.employeesOnLeaveToday).toEqual({
      items: [],
      totalCount: 0,
    });
    expect(result.report.values.sections.pendingLicenses).toEqual({
      items: [],
      totalCount: 0,
    });
    // Las demás secciones siguen con datos
    expect(result.report.values.sections.unsignedDocuments.totalCount).toBe(1);
  });

  it('falls back to an empty companyName when input is not provided', async () => {
    const mocks = buildMocks();

    const useCase = new GenerateDailyReport(
      mocks.employeesOnLeave as never,
      mocks.pendingLicenses as never,
      mocks.unsignedDocuments as never,
      mocks.pendingDisclaimers as never,
      mocks.upcomingVacations as never,
      mocks.expiringLicenses as never,
      mocks.statisticalSummary as never,
    );

    // El fallback `input?.companyName ?? ''` es defensivo en runtime; el tipo
    // exige `input` (IGenerateDailyReport), por eso se castea el params para
    // ejercitar la rama sin input.
    const result = await useCase.execute({ requestContext } as never);

    expect(result.report.values.companyName).toBe('');
  });
});
