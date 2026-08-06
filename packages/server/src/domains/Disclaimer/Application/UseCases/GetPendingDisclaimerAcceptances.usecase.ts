import { IRequestContext, IUseCase } from '@server/Application';
import {
  DisclaimerRepository,
  IPendingDisclaimerAcceptanceRecord,
} from '../../Domain';

/**
 * Sección 4 del reporte diario: empleados que no aceptaron los términos.
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class GetPendingDisclaimerAcceptances implements IUseCase<
  IPendingDisclaimerAcceptanceRecord[]
> {
  constructor(private readonly disclaimerRepository: DisclaimerRepository) {}

  async execute({
    requestContext,
  }: IRequestContext): Promise<IPendingDisclaimerAcceptanceRecord[]> {
    return this.disclaimerRepository.getEmployeesWithoutDisclaimerAcceptance({
      requestContext,
    });
  }
}
