import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { SendReportEmail } from '../SendReportEmail.usecase';
import { buildDailyReport } from './dailyReport.fixtures';

const requestContext = new RequestContext(1, 'req-1', 42);

describe('SendReportEmail (FR-003/FR-004 — envío a admins)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resolves the tenant policy with the requestContext (multi-tenant) and sends via the port', async () => {
    const mockPolicy = {
      execute: vi
        .fn()
        .mockResolvedValue({
          enabled: true,
          recipients: ['a@test.com'],
          welcomeMessage: null,
        }),
    };
    const mockSender = { send: vi.fn().mockResolvedValue(undefined) };

    const report = buildDailyReport();
    const useCase = new SendReportEmail(
      mockSender as never,
      mockPolicy as never,
    );

    const result = await useCase.execute({ input: { report }, requestContext });

    expect(mockPolicy.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        input: { code: 'admin_daily_report' },
        requestContext,
      }),
    );
    expect(requestContext.values.ownerId).toBe(42);
    expect(mockSender.send).toHaveBeenCalledWith({
      to: ['a@test.com'],
      report,
      welcomeMessage: null,
      requestContext,
    });
    expect(result).toEqual({ success: true });
  });

  it('skips the send and returns success=false when the company has no admins', async () => {
    const mockPolicy = {
      execute: vi
        .fn()
        .mockResolvedValue({
          enabled: true,
          recipients: [],
          welcomeMessage: null,
        }),
    };
    const mockSender = { send: vi.fn() };

    const useCase = new SendReportEmail(
      mockSender as never,
      mockPolicy as never,
    );

    const result = await useCase.execute({
      input: { report: buildDailyReport() },
      requestContext,
    });

    expect(result).toEqual({ success: false });
    expect(mockSender.send).not.toHaveBeenCalled();
  });

  it('sends to every admin returned by GetAdmins', async () => {
    const mockPolicy = {
      execute: vi
        .fn()
        .mockResolvedValue({
          enabled: true,
          recipients: ['a@test.com', 'b@test.com', 'c@test.com'],
          welcomeMessage: null,
        }),
    };
    const mockSender = { send: vi.fn().mockResolvedValue(undefined) };

    const useCase = new SendReportEmail(
      mockSender as never,
      mockPolicy as never,
    );

    await useCase.execute({
      input: { report: buildDailyReport() },
      requestContext,
    });

    expect(mockSender.send).toHaveBeenCalledWith({
      to: ['a@test.com', 'b@test.com', 'c@test.com'],
      report: expect.anything(),
      welcomeMessage: null,
      requestContext,
    });
  });
});
