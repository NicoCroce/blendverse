import { Certificate } from '@server/domains/Certificates';
import { GetUser } from '@server/domains/Users';
import { executeUseCase } from '../Adapters';
import { getDateString } from '../Utils';
import { emailTemplates } from '@server/Infrastructure';
import { loggerContext } from '@server/Infrastructure/utils/pino';
import { IEmailNotificationPort, IRequestContext } from '../Interfaces';
import { RequestContext } from '../Entities';
import { ResolveEmailDeliveryPolicy } from '@server/domains/CompanyEmailSettings/Application';
import type { EmailCatalogCode } from '@server/domains/CompanyEmailSettings/Domain';

interface IAddLicense extends IRequestContext {
  certificate: Certificate;
}

interface ISignDocument extends IRequestContext {
  documentId: number;
  agreement: boolean;
  reasonSignatureNonConformity: string | null;
}

interface ISendEmailsToAdmin<Targs> extends IRequestContext {
  templateFn: (args: Targs) => { body: string; subject: string };
  templateArgs: Targs;
  code: EmailCatalogCode;
}

interface ISendDocumentToEmail extends IRequestContext {
  documentId: number;
  documentTitle: string;
  pdfBuffer: Buffer;
}

interface INotifyLicenseStatusChange extends IRequestContext {
  certificate: Certificate;
  newStatus: 'aprobado' | 'rechazado';
}

export class SendEmailService {
  constructor(
    private readonly _getUser: GetUser,
    private readonly emailNotificationPort: IEmailNotificationPort,
    private readonly _resolveEmailDeliveryPolicy: ResolveEmailDeliveryPolicy,
  ) {}

  private async getCurrentUser(requestContext: RequestContext) {
    return await executeUseCase({
      useCase: this._getUser,
      requestContext,
      input: requestContext.values.userId,
    });
  }

  private async sendEmailToAdmins<Targs>({
    requestContext,
    templateFn,
    templateArgs,
    code,
  }: ISendEmailsToAdmin<Targs>) {
    try {
      const currentUser = await this.getCurrentUser(requestContext);
      const policy = await executeUseCase({
        useCase: this._resolveEmailDeliveryPolicy,
        input: { code },
        requestContext,
      });

      if (policy.enabled && policy.recipients.length > 0) {
        const { body, subject } = templateFn({
          ...templateArgs,
          currentUser:
            `${currentUser.values.name} ${currentUser.values.surname ?? ''}`.trim(),
        });
        await this.emailNotificationPort.sendOne({
          to: policy.recipients,
          subject,
          html: body,
          code,
          welcomeMessage: policy.welcomeMessage,
        });
      }
    } catch (error) {
      loggerContext(requestContext.values).error(
        error,
        'Failed to send email to admins',
      );
    }
  }

  async addLincence({ certificate, requestContext }: IAddLicense) {
    await this.sendEmailToAdmins({
      requestContext,
      templateFn: emailTemplates.addLicense,
      templateArgs: {
        reason: certificate.values.reason,
        currentUser: '',
      },
      code: 'admin_license_created',
    });
  }

  async sendDocumentToEmail({
    documentId,
    documentTitle,
    pdfBuffer,
    requestContext,
  }: ISendDocumentToEmail) {
    try {
      const currentUser = await this.getCurrentUser(requestContext);

      const policy = await executeUseCase({
        useCase: this._resolveEmailDeliveryPolicy,
        input: { code: 'requester_document_manual' },
        requestContext,
      });
      if (!policy.enabled) return;

      await this.emailNotificationPort.sendOne({
        to: currentUser.values.mail,
        subject: `Documento: ${documentTitle}`,
        html: `<p>Adjunto encontrará el documento <strong>${documentTitle}</strong> (ID: ${documentId}).</p>`,
        code: 'requester_document_manual',
        welcomeMessage: policy.welcomeMessage,
        attachments: [
          {
            filename: `${documentTitle}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error) {
      loggerContext(requestContext.values).error(
        error,
        'Failed to send document to email',
      );
    }
  }

  async signDocument({
    documentId,
    agreement,
    reasonSignatureNonConformity,
    requestContext,
  }: ISignDocument) {
    try {
      const currentUser = await this.getCurrentUser(requestContext);
      const employeePolicy = await executeUseCase({
        useCase: this._resolveEmailDeliveryPolicy,
        input: { code: 'employee_document_signed' },
        requestContext,
      });
      const adminPolicy = await executeUseCase({
        useCase: this._resolveEmailDeliveryPolicy,
        input: { code: 'admin_document_signed' },
        requestContext,
      });

      const employeeName =
        `${currentUser.values.name} ${currentUser.values.surname ?? ''}`.trim();

      // Enviar al empleado que firmó
      const employeeTemplate = emailTemplates.documentSignedEmployee({
        employeeName,
        documentId,
        agreement,
        reasonSignatureNonConformity,
      });

      if (employeePolicy.enabled) {
        await this.emailNotificationPort.sendOne({
          to: currentUser.values.mail,
          subject: employeeTemplate.subject,
          html: employeeTemplate.body,
          code: 'employee_document_signed',
          welcomeMessage: employeePolicy.welcomeMessage,
        });
      }

      // Enviar a los admins
      if (adminPolicy.enabled && adminPolicy.recipients.length > 0) {
        const adminTemplate = emailTemplates.documentSignedAdmin({
          employeeName,
          documentId,
          agreement,
          reasonSignatureNonConformity,
        });

        await this.emailNotificationPort.sendOne({
          to: adminPolicy.recipients,
          subject: adminTemplate.subject,
          html: adminTemplate.body,
          code: 'admin_document_signed',
          welcomeMessage: adminPolicy.welcomeMessage,
        });
      }
    } catch (error) {
      loggerContext(requestContext.values).error(
        error,
        'Failed to send document signing email',
      );
    }
  }

  async notifyLicenseStatusChange({
    certificate,
    newStatus,
    requestContext,
  }: INotifyLicenseStatusChange) {
    try {
      const employee = await executeUseCase({
        useCase: this._getUser,
        requestContext,
        input: certificate.userId!,
      });

      const reviewer = await this.getCurrentUser(requestContext);

      const reviewerName =
        `${reviewer.values.name} ${reviewer.values.surname ?? ''}`.trim();
      const employeeName =
        `${employee.values.name} ${employee.values.surname ?? ''}`.trim();

      const { startDate, endDate, returnDate, reason, type } =
        certificate.values;

      const { body, subject } = emailTemplates.licenseStatusChange({
        employeeName,
        reviewerName,
        licenseType: type.values.name ?? '',
        startDate: getDateString(startDate),
        endDate: getDateString(endDate),
        returnDate: getDateString(returnDate),
        reason,
        status: newStatus,
      });

      const policy = await executeUseCase({
        useCase: this._resolveEmailDeliveryPolicy,
        input: { code: 'employee_license_status_changed' },
        requestContext,
      });
      if (!policy.enabled) return;

      await this.emailNotificationPort.sendOne({
        to: employee.values.mail,
        subject,
        html: body,
        code: 'employee_license_status_changed',
        welcomeMessage: policy.welcomeMessage,
      });
    } catch (error) {
      loggerContext(requestContext.values).error(
        error,
        'Failed to send license status change email to employee',
      );
    }
  }
}
