import { AppError, IRequestContext, IUseCase } from '@server/Application';
import { DisclaimerRepository } from '../../Domain';
import { GetCurrentTermsVersion } from '@server/domains/CompanyEmailSettings/Application';

/**
 * Conteo de empleados que no aceptaron los términos (sección 7 del reporte
 * diario). Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class CountPendingDisclaimers implements IUseCase<number> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly _getCurrentTermsVersion?: GetCurrentTermsVersion,
  ) {}

  async execute({ requestContext }: IRequestContext): Promise<number> {
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
    return this.disclaimerRepository.countPendingDisclaimers({
      termsVersionId: currentTerms.id,
      requestContext,
    });
  }
}
