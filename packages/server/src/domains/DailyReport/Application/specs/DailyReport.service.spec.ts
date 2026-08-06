import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext, executeUseCase } from '@server/Application';
import { DailyReportService } from '../DailyReport.service';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

const mockGenerate = {};
const mockSend = {};
const mockOwners = {};

const buildService = () =>
  new DailyReportService(
    mockOwners as never,
    mockGenerate as never,
    mockSend as never,
  );

const executeCalls = () => vi.mocked(executeUseCase).mock.calls;

const callArgs = (index: number) => executeCalls()[index][0];

describe('DailyReportService (FR-002/FR-012/FR-013 — envío multi-tenant resiliente)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('iterates owners, creates a synthetic RequestContext per owner and counts sent/failed/total', async () => {
    vi.mocked(executeUseCase)
      .mockResolvedValueOnce([{ id: 1, denominacion: 'Acme S.A.' }])
      .mockResolvedValueOnce({ report: { values: {} } })
      .mockResolvedValueOnce({ success: true });

    const result = await buildService().sendDailyReport({
      requestContext: new RequestContext(0, 'system', 0),
    });

    expect(result).toEqual({ sent: 1, failed: 0, total: 1 });

    // Primer call: GetAllActiveOwners
    expect(callArgs(0).useCase).toBe(mockOwners);

    // GenerateDailyReport: companyName de la empresa y contexto sintético con ownerId
    const genCall = callArgs(1);
    expect(genCall.useCase).toBe(mockGenerate);
    expect(genCall.input).toEqual({ companyName: 'Acme S.A.' });
    expect(genCall.requestContext.values.ownerId).toBe(1);
    expect(genCall.requestContext.values.requestId).toMatch(/^daily-report-1-/);

    // SendReportEmail: mismo contexto sintético
    const sendCall = callArgs(2);
    expect(sendCall.useCase).toBe(mockSend);
    expect(sendCall.requestContext.values.ownerId).toBe(1);
  });

  it('continues with the remaining owners when one company fails (FR-012)', async () => {
    vi.mocked(executeUseCase)
      .mockResolvedValueOnce([
        { id: 1, denominacion: 'A' },
        { id: 2, denominacion: 'B' },
        { id: 3, denominacion: 'C' },
      ])
      .mockResolvedValueOnce({ report: {} })
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error('SMTP down'))
      .mockResolvedValueOnce({ report: {} })
      .mockResolvedValueOnce({ success: true });

    const result = await buildService().sendDailyReport({
      requestContext: new RequestContext(0, 'system', 0),
    });

    expect(result).toEqual({ sent: 2, failed: 1, total: 3 });
  });

  it('does not count a company as sent when the email returns success=false (no admins)', async () => {
    vi.mocked(executeUseCase)
      .mockResolvedValueOnce([{ id: 1, denominacion: 'A' }])
      .mockResolvedValueOnce({ report: {} })
      .mockResolvedValueOnce({ success: false });

    const result = await buildService().sendDailyReport({
      requestContext: new RequestContext(0, 'system', 0),
    });

    expect(result).toEqual({ sent: 0, failed: 0, total: 1 });
  });

  it('returns zeros when there are no active companies', async () => {
    vi.mocked(executeUseCase).mockResolvedValueOnce([]);

    const result = await buildService().sendDailyReport({
      requestContext: new RequestContext(0, 'system', 0),
    });

    expect(result).toEqual({ sent: 0, failed: 0, total: 0 });
    expect(vi.mocked(executeUseCase)).toHaveBeenCalledTimes(1);
  });
});
