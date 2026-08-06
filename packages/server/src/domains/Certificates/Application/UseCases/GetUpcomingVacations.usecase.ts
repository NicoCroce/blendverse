import { IRequestContext, IUseCase } from '@server/Application';
import { CertificateRepository, IUpcomingVacationRecord } from '../../Domain';

/**
 * Sección 5 del reporte diario: vacaciones próximas (15 días).
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class GetUpcomingVacations implements IUseCase<
  IUpcomingVacationRecord[]
> {
  constructor(private readonly certificateRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: IRequestContext): Promise<IUpcomingVacationRecord[]> {
    return this.certificateRepository.getUpcomingVacations({ requestContext });
  }
}
