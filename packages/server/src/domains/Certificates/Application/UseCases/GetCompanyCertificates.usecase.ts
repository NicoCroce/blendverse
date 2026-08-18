import { AppError, IUseCase } from '@server/Application';
import { CertificateRepository } from '../../Domain/Certificate.respository';
import {
  IGetCertificatesByCompanyResponse,
  IGetCertificatesCompany,
} from '../certificates.types';
import { Certificate } from '../../Domain/Certificate.entity';

export class GetCertificatesByCompany implements IUseCase<IGetCertificatesByCompanyResponse> {
  constructor(private readonly certificatesRepository: CertificateRepository) {}

  async execute({
    input: filters,
    requestContext,
  }: IGetCertificatesCompany): Promise<IGetCertificatesByCompanyResponse> {
    const certificates =
      await this.certificatesRepository.getAllCompanyCertificates({
        filters,
        requestContext,
      });

    if (!certificates) {
      throw new AppError('Error al obtener los documentos');
    }

    try {
      const certificatesByUser = certificates.reduce(
        (res: IGetCertificatesByCompanyResponse, cert) => {
          const {
            userId,
            id,
            endDate,
            reason,
            startDate,
            type,
            userName,
            files,
          } = cert;
          if (!userId) return res;

          const year = new Date(startDate).getFullYear();

          if (!res[userId]) {
            res[userId] = {
              user: userName,
              certificates: {
                [year]: [],
              },
            };
          }

          if (!res[userId].certificates[year])
            res[userId].certificates[year] = [];

          res[userId].certificates[year].push(
            Certificate.create({
              id,
              startDate,
              endDate,
              returnDate: cert.returnDate ?? endDate,
              reason,
              type,
              userId,
              requiresRest: cert.requiresRest ?? false,
              status: cert.status,
              files,
            }),
          );

          return res;
        },
        {},
      );

      return certificatesByUser;
    } catch (err) {
      throw new AppError(`Error al obtener licencias: ${err}`);
    }
  }
}
