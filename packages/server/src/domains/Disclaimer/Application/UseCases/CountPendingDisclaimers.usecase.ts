import { IRequestContext, IUseCase } from '@server/Application';
import { DisclaimerRepository } from '../../Domain';

/**
 * Conteo de empleados que no aceptaron los términos (sección 7 del reporte
 * diario). Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class CountPendingDisclaimers implements IUseCase<number> {
  constructor(private readonly disclaimerRepository: DisclaimerRepository) {}

  async execute({ requestContext }: IRequestContext): Promise<number> {
    return this.disclaimerRepository.countPendingDisclaimers({
      requestContext,
    });
  }
}
