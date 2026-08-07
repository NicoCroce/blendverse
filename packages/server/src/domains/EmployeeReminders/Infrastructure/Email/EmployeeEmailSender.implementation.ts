import { MailNotificationService } from '@server/Infrastructure';
import { IEmployeeEmailSender } from '../../Domain/EmployeeEmailSender.port';

/**
 * Implementación del puerto IEmployeeEmailSender usando
 * MailNotificationService.sendOne() (Nodemailer).
 */
export class EmployeeEmailSenderImplementation implements IEmployeeEmailSender {
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
