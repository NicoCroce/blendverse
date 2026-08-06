import { MailNotificationService } from '@server/Infrastructure';
import { IDailyReportEmailSender } from '../../Domain/DailyReportEmailSender.port';

/**
 * Implementación del puerto DailyReportEmailSender usando
 * MailNotificationService.sendOne() (Nodemailer).
 */
export class DailyReportEmailSenderImplementation implements IDailyReportEmailSender {
  constructor(
    private readonly mailNotificationService: MailNotificationService,
  ) {}

  async send(params: {
    to: string[];
    subject: string;
    html: string;
  }): Promise<void> {
    await this.mailNotificationService.sendOne({
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  }
}
