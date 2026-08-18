import { executeUseCase, IRequestContext, IUseCase } from '@server/Application';
import { CountActiveEmployees } from '@server/domains/Users/Application';
import {
  CountLicensesInProgress,
  CountPendingLicenses,
} from '@server/domains/Certificates/Application';
import { CountUnsignedDocuments } from '@server/domains/Documents/Application';
import { CountPendingDisclaimers } from '@server/domains/Disclaimer/Application';
import { IGetStatisticalSummaryOutput } from '../dailyReport.types';

/**
 * Sección 7: resumen estadístico con 5 totales clave para la empresa.
 * Se compone únicamente de use cases expuestos por los dominios dueños
 * de los datos (cross-domain vía inyección de dependencia).
 */
export class GetStatisticalSummary implements IUseCase<IGetStatisticalSummaryOutput> {
  constructor(
    private readonly _countActiveEmployees: CountActiveEmployees,
    private readonly _countLicensesInProgress: CountLicensesInProgress,
    private readonly _countPendingLicenses: CountPendingLicenses,
    private readonly _countUnsignedDocuments: CountUnsignedDocuments,
    private readonly _countPendingDisclaimers: CountPendingDisclaimers,
  ) {}

  async execute({
    requestContext,
  }: IRequestContext): Promise<IGetStatisticalSummaryOutput> {
    const [
      activeEmployees,
      licensesInProgress,
      pendingLicenses,
      unsignedDocuments,
      pendingDisclaimerAcceptances,
    ] = await Promise.all([
      executeUseCase({ useCase: this._countActiveEmployees, requestContext }),
      executeUseCase({
        useCase: this._countLicensesInProgress,
        requestContext,
      }),
      executeUseCase({ useCase: this._countPendingLicenses, requestContext }),
      executeUseCase({ useCase: this._countUnsignedDocuments, requestContext }),
      executeUseCase({
        useCase: this._countPendingDisclaimers,
        requestContext,
      }),
    ]);

    return {
      section: {
        activeEmployees,
        licensesInProgress,
        pendingLicenses,
        unsignedDocuments,
        pendingDisclaimerAcceptances,
      },
    };
  }
}
