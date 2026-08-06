import { asClass } from 'awilix';
import { container } from '@server/Infrastructure/di/Container';
import {
  DailyReportService,
  GenerateDailyReport,
  GenerateDailyReportStub,
  GetStatisticalSummary,
  SendReportEmail,
} from './Application';
import { DailyReportController } from './Infrastructure/Controllers';
import { DailyReportEmailSenderImplementation } from './Infrastructure/Email';
import { DailyReportScheduler } from './Infrastructure/Scheduler';

/**
 * Registro Awilix del dominio DailyReport.
 *
 * Los use cases de sección NO se re-registran aquí: se resuelven desde los
 * contenedores de sus dominios dueños (Users, Certificates, Documents,
 * Disclaimer, Permissions) usando los keys `_getX`/`_countX` que exponen,
 * tal como exige el patrón cross-domain del proyecto.
 */
export const dailyReportApp = {
  dailyReportService: asClass(DailyReportService),
  dailyReportController: asClass(DailyReportController),
  dailyReportScheduler: asClass(DailyReportScheduler),
  dailyReportEmailSender: asClass(DailyReportEmailSenderImplementation),
  _generateDailyReport: asClass(GenerateDailyReport),
  _generateDailyReportStub: asClass(GenerateDailyReportStub),
  _sendReportEmail: asClass(SendReportEmail),
  _getStatisticalSummary: asClass(GetStatisticalSummary),
};

export const dailyReportController = () =>
  container.resolve<DailyReportController>('dailyReportController');

export const dailyReportScheduler = () =>
  container.resolve<DailyReportScheduler>('dailyReportScheduler');
