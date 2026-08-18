import {
  AppError,
  executeUseCase,
  IRequestContext,
  normalizeDate,
  normalizeEndDate,
  parseDateOnly,
} from '@server/Application';
import { uploadImages } from '@server/Infrastructure';
import { Certificate } from '../Domain/Certificate.entity';
import {
  IAppendImages,
  IDeleteCertificate,
  IGetCertificates,
  IGetCertificatesByCompanyResponse,
  IGetCertificatesCompany,
  IGetCertificateTypes,
  IGetMonthlyStatisticsCertificates,
  IGetStatisticsCertificates,
  IUpdateCertificateStatus,
} from './certificates.types';
import {
  AddCertificate,
  AppendImages,
  DeleteCertificate,
  GetCertificates,
  GetCertificatesByCompany,
  GetCertificateTypes,
  GetMonthlyStatisticsCertificates,
  GetStatisticsCertificates,
  UpdateCertificateStatus,
} from './UseCases';
import {
  CertificateDTO,
  IGetCertificatesByCompanyDTO,
  IGetCertificatesDTO,
} from './DTO/CertificateDTO';
import { convertToDTO } from './digest';
import { NextFunction, Request, Response } from 'express';
import { SendEmailService } from '@server/Application/Services/SendEmail.service';

interface IAddCertificateService extends IRequestContext {
  input: {
    startDate: string;
    endDate: string;
    returnDate: string;
    type: number;
    reason: string;
    requiresRest: boolean;
  };
}

export class CertificatesServices {
  constructor(
    private readonly _getCertificates: GetCertificates,
    private readonly _getCertificateTypes: GetCertificateTypes,
    private readonly _addCertificate: AddCertificate,
    private readonly _appendImages: AppendImages,
    private readonly _getCertificatesByCompany: GetCertificatesByCompany,
    private readonly _getStatistisCertificates: GetStatisticsCertificates,
    private readonly _getMonthlyStatistisCertificates: GetMonthlyStatisticsCertificates,
    private readonly sendEmailService: SendEmailService,
    private readonly _deleteCertificate: DeleteCertificate,
    private readonly _updateCertificateStatus: UpdateCertificateStatus,
  ) {}

  async getCertificates({
    input,
    requestContext,
  }: IGetCertificates): Promise<IGetCertificatesDTO> {
    const certificates = await executeUseCase({
      useCase: this._getCertificates,
      input,
      requestContext,
    });

    // Convierte la respuesta del caso de uso en un objeto más simple.
    return Object.entries(certificates).reduce((response, [year, certs]) => {
      response[Number(year)] = certs.map((certificate: Certificate) =>
        convertToDTO(certificate),
      );

      return response;
    }, {} as IGetCertificatesDTO);
  }

  getCertificateTypes({ requestContext }: IGetCertificateTypes) {
    return executeUseCase({
      useCase: this._getCertificateTypes,
      requestContext,
    });
  }

  async addCertificate({
    input,
    requestContext,
  }: IAddCertificateService): Promise<CertificateDTO> {
    try {
      const _input = {
        ...input,
        startDate: normalizeDate(input.startDate),
        endDate: normalizeEndDate(input.endDate),
        returnDate: parseDateOnly(input.returnDate),
      };

      const certificate = await executeUseCase({
        useCase: this._addCertificate,
        input: _input,
        requestContext,
      });

      this.sendEmailService.addLincence({
        requestContext,
        certificate,
      });

      return convertToDTO(certificate);
    } catch (error) {
      throw new AppError(error as string);
    }
  }

  savefilesMiddleware(req: Request, res: Response, next: NextFunction) {
    const userId = req.requestContext.values.userId;
    uploadImages(userId)(req, res, next);
  }

  async saveFiles({ input, requestContext }: IAppendImages) {
    return await executeUseCase({
      useCase: this._appendImages,
      requestContext,
      input,
    });
  }

  async getCertificatesByCompany({
    input,
    requestContext,
  }: IGetCertificatesCompany): Promise<IGetCertificatesByCompanyDTO> {
    const certificates: IGetCertificatesByCompanyResponse =
      await executeUseCase({
        useCase: this._getCertificatesByCompany,
        input,
        requestContext,
      });

    // Convierte la respuesta del caso de uso en un objeto más simple.
    return Object.entries(certificates).reduce(
      (response, [userId, dataList]) => {
        response[Number(userId)] = {
          user: dataList.user,
          certificates: Object.entries(dataList.certificates).reduce(
            (certsObj, [year, certs]) => {
              certsObj[Number(year)] = (certs as Certificate[]).map(
                (certificate) => convertToDTO(certificate),
              );
              return certsObj;
            },
            {} as { [year: number]: CertificateDTO[] },
          ),
        };

        return response;
      },
      {} as IGetCertificatesByCompanyDTO,
    );
  }

  getStatisticsByCertificates({ requestContext }: IGetStatisticsCertificates) {
    return executeUseCase({
      useCase: this._getStatistisCertificates,
      requestContext,
    });
  }

  getMonthlyStatisticsByCertificates({
    requestContext,
    input,
  }: IGetMonthlyStatisticsCertificates) {
    return executeUseCase({
      useCase: this._getMonthlyStatistisCertificates,
      requestContext,
      input,
    });
  }

  async deleteCertificate({
    input,
    requestContext,
  }: IDeleteCertificate): Promise<void> {
    await executeUseCase({
      useCase: this._deleteCertificate,
      input,
      requestContext,
      inputLog: { id: input.id },
    });
  }

  async updateCertificateStatus({
    input,
    requestContext,
  }: IUpdateCertificateStatus): Promise<CertificateDTO> {
    const certificate = await executeUseCase({
      useCase: this._updateCertificateStatus,
      input,
      requestContext,
      inputLog: { id: input.id, status: input.status },
    });

    if (input.status === 'aprobado' || input.status === 'rechazado') {
      this.sendEmailService.notifyLicenseStatusChange({
        requestContext,
        certificate,
        newStatus: input.status,
      });
    }

    return convertToDTO(certificate);
  }
}
