import {
  executeUseCase,
  IRequestContext,
  RequestContext,
} from '@server/Application';
import { logger } from '@server/Infrastructure/utils/pino';
import { GetAllActiveOwners } from '@server/domains/Users/Application';
import { GenerateDailyReport } from './UseCases/GenerateDailyReport.usecase';
import { SendReportEmail } from './UseCases/SendReportEmail.usecase';
import { ISendDailyReportOutput } from './dailyReport.types';

/**
 * Orquesta la generación y el envío del reporte diario para todas las
 * empresas activas. Resiliencia multi-tenant (FR-012): un fallo en una
 * empresa no bloquea el envío a las demás. Logging con ownerId (FR-013).
 */
export class DailyReportService {
  constructor(
    private readonly _getAllActiveOwners: GetAllActiveOwners,
    private readonly _generateDailyReport: GenerateDailyReport,
    private readonly _sendReportEmail: SendReportEmail,
  ) {}

  async sendDailyReport({
    requestContext,
  }: IRequestContext): Promise<ISendDailyReportOutput> {
    const owners = await executeUseCase({
      useCase: this._getAllActiveOwners,
      requestContext,
    });

    if (owners.length === 0) {
      logger.info('No active companies to process for daily report');
    }

    let sent = 0;
    let failed = 0;

    for (const owner of owners) {
      try {
        // RequestContext sintético por empresa (no hay usuario autenticado)
        const ownerContext = new RequestContext(
          0,
          `daily-report-${owner.id}-${Date.now()}`,
          owner.id,
        );

        const { report } = await executeUseCase({
          useCase: this._generateDailyReport,
          input: { companyName: owner.denominacion },
          requestContext: ownerContext,
        });

        const { success } = await executeUseCase({
          useCase: this._sendReportEmail,
          input: { report },
          requestContext: ownerContext,
        });

        if (success) {
          sent++;
        }
      } catch (error) {
        failed++;
        logger.error(
          { ownerId: owner.id, error },
          'Failed to generate/send daily report',
        );
      }
    }

    return { sent, failed, total: owners.length };
  }
}
