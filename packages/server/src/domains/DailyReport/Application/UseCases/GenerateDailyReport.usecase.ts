import { executeUseCase, IUseCase } from '@server/Application';
import {
  GetEmployeesOnLeaveToday,
  GetExpiringLicenses,
  GetPendingLicenses,
  GetUpcomingVacations,
} from '@server/domains/Certificates/Application';
import { GetUnsignedDocuments } from '@server/domains/Documents/Application';
import { GetPendingDisclaimerAcceptances } from '@server/domains/Disclaimer/Application';
import { DailyReport } from '../../Domain/DailyReport.entity';
import {
  IGenerateDailyReport,
  IGenerateDailyReportInput,
  IGenerateDailyReportOutput,
} from '../dailyReport.types';
import { GetStatisticalSummary } from './GetStatisticalSummary.usecase';

const todayISO = () => new Date().toISOString().split('T')[0];

/**
 * Orquestador completo (US8 / T060): ejecuta los 7 use cases de secciones
 * en paralelo y ensambla el DailyReport para una empresa. Los use cases de
 * sección pertenecen a los dominios dueños de los datos (cross-domain) o al
 * resumen estadístico propio del dominio.
 */
export class GenerateDailyReport implements IUseCase<
  IGenerateDailyReportOutput,
  IGenerateDailyReportInput
> {
  constructor(
    private readonly _getEmployeesOnLeaveToday: GetEmployeesOnLeaveToday,
    private readonly _getPendingLicenses: GetPendingLicenses,
    private readonly _getUnsignedDocuments: GetUnsignedDocuments,
    private readonly _getPendingDisclaimerAcceptances: GetPendingDisclaimerAcceptances,
    private readonly _getUpcomingVacations: GetUpcomingVacations,
    private readonly _getExpiringLicenses: GetExpiringLicenses,
    private readonly _getStatisticalSummary: GetStatisticalSummary,
  ) {}

  async execute({
    requestContext,
    input,
  }: IGenerateDailyReport): Promise<IGenerateDailyReportOutput> {
    const [
      employeesOnLeave,
      pendingLicenses,
      unsignedDocuments,
      pendingDisclaimers,
      upcomingVacations,
      expiringLicenses,
      statisticalSummary,
    ] = await Promise.all([
      executeUseCase({
        useCase: this._getEmployeesOnLeaveToday,
        requestContext,
      }),
      executeUseCase({ useCase: this._getPendingLicenses, requestContext }),
      executeUseCase({ useCase: this._getUnsignedDocuments, requestContext }),
      executeUseCase({
        useCase: this._getPendingDisclaimerAcceptances,
        requestContext,
      }),
      executeUseCase({ useCase: this._getUpcomingVacations, requestContext }),
      executeUseCase({ useCase: this._getExpiringLicenses, requestContext }),
      executeUseCase({ useCase: this._getStatisticalSummary, requestContext }),
    ]);

    const report = DailyReport.create({
      ownerId: requestContext.values.ownerId,
      companyName: input?.companyName ?? '',
      date: todayISO(),
      sections: {
        employeesOnLeaveToday: {
          items: employeesOnLeave,
          totalCount: employeesOnLeave.length,
        },
        pendingLicenses: {
          items: pendingLicenses,
          totalCount: pendingLicenses.length,
        },
        unsignedDocuments: {
          items: unsignedDocuments,
          totalCount: unsignedDocuments.length,
        },
        pendingDisclaimerAcceptances: {
          items: pendingDisclaimers,
          totalCount: pendingDisclaimers.length,
        },
        upcomingVacations: {
          items: upcomingVacations,
          totalCount: upcomingVacations.length,
        },
        expiringLicenses: {
          items: expiringLicenses,
          totalCount: expiringLicenses.length,
        },
        statisticalSummary: statisticalSummary.section,
      },
    });

    return { report };
  }
}
