import { AppError, IUseCase } from '@server/Application';
import { CertificateRepository } from '../../Domain/Certificate.respository';
import { IAddCertificate } from '../certificates.types';
import { Certificate } from '../../Domain/Certificate.entity';
import { CertificateTypes } from '../../Domain/CertificateTypes.entity';

export class AddCertificate implements IUseCase<Certificate> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    input: { type, startDate, endDate, returnDate, reason, requiresRest },
    requestContext,
  }: IAddCertificate): Promise<Certificate> {
    try {
      const certificate = await this.certificatesRepository.addCertificate({
        certificate: Certificate.create({
          type: CertificateTypes.create({ id: type }),
          startDate,
          endDate,
          returnDate,
          reason,
          requiresRest,
        }),
        requestContext,
      });

      return certificate;
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : String(error),
        400,
      );
    }
  }
}
