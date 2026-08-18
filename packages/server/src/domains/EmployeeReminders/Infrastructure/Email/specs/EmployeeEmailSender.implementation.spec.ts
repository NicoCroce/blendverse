import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { EmployeeEmailSenderImplementation } from '../EmployeeEmailSender.implementation';

const { employeeDailyReminder, applyWelcome } = vi.hoisted(() => ({
  employeeDailyReminder: vi.fn().mockReturnValue({
    subject: '[GestDoc] Tus pendientes — Acme — 2026-08-17',
    body: '<p>Pendientes</p>',
  }),
  applyWelcome: vi.fn((body: string) => `<p>Welcome</p><hr>${body}`),
}));

vi.mock('@server/Infrastructure', () => ({
  emailTemplates: { employeeDailyReminder },
  applyInstitutionalWelcome: applyWelcome,
  MailNotificationService: class MailNotificationService {},
}));

const requestContext = new RequestContext(7, 'employee-reminder-email', 41);

describe('EmployeeEmailSenderImplementation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the current subject and decorates immediately before sendOne', async () => {
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
    const reminder = {
      employeeName: 'Ana',
      companyName: 'Acme',
      date: '2026-08-17',
    };
    const sender = new EmployeeEmailSenderImplementation(
      mailNotificationService as never,
    );

    await sender.sendReminder({
      to: ['ana@acme.test'],
      reminder: reminder as never,
      welcomeMessage: 'Welcome',
      requestContext,
    });

    expect(employeeDailyReminder).toHaveBeenCalledWith(reminder);
    expect(applyWelcome).toHaveBeenCalledWith(
      '<p>Pendientes</p>',
      'employee_daily_reminder',
      'Welcome',
    );
    expect(mailNotificationService.sendOne).toHaveBeenCalledWith({
      to: ['ana@acme.test'],
      subject: '[GestDoc] Tus pendientes — Acme — 2026-08-17',
      html: '<p>Welcome</p><hr><p>Pendientes</p>',
    });
    expect(order).toEqual(['decorate', 'sendOne']);
  });
});
