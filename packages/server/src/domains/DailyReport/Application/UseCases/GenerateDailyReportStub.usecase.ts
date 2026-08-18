import { IUseCase } from '@server/Application';
import {
  IGenerateDailyReport,
  IGenerateDailyReportInput,
  IGenerateDailyReportOutput,
} from '../dailyReport.types';
import { DailyReport } from '../../Domain/DailyReport.entity';

const todayISO = () => new Date().toISOString().split('T')[0];

const emptySection = () => ({ items: [], totalCount: 0 });

/**
 * Orquestador stub (US1 / MVP): genera un reporte con las 7 secciones
 * vacías. Permite entregar el envío programado antes de que existan los
 * use cases de secciones. Reemplazado por GenerateDailyReport (US8).
 */
export class GenerateDailyReportStub implements IUseCase<
  IGenerateDailyReportOutput,
  IGenerateDailyReportInput
> {
  async execute({
    requestContext,
    input,
  }: IGenerateDailyReport): Promise<IGenerateDailyReportOutput> {
    const report = DailyReport.create({
      ownerId: requestContext.values.ownerId,
      companyName: input?.companyName ?? '',
      date: todayISO(),
      sections: {
        employeesOnLeaveToday: emptySection(),
        pendingLicenses: emptySection(),
        unsignedDocuments: emptySection(),
        pendingDisclaimerAcceptances: emptySection(),
        upcomingVacations: emptySection(),
        expiringLicenses: emptySection(),
        statisticalSummary: {
          activeEmployees: 0,
          licensesInProgress: 0,
          pendingLicenses: 0,
          unsignedDocuments: 0,
          pendingDisclaimerAcceptances: 0,
        },
      },
    });

    return { report };
  }
}
