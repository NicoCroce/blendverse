import {
  MailNotificationService,
  applyInstitutionalWelcome,
  emailTemplates,
} from '@server/Infrastructure';
import { DailyReport } from '../../Domain/DailyReport.entity';
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
    report: DailyReport;
    welcomeMessage: string | null;
    requestContext: {
      readonly values: {
        readonly ownerId: number;
        readonly userId: number;
      };
    };
  }): Promise<void> {
    const { subject, body } = emailTemplates.dailyReport(params.report.values);
    await this.mailNotificationService.sendOne({
      to: params.to,
      subject,
      html: applyInstitutionalWelcome(
        body,
        'admin_daily_report',
        params.welcomeMessage,
      ),
    });
  }
}
