import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { DailyReportEmailSenderImplementation } from '../DailyReportEmailSender.implementation';

const { dailyReport, applyWelcome } = vi.hoisted(() => ({
  dailyReport: vi.fn().mockReturnValue({
    subject: '[GestDoc] Reporte diario — Acme — 2026-08-17',
    body: '<p>Reporte diario</p>',
  }),
  applyWelcome: vi.fn((body: string) => `<p>Welcome</p><hr>${body}`),
}));

vi.mock('@server/Infrastructure', () => ({
  emailTemplates: { dailyReport },
  applyInstitutionalWelcome: applyWelcome,
  MailNotificationService: class MailNotificationService {},
}));

const requestContext = new RequestContext(7, 'daily-report-email', 41);

describe('DailyReportEmailSenderImplementation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the report and decorates immediately before sendOne', async () => {
    const order: string[] = [];
    applyWelcome.mockImplementation((body: string) => {
      order.push('decorate');
      return `<p>Welcome</p><hr>${body}`;
    });
    const mailNotificationService = {
      sendOne: vi.fn().mockImplementation(async () => {
        order.push('sendOne');
      }),
    };
    const report = { values: { ownerId: 41, companyName: 'Acme' } };
    const sender = new DailyReportEmailSenderImplementation(
      mailNotificationService as never,
    );

    await sender.send({
      to: ['ops@acme.test'],
      report: report as never,
      welcomeMessage: 'Welcome',
      requestContext,
    });

    expect(dailyReport).toHaveBeenCalledWith(report.values);
    expect(applyWelcome).toHaveBeenCalledWith(
      '<p>Reporte diario</p>',
      'admin_daily_report',
      'Welcome',
    );
    expect(mailNotificationService.sendOne).toHaveBeenCalledWith({
      to: ['ops@acme.test'],
      subject: '[GestDoc] Reporte diario — Acme — 2026-08-17',
      html: '<p>Welcome</p><hr><p>Reporte diario</p>',
    });
    expect(order).toEqual(['decorate', 'sendOne']);
  });
});
