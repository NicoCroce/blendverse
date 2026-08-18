import { IRequestContext, IUseCase } from '@server/Application';
import { CertificateRepository } from '../../Domain';

/**
 * Conteo de licencias aprobadas en curso (sección 7 del reporte diario).
 * Consumido por el dominio DailyReport vía inyección de dependencia.
 */
export class CountLicensesInProgress implements IUseCase<number> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({ requestContext }: IRequestContext): Promise<number> {
    return this.certificatesRepository.countLicensesInProgress({
      requestContext,
    });
  }
}
