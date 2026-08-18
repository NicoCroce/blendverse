import { AppError, IUseCase } from '@server/Application';
import { IGetMonthlyStatisticsCertificates } from '../certificates.types';
import { IGetMonthlyStatisticsCertificatesResponse } from '../../Domain/Certificate.types';
import { CertificateRepository } from '../../Domain/Certificate.respository';

export class GetMonthlyStatisticsCertificates implements IUseCase<IGetMonthlyStatisticsCertificatesResponse> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    requestContext,
    input,
  }: IGetMonthlyStatisticsCertificates): Promise<IGetMonthlyStatisticsCertificatesResponse> {
    try {
      return await this.certificatesRepository.getMonthlyStatisticsCertificates(
        {
          requestContext,
          year: input?.year,
        },
      );
    } catch (error) {
      throw new AppError(
        `Error en estadísticas mensuales para certificados: ${error}`,
      );
    }
  }
}
