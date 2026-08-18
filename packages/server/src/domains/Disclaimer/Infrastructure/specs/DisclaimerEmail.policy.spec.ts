import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { DisclaimerEmailService } from '../DisclaimerEmail.service';

const { reminderTemplate, applyWelcome } = vi.hoisted(() => ({
  reminderTemplate: vi
    .fn()
    .mockReturnValue({ subject: 'Terms', body: '<p>Legal terms</p>' }),
  applyWelcome: vi.fn((body: string) => `<p>Welcome</p><hr>${body}`),
}));

vi.mock('@server/Infrastructure', () => ({
  emailTemplates: { disclaimerReminder: reminderTemplate },
  applyInstitutionalWelcome: applyWelcome,
  MailNotificationService: class MailNotificationService {},
}));

const context = new RequestContext(7, 'terms-reminder', 41);

describe('DisclaimerEmailService policy integration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps legal terms intact while adding only the institutional preamble', async () => {
    const sender = { sendOne: vi.fn().mockResolvedValue(undefined) };
    const policy = {
      execute: vi
        .fn()
        .mockResolvedValue({ enabled: true, welcomeMessage: 'Company notice' }),
    };
    const service = new DisclaimerEmailService(
      sender as never,
      policy as never,
    );

    await service.sendReminder({
      to: ['employee@acme.test'],
      disclaimerText: '<p>Legal version 2</p>',
      companyName: 'Acme',
      requestContext: context,
    });

    expect(policy.execute).toHaveBeenCalledWith({
      input: { code: 'employee_terms_reminder' },
      requestContext: context,
    });
    expect(applyWelcome).toHaveBeenCalledWith(
      '<p>Legal terms</p>',
      'employee_terms_reminder',
      'Company notice',
    );
    expect(sender.sendOne).toHaveBeenCalledWith({
      to: 'employee@acme.test',
      subject: 'Terms',
      html: '<p>Welcome</p><hr><p>Legal terms</p>',
    });
  });

  it('does not send reminders when the terms route is disabled', async () => {
    const sender = { sendOne: vi.fn() };
    const policy = {
      execute: vi
        .fn()
        .mockResolvedValue({
          enabled: false,
          welcomeMessage: 'Company notice',
        }),
    };
    const service = new DisclaimerEmailService(
      sender as never,
      policy as never,
    );

    await service.sendReminder({
      to: ['employee@acme.test'],
      disclaimerText: 'Legal',
      companyName: 'Acme',
      requestContext: context,
    });
    expect(sender.sendOne).not.toHaveBeenCalled();
    expect(reminderTemplate).not.toHaveBeenCalled();
  });
});
