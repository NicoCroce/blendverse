import { executeUseCase, IUseCase } from '@server/Application';
import { emailTemplates } from '@server/Infrastructure';
import { logger } from '@server/Infrastructure/utils/pino';
import { GetAdmins } from '@server/domains/Permissions/Application';
import { IDailyReportEmailSender } from '../../Domain/DailyReportEmailSender.port';
import {
  ISendReportEmail,
  ISendReportEmailInput,
  ISendReportEmailOutput,
} from '../dailyReport.types';

/**
 * Envía el email del reporte diario a todos los admins de la empresa.
 * Resuelve destinatarios vía GetAdmins (Permissions, cross-domain) y envía
 * usando el puerto DailyReportEmailSender (hexagonal: sin dependencia de
 * infraestructura en la capa Application).
 */
export class SendReportEmail implements IUseCase<
  ISendReportEmailOutput,
  ISendReportEmailInput
> {
  constructor(
    private readonly _getAdmins: GetAdmins,
    private readonly dailyReportEmailSender: IDailyReportEmailSender,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISendReportEmail): Promise<ISendReportEmailOutput> {
    const ownerId = requestContext.values.ownerId;

    const admins = await executeUseCase({
      useCase: this._getAdmins,
      requestContext,
    });

    if (!admins || admins.length === 0) {
      logger.warn(
        { ownerId },
        'No admins found for owner, skipping daily report email',
      );
      return { success: false };
    }

    const { subject, body } = emailTemplates.dailyReport(input.report.values);

    await this.dailyReportEmailSender.send({
      to: admins,
      subject,
      html: body,
    });

    return { success: true };
  }
}
