import { IUseCase } from '@server/Application';
import { IGetCertificateTypes } from '../certificates.types';
import { CertificateRepository } from '../../Domain/Certificate.respository';
import { CertificateTypes } from '../../Domain/CertificateTypes.entity';

export class GetCertificateTypes implements IUseCase<CertificateTypes[]> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    requestContext,
  }: IGetCertificateTypes): Promise<CertificateTypes[]> {
    const certificateTypes =
      await this.certificatesRepository.getCertificatesTypes({
        requestContext,
      });

    return certificateTypes;
  }
}
