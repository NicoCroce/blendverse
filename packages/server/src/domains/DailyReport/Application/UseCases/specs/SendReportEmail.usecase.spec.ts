import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import { SendReportEmail } from '../SendReportEmail.usecase';
import { buildDailyReport } from './dailyReport.fixtures';

const { dailyReportTemplate } = vi.hoisted(() => ({
  dailyReportTemplate: vi.fn(),
}));

vi.mock('@server/Infrastructure', () => ({
  emailTemplates: { dailyReport: dailyReportTemplate },
}));

const requestContext = new RequestContext(1, 'req-1', 42);

describe('SendReportEmail (FR-003/FR-004 — envío a admins)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resolves the admins with the requestContext (multi-tenant) and sends via the port', async () => {
    const mockGetAdmins = {
      execute: vi.fn().mockResolvedValue(['a@test.com']),
    };
    const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
    dailyReportTemplate.mockReturnValue({
      subject: '[GestDoc] Reporte diario — Acme S.A. — 2026-08-06',
      body: '<h1>Reporte diario</h1>',
    });

    const report = buildDailyReport();
    const useCase = new SendReportEmail(
      mockGetAdmins as never,
      mockSender as never,
    );

    const result = await useCase.execute({ input: { report }, requestContext });

    expect(mockGetAdmins.execute).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
    expect(requestContext.values.ownerId).toBe(42);
    expect(dailyReportTemplate).toHaveBeenCalledWith(report.values);
    expect(mockSender.send).toHaveBeenCalledWith({
      to: ['a@test.com'],
      subject: '[GestDoc] Reporte diario — Acme S.A. — 2026-08-06',
      html: '<h1>Reporte diario</h1>',
    });
    expect(result).toEqual({ success: true });
  });

  it('skips the send and returns success=false when the company has no admins', async () => {
    const mockGetAdmins = { execute: vi.fn().mockResolvedValue([]) };
    const mockSender = { send: vi.fn() };

    const useCase = new SendReportEmail(
      mockGetAdmins as never,
      mockSender as never,
    );

    const result = await useCase.execute({
      input: { report: buildDailyReport() },
      requestContext,
    });

    expect(result).toEqual({ success: false });
    expect(mockSender.send).not.toHaveBeenCalled();
    expect(dailyReportTemplate).not.toHaveBeenCalled();
  });

  it('sends to every admin returned by GetAdmins', async () => {
    const mockGetAdmins = {
      execute: vi
        .fn()
        .mockResolvedValue(['a@test.com', 'b@test.com', 'c@test.com']),
    };
    const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
    dailyReportTemplate.mockReturnValue({ subject: 's', body: 'b' });

    const useCase = new SendReportEmail(
      mockGetAdmins as never,
      mockSender as never,
    );

    await useCase.execute({
      input: { report: buildDailyReport() },
      requestContext,
    });

    expect(mockSender.send).toHaveBeenCalledWith({
      to: ['a@test.com', 'b@test.com', 'c@test.com'],
      subject: 's',
      html: 'b',
    });
  });
});
