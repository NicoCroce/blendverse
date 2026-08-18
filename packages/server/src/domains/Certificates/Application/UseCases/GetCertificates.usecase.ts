import { IUseCase } from '@server/Application';
import { CertificateRepository } from '../../Domain/Certificate.respository';
import {
  IGetCertificates,
  IGetCertificatesResponse,
} from '../certificates.types';

export class GetCertificates implements IUseCase<IGetCertificatesResponse> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    input: filters,
    requestContext,
  }: IGetCertificates): Promise<IGetCertificatesResponse> {
    const certificates = await this.certificatesRepository.getCertificates({
      filters,
      requestContext,
    });

    // recibe todos los certificados ordenados for fecha
    const orderedCertificates = certificates.reduce((response, certificate) => {
      const year = new Date(certificate.values.startDate).getFullYear();

      response[year] = response[year] ?? [];
      response[year].push(certificate);

      return response;
    }, {} as IGetCertificatesResponse);

    return orderedCertificates;
  }
}
