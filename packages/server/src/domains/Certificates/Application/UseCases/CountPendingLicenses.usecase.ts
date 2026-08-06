import { IRequestContext, IUseCase } from '@server/Application';
import { CertificateRepository } from '../../Domain';

/**
 * Conteo de licencias pendientes de aprobación (sección 7 del reporte diario).
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class CountPendingLicenses implements IUseCase<number> {
  constructor(private readonly certificateRepository: CertificateRepository) {}

  async execute({ requestContext }: IRequestContext): Promise<number> {
    return this.certificateRepository.countPendingLicenses({ requestContext });
  }
}
