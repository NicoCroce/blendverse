import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { GenerateDailyReminder } from '../GenerateDailyReminder.usecase';

// El barrel @server/Infrastructure arrastra Database/relations → Users.model →
// Companies.model (Sequelize sin instancia en tests). Se mockean solo los
// helpers puros que el use case necesita (mismo patrón que SendReportEmail.usecase.spec).
vi.mock('@server/Infrastructure', () => ({
  buildEmployeeName: (user?: {
    nombre?: string | null;
    apellido?: string | null;
  }) => `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim(),
  formatDate: (date: Date) => date.toISOString().split('T')[0],
}));

const requestContext = new RequestContext(1, 'req-1', 42);

const employee = {
  id: 5,
  nombre: 'Carlos',
  apellido: 'Gómez',
  email: 'carlos@test.com',
  renovar_clave: false,
  estado_firma: 'Firmado' as const,
};

const pendingDocuments = [
  {
    documentId: 10,
    documentTitle: 'Recibo de sueldo',
    isUnsigned: true,
    isUnviewed: false,
  },
  {
    documentId: 11,
    documentTitle: 'Reglamento interno',
    isUnsigned: false,
    isUnviewed: true,
  },
  {
    documentId: 12,
    documentTitle: 'Liquidación',
    isUnsigned: true,
    isUnviewed: true,
  },
];

const buildMocks = () => ({
  getEmployeesByCompany: {
    execute: vi.fn().mockResolvedValue({ data: [employee], meta: {} }),
  },
  getPendingDocumentsByEmployee: {
    execute: vi.fn().mockResolvedValue(pendingDocuments),
  },
});

describe('GenerateDailyReminder (US1–US5 — ensambla el recordatorio diario)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('builds one reminder per employee with pending sections and shouldSend (FR-008)', async () => {
    const mocks = buildMocks();
    const useCase = new GenerateDailyReminder(
      mocks.getEmployeesByCompany as never,
      mocks.getPendingDocumentsByEmployee as never,
    );

    const result = await useCase.execute({
      input: { companyName: 'Acme S.A.' },
      requestContext,
    });

    expect(result.reminders).toHaveLength(1);
    const reminder = result.reminders[0];
    expect(reminder.ownerId).toBe(42);
    expect(reminder.employeeId).toBe(5);
    expect(reminder.employeeName).toBe('Carlos Gómez');
    expect(reminder.companyName).toBe('Acme S.A.');
    expect(reminder.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Documentos sin firmar: 10 y 12 (isUnsigned)
    expect(reminder.pending.unsignedDocuments).toEqual([
      { documentId: 10, documentTitle: 'Recibo de sueldo' },
      { documentId: 12, documentTitle: 'Liquidación' },
    ]);
    // Documentos sin visualizar: 11 y 12 (isUnviewed)
    expect(reminder.pending.unviewedDocuments).toEqual([
      { documentId: 11, documentTitle: 'Reglamento interno' },
      { documentId: 12, documentTitle: 'Liquidación' },
    ]);
    expect(reminder.pending.pendingDisclaimerAcceptance).toBe(false);
    expect(reminder.pending.renewPassword).toBe(false);
    expect(reminder.shouldSend).toBe(true);
  });

  it('propagates ownerId from requestContext to every cross-domain use case', async () => {
    const mocks = buildMocks();
    const useCase = new GenerateDailyReminder(
      mocks.getEmployeesByCompany as never,
      mocks.getPendingDocumentsByEmployee as never,
    );

    await useCase.execute({
      input: { companyName: 'Acme S.A.' },
      requestContext,
    });

    expect(mocks.getEmployeesByCompany.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        input: { ownerId: 42, page: '1', limit: '100000' },
        requestContext,
      }),
    );
    expect(mocks.getPendingDocumentsByEmployee.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        input: { employeeId: 5 },
        requestContext,
      }),
    );
  });

  it('marks account pendings: disclaimer not signed and renewPassword (FR-010)', async () => {
    const mocks = buildMocks();
    mocks.getEmployeesByCompany.execute.mockResolvedValue({
      data: [
        {
          ...employee,
          id: 7,
          email: 'ana@test.com',
          renovar_clave: true,
          estado_firma: 'Pendiente' as const,
        },
      ],
      meta: {},
    });
    mocks.getPendingDocumentsByEmployee.execute.mockResolvedValue([]);

    const useCase = new GenerateDailyReminder(
      mocks.getEmployeesByCompany as never,
      mocks.getPendingDocumentsByEmployee as never,
    );

    const result = await useCase.execute({
      input: { companyName: 'Acme S.A.' },
      requestContext,
    });

    const reminder = result.reminders[0];
    expect(reminder.pending.pendingDisclaimerAcceptance).toBe(true);
    expect(reminder.pending.renewPassword).toBe(true);
    expect(reminder.shouldSend).toBe(true);
  });

  it('sets shouldSend false when the employee has no pending actions (FR-008)', async () => {
    const mocks = buildMocks();
    mocks.getEmployeesByCompany.execute.mockResolvedValue({
      data: [employee],
      meta: {},
    });
    mocks.getPendingDocumentsByEmployee.execute.mockResolvedValue([]);

    const useCase = new GenerateDailyReminder(
      mocks.getEmployeesByCompany as never,
      mocks.getPendingDocumentsByEmployee as never,
    );

    const result = await useCase.execute({
      input: { companyName: 'Acme S.A.' },
      requestContext,
    });

    expect(result.reminders).toHaveLength(1);
    expect(result.reminders[0].pending).toEqual({
      unsignedDocuments: [],
      unviewedDocuments: [],
      pendingDisclaimerAcceptance: false,
      renewPassword: false,
    });
    expect(result.reminders[0].shouldSend).toBe(false);
  });
});
