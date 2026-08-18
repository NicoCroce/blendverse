import { executeUseCase, IUseCase } from '@server/Application';
import { ResolveEmailDeliveryPolicy } from '@server/domains/CompanyEmailSettings/Application';
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
    private readonly dailyReportEmailSender: IDailyReportEmailSender,
    private readonly _resolveEmailDeliveryPolicy: ResolveEmailDeliveryPolicy,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISendReportEmail): Promise<ISendReportEmailOutput> {
    const policy = await executeUseCase({
      useCase: this._resolveEmailDeliveryPolicy,
      input: { code: 'admin_daily_report' },
      requestContext,
    });

    if (!policy.enabled || policy.recipients.length === 0) {
      return { success: false };
    }

    await this.dailyReportEmailSender.send({
      to: policy.recipients,
      report: input.report,
      welcomeMessage: policy.welcomeMessage,
      requestContext,
    });

    return { success: true };
  }
}
