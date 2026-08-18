import { AppError, IRequestContext, IUseCase } from '@server/Application';
import {
  DisclaimerRepository,
  IPendingDisclaimerAcceptanceRecord,
} from '../../Domain';
import { GetCurrentTermsVersion } from '@server/domains/CompanyEmailSettings/Application';

/**
 * Sección 4 del reporte diario: empleados que no aceptaron los términos.
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class GetPendingDisclaimerAcceptances implements IUseCase<
  IPendingDisclaimerAcceptanceRecord[]
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly _getCurrentTermsVersion?: GetCurrentTermsVersion,
  ) {}

  async execute({
    requestContext,
  }: IRequestContext): Promise<IPendingDisclaimerAcceptanceRecord[]> {
    const currentTerms = await this._getCurrentTermsVersion?.execute({
      requestContext,
    });
    if (!currentTerms) {
      throw new AppError(
        'Los términos vigentes no están disponibles',
        409,
        'STALE_TERMS_VERSION',
      );
    }
    return this.disclaimerRepository.getEmployeesWithoutDisclaimerAcceptance({
      termsVersionId: currentTerms.id,
      requestContext,
    });
  }
}
