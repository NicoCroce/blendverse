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
import { ResolveEmailDeliveryPolicy } from '@server/domains/CompanyEmailSettings/Application';
import { REPORT_SECTION_CODES } from '@server/domains/CompanyEmailSettings/Domain';

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
    private readonly _resolveEmailDeliveryPolicy?: ResolveEmailDeliveryPolicy,
  ) {}

  async execute({
    requestContext,
    input,
  }: IGenerateDailyReport): Promise<IGenerateDailyReportOutput> {
    const policy = this._resolveEmailDeliveryPolicy
      ? await this._resolveEmailDeliveryPolicy.execute({
          input: { code: 'admin_daily_report' },
          requestContext,
        })
      : { enabled: true, selectedSections: [...REPORT_SECTION_CODES] };
    if (!policy.enabled) {
      return { report: undefined, skipped: true };
    }

    const selected = new Set(policy.selectedSections);
    const emptyList: never[] = [];
    const [
      employeesOnLeave,
      pendingLicenses,
      unsignedDocuments,
      pendingDisclaimers,
      upcomingVacations,
      expiringLicenses,
      statisticalSummary,
    ] = await Promise.all([
      selected.has('employees_on_leave_today')
        ? executeUseCase({
            useCase: this._getEmployeesOnLeaveToday,
            requestContext,
          }).then((section) => ({ section }))
        : Promise.resolve({ section: { items: emptyList, totalCount: 0 } }),
      selected.has('pending_licenses')
        ? executeUseCase({
            useCase: this._getPendingLicenses,
            requestContext,
          }).then((section) => ({ section }))
        : Promise.resolve({ section: { items: emptyList, totalCount: 0 } }),
      selected.has('unsigned_documents')
        ? executeUseCase({
            useCase: this._getUnsignedDocuments,
            requestContext,
          }).then((section) => ({ section }))
        : Promise.resolve({ section: { items: emptyList, totalCount: 0 } }),
      selected.has('pending_terms_acceptance')
        ? executeUseCase({
            useCase: this._getPendingDisclaimerAcceptances,
            requestContext,
          }).then((section) => ({ section }))
        : Promise.resolve({ section: { items: emptyList, totalCount: 0 } }),
      selected.has('upcoming_vacations')
        ? executeUseCase({
            useCase: this._getUpcomingVacations,
            requestContext,
          }).then((section) => ({ section }))
        : Promise.resolve({ section: { items: emptyList, totalCount: 0 } }),
      selected.has('expiring_licenses')
        ? executeUseCase({
            useCase: this._getExpiringLicenses,
            requestContext,
          }).then((section) => ({ section }))
        : Promise.resolve({ section: { items: emptyList, totalCount: 0 } }),
      selected.has('statistical_summary')
        ? executeUseCase({
            useCase: this._getStatisticalSummary,
            requestContext,
          })
        : Promise.resolve({
            section: {
              activeEmployees: 0,
              licensesInProgress: 0,
              pendingLicenses: 0,
              unsignedDocuments: 0,
              pendingDisclaimerAcceptances: 0,
            },
          }),
    ]);

    const report = DailyReport.create({
      ownerId: requestContext.values.ownerId,
      companyName: input?.companyName ?? '',
      date: todayISO(),
      sections: {
        employeesOnLeaveToday: {
          items: Array.isArray(employeesOnLeave.section)
            ? employeesOnLeave.section
            : employeesOnLeave.section.items,
          totalCount: Array.isArray(employeesOnLeave.section)
            ? employeesOnLeave.section.length
            : employeesOnLeave.section.totalCount,
        },
        pendingLicenses: {
          items: Array.isArray(pendingLicenses.section)
            ? pendingLicenses.section
            : pendingLicenses.section.items,
          totalCount: Array.isArray(pendingLicenses.section)
            ? pendingLicenses.section.length
            : pendingLicenses.section.totalCount,
        },
        unsignedDocuments: {
          items: Array.isArray(unsignedDocuments.section)
            ? unsignedDocuments.section
            : unsignedDocuments.section.items,
          totalCount: Array.isArray(unsignedDocuments.section)
            ? unsignedDocuments.section.length
            : unsignedDocuments.section.totalCount,
        },
        pendingDisclaimerAcceptances: {
          items: Array.isArray(pendingDisclaimers.section)
            ? pendingDisclaimers.section
            : pendingDisclaimers.section.items,
          totalCount: Array.isArray(pendingDisclaimers.section)
            ? pendingDisclaimers.section.length
            : pendingDisclaimers.section.totalCount,
        },
        upcomingVacations: {
          items: Array.isArray(upcomingVacations.section)
            ? upcomingVacations.section
            : upcomingVacations.section.items,
          totalCount: Array.isArray(upcomingVacations.section)
            ? upcomingVacations.section.length
            : upcomingVacations.section.totalCount,
        },
        expiringLicenses: {
          items: Array.isArray(expiringLicenses.section)
            ? expiringLicenses.section
            : expiringLicenses.section.items,
          totalCount: Array.isArray(expiringLicenses.section)
            ? expiringLicenses.section.length
            : expiringLicenses.section.totalCount,
        },
        statisticalSummary: statisticalSummary.section,
      },
      selectedSections: [...selected],
    });

    return { report, skipped: false };
  }
}
