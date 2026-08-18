import { AppError, IUseCase } from '@server/Application';
import { IGetStatisticsCertificates } from '../certificates.types';
import { IGetStatisticsCertificatesResponse } from '../../Domain/Certificate.types';
import { CertificateRepository } from '../../Domain/Certificate.respository';

export class GetStatisticsCertificates implements IUseCase<IGetStatisticsCertificatesResponse> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: IGetStatisticsCertificates): Promise<IGetStatisticsCertificatesResponse> {
    try {
      return await this.certificatesRepository.getStatisticsCertificates({
        requestContext,
      });
    } catch (error) {
      throw new AppError(`Error en estadísticas para certificados: ${error}`);
    }
  }
}
