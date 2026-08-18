import { IRequestContext, IUseCase } from '@server/Application';
import { CertificateRepository, IExpiringLicenseRecord } from '../../Domain';

/**
 * Sección 6 del reporte diario: licencias que vencen esta semana.
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class GetExpiringLicenses implements IUseCase<IExpiringLicenseRecord[]> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: IRequestContext): Promise<IExpiringLicenseRecord[]> {
    return this.certificatesRepository.getExpiringLicenses({ requestContext });
  }
}
