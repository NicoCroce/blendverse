import {
  applyInstitutionalWelcome,
  MailNotificationService,
  type MailNotification,
  emailTemplates,
} from '@server/Infrastructure';
import { ResolveEmailDeliveryPolicy } from '@server/domains/CompanyEmailSettings/Application';
import type { RequestContext } from '@server/Application';
import { logger } from '@server/Infrastructure/utils/pino';
import { ISendEmailService } from '../Application/UseCases/SendReminders.usecase';

export class DisclaimerEmailService implements ISendEmailService {
  constructor(
    private readonly mailNotificationService: MailNotificationService,
    private readonly _resolveEmailDeliveryPolicy: ResolveEmailDeliveryPolicy,
  ) {}

  async sendReminder({
    to,
    disclaimerText,
    companyName,
    requestContext,
  }: {
    to: string[];
    disclaimerText: string;
    companyName: string;
    requestContext: RequestContext;
  }): Promise<void> {
    const policy = await this._resolveEmailDeliveryPolicy.execute({
      input: { code: 'employee_terms_reminder' },
      requestContext,
    });
    if (!policy.enabled) return;
    const notifications: MailNotification[] = to.map((email) => {
      const { body, subject } = emailTemplates.disclaimerReminder({
        employeeName: email,
        disclaimerText,
        companyName,
      });

      return {
        to: email,
        subject,
        html: body,
      };
    });

    for (const notification of notifications) {
      try {
        await this.mailNotificationService.sendOne({
          ...notification,
          html: applyInstitutionalWelcome(
            notification.html ?? '',
            'employee_terms_reminder',
            policy.welcomeMessage,
          ),
        });
      } catch (error) {
        logger.error(error, 'Failed to send disclaimer reminder');
      }
    }
  }
}
