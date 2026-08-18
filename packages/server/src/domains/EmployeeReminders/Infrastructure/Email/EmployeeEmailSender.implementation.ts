import {
  applyInstitutionalWelcome,
  emailTemplates,
  MailNotificationService,
} from '@server/Infrastructure';
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
    requestContext: {
      readonly values: { readonly ownerId: number; readonly userId: number };
    };
  }): Promise<void> {
    const { requestContext: _requestContext, ...notification } = params;
    await this.mailNotificationService.sendOne(notification);
  }

  async sendReminder(params: {
    to: string[];
    reminder: Parameters<typeof emailTemplates.employeeDailyReminder>[0];
    welcomeMessage: string | null;
    requestContext: {
      readonly values: { readonly ownerId: number; readonly userId: number };
    };
  }): Promise<void> {
    const { subject, body } = emailTemplates.employeeDailyReminder(
      params.reminder,
    );
    await this.mailNotificationService.sendOne({
      to: params.to,
      subject,
      html: applyInstitutionalWelcome(
        body,
        'employee_daily_reminder',
        params.welcomeMessage,
      ),
    });
  }

  async sendNewDocument(params: {
    to: string[];
    employeeName: string;
    companyName: string;
    documents: Array<{ documentId: number; documentTitle: string }>;
    welcomeMessage: string | null;
    requestContext: {
      readonly values: { readonly ownerId: number; readonly userId: number };
    };
  }): Promise<void> {
    const { subject, body } = emailTemplates.newDocumentNotification({
      employeeName: params.employeeName,
      companyName: params.companyName,
      documents: params.documents,
    });
    await this.mailNotificationService.sendOne({
      to: params.to,
      subject,
      html: applyInstitutionalWelcome(
        body,
        'employee_document_assigned',
        params.welcomeMessage,
      ),
    });
  }
}
