import type { IEmailNotificationPort } from '@server/Application';
import { applyInstitutionalWelcome } from './InstitutionalWelcome.decorator';
import { MailNotificationService } from './MailNotification.service';

export class InstitutionalEmailNotificationAdapter implements IEmailNotificationPort {
  constructor(
    private readonly mailNotificationService: MailNotificationService,
  ) {}

  async sendOne({
    code,
    welcomeMessage,
    ...notification
  }: Parameters<IEmailNotificationPort['sendOne']>[0]): Promise<void> {
    const decoratedNotification = { ...notification };
    if (decoratedNotification.html !== undefined) {
      decoratedNotification.html = applyInstitutionalWelcome(
        decoratedNotification.html,
        code,
        welcomeMessage,
      );
    }

    await this.mailNotificationService.sendOne(decoratedNotification);
  }
}
