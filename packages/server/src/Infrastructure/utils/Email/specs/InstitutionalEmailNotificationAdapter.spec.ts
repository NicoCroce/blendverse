import { describe, expect, it, vi } from 'vitest';
import { InstitutionalEmailNotificationAdapter } from '../InstitutionalEmailNotificationAdapter';

const { applyWelcome } = vi.hoisted(() => ({
  applyWelcome: vi.fn().mockReturnValue('<p>Welcome</p><hr><p>Body</p>'),
}));

vi.mock('../InstitutionalWelcome.decorator', () => ({
  applyInstitutionalWelcome: applyWelcome,
}));

describe('InstitutionalEmailNotificationAdapter', () => {
  it('decorates at the infrastructure boundary before calling the mail service', async () => {
    const mailNotificationService = {
      sendOne: vi.fn().mockResolvedValue(undefined),
    };
    const adapter = new InstitutionalEmailNotificationAdapter(
      mailNotificationService as never,
    );

    await adapter.sendOne({
      to: ['ops@acme.test'],
      subject: 'License',
      html: '<p>Body</p>',
      code: 'admin_license_created',
      welcomeMessage: '<p>Welcome</p>',
    });

    expect(applyWelcome).toHaveBeenCalledWith(
      '<p>Body</p>',
      'admin_license_created',
      '<p>Welcome</p>',
    );
    expect(mailNotificationService.sendOne).toHaveBeenCalledWith({
      to: ['ops@acme.test'],
      subject: 'License',
      html: '<p>Welcome</p><hr><p>Body</p>',
    });
  });
});
