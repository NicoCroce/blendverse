import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext, executeUseCase } from '@server/Application';
import { EmployeeRemindersService } from '../EmployeeReminders.service';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

const mockOwners = {};
const mockGenerate = {};
const mockSend = {};

const buildService = () =>
  new EmployeeRemindersService(
    mockOwners as never,
    mockGenerate as never,
    mockSend as never,
  );

const executeCalls = () => vi.mocked(executeUseCase).mock.calls;
const callArgs = (index: number) => executeCalls()[index][0];

const reminder = {
  ownerId: 42,
  employeeId: 5,
  employeeName: 'Carlos Gómez',
  employeeEmail: 'carlos@test.com',
  companyName: 'Acme S.A.',
  date: '2026-08-07',
  pending: {
    unsignedDocuments: [],
    unviewedDocuments: [],
    pendingDisclaimerAcceptance: false,
    renewPassword: false,
  },
  shouldSend: true,
};

describe('EmployeeRemindersService (FR-003/FR-008 — batch multi-tenant resiliente)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('iterates owners, builds a synthetic RequestContext per owner and counts sent/skipped/failed', async () => {
    vi.mocked(executeUseCase)
      .mockResolvedValueOnce([{ id: 1, denominacion: 'Acme S.A.' }])
      .mockResolvedValueOnce({ reminders: [reminder] })
      .mockResolvedValueOnce({ sent: true });

    const result = await buildService().sendDailyReminders({
      requestContext: new RequestContext(0, 'system', 0),
    });

    expect(result).toEqual({ sent: 1, skipped: 0, failed: 0, totalOwners: 1 });

    // Primer call: GetAllActiveOwners
    expect(callArgs(0).useCase).toBe(mockOwners);

    // GenerateDailyReminder: companyName y contexto sintético con ownerId del tenant
    const genCall = callArgs(1);
    expect(genCall.useCase).toBe(mockGenerate);
    expect(genCall.input).toEqual({ companyName: 'Acme S.A.' });
    expect(genCall.requestContext.values.ownerId).toBe(1);
    expect(genCall.requestContext.values.requestId).toMatch(
      /^employee-reminders-1-/,
    );

    // SendEmployeeReminderEmail: mismo contexto sintético por empresa
    const sendCall = callArgs(2);
    expect(sendCall.useCase).toBe(mockSend);
    expect(sendCall.input).toEqual({ reminder });
    expect(sendCall.requestContext.values.ownerId).toBe(1);
  });

  it('counts a reminder as skipped when the email use case returns sent=false', async () => {
    vi.mocked(executeUseCase)
      .mockResolvedValueOnce([{ id: 1, denominacion: 'A' }])
      .mockResolvedValueOnce({ reminders: [reminder] })
      .mockResolvedValueOnce({ sent: false });

    const result = await buildService().sendDailyReminders({
      requestContext: new RequestContext(0, 'system', 0),
    });

    expect(result).toEqual({ sent: 0, skipped: 1, failed: 0, totalOwners: 1 });
  });

  it('continues with the remaining owners when one company fails (FR-003)', async () => {
    vi.mocked(executeUseCase)
      .mockResolvedValueOnce([
        { id: 1, denominacion: 'A' },
        { id: 2, denominacion: 'B' },
      ])
      .mockRejectedValueOnce(new Error('SMTP down'))
      .mockResolvedValueOnce({ reminders: [reminder] })
      .mockResolvedValueOnce({ sent: true });

    const result = await buildService().sendDailyReminders({
      requestContext: new RequestContext(0, 'system', 0),
    });

    expect(result).toEqual({ sent: 1, skipped: 0, failed: 1, totalOwners: 2 });
  });

  it('counts failed when a single employee email throws without blocking the owner batch', async () => {
    vi.mocked(executeUseCase)
      .mockResolvedValueOnce([{ id: 1, denominacion: 'A' }])
      .mockResolvedValueOnce({
        reminders: [reminder, { ...reminder, employeeId: 6 }],
      })
      .mockResolvedValueOnce({ sent: true })
      .mockRejectedValueOnce(new Error('SMTP down'));

    const result = await buildService().sendDailyReminders({
      requestContext: new RequestContext(0, 'system', 0),
    });

    expect(result).toEqual({ sent: 1, skipped: 0, failed: 1, totalOwners: 1 });
  });

  it('returns zeros when there are no active companies', async () => {
    vi.mocked(executeUseCase).mockResolvedValueOnce([]);

    const result = await buildService().sendDailyReminders({
      requestContext: new RequestContext(0, 'system', 0),
    });

    expect(result).toEqual({ sent: 0, skipped: 0, failed: 0, totalOwners: 0 });
    expect(vi.mocked(executeUseCase)).toHaveBeenCalledTimes(1);
  });
});
