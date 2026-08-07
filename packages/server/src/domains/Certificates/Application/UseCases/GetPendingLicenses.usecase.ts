import { IRequestContext, IUseCase } from '@server/Application';
import { CertificateRepository, IPendingLicenseRecord } from '../../Domain';

/**
 * Sección 2 del reporte diario: licencias pendientes de aprobación.
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class GetPendingLicenses implements IUseCase<IPendingLicenseRecord[]> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: IRequestContext): Promise<IPendingLicenseRecord[]> {
    return this.certificatesRepository.getPendingLicenses({ requestContext });
  }
}
